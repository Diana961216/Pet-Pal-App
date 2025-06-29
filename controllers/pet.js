const express = require('express');
const router = express.Router();
const Pet = require('../models/pet.js');
const User = require('../models/user.js');

router.get('/', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    const pets = await Pet.find().populate('owner');
    res.render('pets/index.ejs', { 
      pets: pets,
      user: currentUser,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.get('/new', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    res.render('pets/new.ejs', { user: currentUser });
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});


router.post('/', async (req, res) => {
    try {
      const newPet = new Pet({
        name: req.body.name,
        breed: req.body.breed,
        age: req.body.age,
        owner: req.session.user._id,
      });
  
      await newPet.save();
      res.redirect('/pets');
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });

module.exports = router;