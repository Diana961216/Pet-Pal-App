const express = require('express');
const router = express.Router();
const { getPetfinderToken } = require('../utils/getPetFinderToken');
const ApiApplication = require('../models/apiApplication');
const isSignedIn = require('../middleware/is-signed-in');

router.get('/', async (req, res) => {
  try {
    const token = await getPetfinderToken();
    const type = req.query.type || '';
    const location = req.query.location || '33126';
    const breed = req.query.breed || '';
    const page = parseInt(req.query.page) || 1;

    let url = `https://api.petfinder.com/v2/animals?location=${location}&distance=100&limit=24&page=${page}`;
    if (type) url += `&type=${type}`;
    if (type && breed) url += `&breed=${encodeURIComponent(breed)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    res.render('explore/index.ejs', {
      pets: data.animals || [],
      user: req.session.user,
      type,
      location,
      breed,
      currentPage: page,
      totalPages: data.pagination?.total_pages || 1
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

    res.render('explore/show.ejs', { pet, user: req.session.user });
  } catch (err) {
    console.error(err);
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
