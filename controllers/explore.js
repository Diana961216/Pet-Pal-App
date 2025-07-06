const express = require('express');
const router = express.Router();
const { getPetfinderToken } = require('../utils/getPetFinderToken');

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

router.get('/:petId/adopt', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  res.send(`(Future) Start adoption process for API pet ${req.params.petId}`);
});

module.exports = router;
