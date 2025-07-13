const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const { getPetfinderToken } = require('../utils/getPetFinderToken');
const { getBreeds } = require('../utils/getBreeds');
const ApiApplication = require('../models/apiApplication');
const isSignedIn = require('../middleware/is-signed-in');

router.get('/', async (req, res) => {
  try {
    const { type = '', location = '33126', breed = '', page = 1 } = req.query;
    const breeds = type ? await getBreeds(type) : [];

    const token = await getPetfinderToken();
    let url = `https://api.petfinder.com/v2/animals?location=${location}&distance=100&limit=24&page=${page}`;
    if (type) url += `&type=${type}`;
    if (breed) url += `&breed=${encodeURIComponent(breed)}`;

    const pfRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const pfData = await pfRes.json();
    const apiPets = pfData.animals || [];

    const dbPets = await Pet.find(
      req.session.user ? { owner: { $ne: req.session.user._id } } : {}
    ).populate('owner');

    const internalPets = dbPets.map(p => ({ ...p.toObject(), isInternal: true }));

    res.render('explore/index.ejs', {
      pets: [...apiPets, ...internalPets],
      user: req.session.user,
      type,
      location,
      breed,
      breeds,
      currentPage: parseInt(page),
      totalPages: pfData.pagination?.total_pages || 1
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/:petId', async (req, res) => {
  try {
    const token = await getPetfinderToken();
    const response = await fetch(`https://api.petfinder.com/v2/animals/${req.params.petId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    const pet = data.animal;

    if (!pet) {
      req.flash('error', 'Pet not found or no longer available.');
      return res.redirect('/explore');
    }

    res.render('explore/show.ejs', { pet, user: req.session.user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/explore');
  }
});

router.get('/:petId/adopt', isSignedIn, async (req, res) => {
  try {
    const token = await getPetfinderToken();
    const response = await fetch(`https://api.petfinder.com/v2/animals/${req.params.petId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    const pet = data.animal;

    if (!pet) return res.redirect('/explore');

    res.render('applications/new.ejs', {
      user: req.session.user,
      pet,
      isApiPet: true
    });
  } catch (err) {
    console.error(err);
    res.redirect('/explore');
  }
});

router.post('/:petId/adopt', isSignedIn, async (req, res) => {
  try {
    const existing = await ApiApplication.findOne({
      user: req.session.user._id,
      petId: req.params.petId
    });

    if (existing) {
      req.flash('error', 'You have already submitted an application for this pet.');
      return res.redirect(`/explore/${req.params.petId}`);
    }

    await ApiApplication.create({
      user: req.session.user._id,
      petId: req.params.petId,
      petName: req.body.petName || '',
      message: req.body.message
    });

    req.flash('success', 'Your adoption inquiry was submitted! We’ll contact you if eligible.');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong submitting your request.');
    res.redirect(`/explore/${req.params.petId}`);
  }
});

module.exports = router;
