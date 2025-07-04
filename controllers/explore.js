const express = require('express');
const router = express.Router();
const { getPetfinderToken } = require('../utils/getPetFinderToken');

router.get('/', async (req, res) => {
  try {
    const token = await getPetfinderToken();
    const type = req.query.type || '';
    const location = req.query.location || '33126';

    let url = `https://api.petfinder.com/v2/animals?location=${location}&distance=100&limit=20`;
    if (type) url += `&type=${type}`;

    console.log('Explore API call:', url);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    res.render('explore/index.ejs', {
      pets: data.animals || [],
      user: req.session.user,
      type,
      location
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
