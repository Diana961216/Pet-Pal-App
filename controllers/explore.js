const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { getPetfinderToken } = require('../utils/getPetFinderToken');

router.get('/', async (req, res) => {
  try {
    const token = await getPetfinderToken();
    const response = await fetch(`https://api.petfinder.com/v2/animals?type=${type}&location=${location}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    res.render('explore/index.ejs', { pets: data.animals });
   } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;