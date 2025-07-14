const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const User = require('../models/user');
const Pet = require('../models/pet');
const { getPetfinderToken } = require('../utils/getPetFinderToken');

router.post('/:type/:petId', isSignedIn, async (req, res) => {
  const { type, petId } = req.params;
  const user = await User.findById(req.session.user._id);

  const exists = user.favorites.some(fav => fav.petId === petId && fav.type === type);
  if (!exists) {
    user.favorites.push({ petId, type });
    await user.save();
    req.session.user = {
      _id: user._id,
      email: user.email,
      name: user.name
    };
  }

  req.flash('success', 'Pet added to favorites!');
  res.redirect('back');
});

router.delete('/:type/:petId', isSignedIn, async (req, res) => {
  const { type, petId } = req.params;
  await User.findByIdAndUpdate(req.session.user._id, {
    $pull: { favorites: { petId, type } }
  });

  req.flash('success', 'Removed from favorites.');
  res.redirect('back');
});

router.get('/', isSignedIn, async (req, res) => {
  const user = await User.findById(req.session.user._id);
  const internalFavorites = [];
  const apiFavorites = [];

  for (const fav of user.favorites) {
    if (fav.type === 'internal') {
      const pet = await Pet.findById(fav.petId);
      if (pet) internalFavorites.push(pet);
    } else if (fav.type === 'api') {
      const token = await getPetfinderToken();
      const response = await fetch(`https://api.petfinder.com/v2/animals/${fav.petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.animal) apiFavorites.push(data.animal);
    }
  }

  res.render('favorites/index.ejs', { internalFavorites, apiFavorites });
});

module.exports = router;
