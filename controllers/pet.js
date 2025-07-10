const express = require('express');
const router = express.Router();
const Pet = require('../models/pet.js');
const User = require('../models/user.js');
const isSignedIn = require('../middleware/is-signed-in.js');
const isOwner = require('../middleware/is-owner.js');

router.get('/', isSignedIn, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    const pets = await Pet.find({ owner: req.session.user._id }).populate('owner');
    res.render('pets/index.ejs', { 
      pets: pets,
      user: currentUser,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.get('/new', isSignedIn, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    res.render('pets/new.ejs', { user: currentUser });
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});

router.post('/', isSignedIn, async (req, res) => {
  try {
    const newPet = new Pet({
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      owner: req.session.user._id,
    });

    await newPet.save();
    res.redirect('/pets');
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.get('/:petId', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId).populate('owner');
    if (!pet) {
      return res.status(404).send('Pet not found');
    }
    res.render('pets/show.ejs', { pet });
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});

router.get('/:petId/edit', isSignedIn, isOwner, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).send('Pet not found');
    }
    res.render('pets/edit.ejs', { pet, user: currentUser });
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});

router.put('/:petId', isSignedIn, isOwner, async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.petId, {
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
    }, { new: true });

    if (!pet) {
      return res.status(404).send('Pet not found');
    }

    res.redirect(`/pets/${pet._id}`);
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});

router.delete('/:petId', isSignedIn, isOwner, async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.petId);
    if (!pet) {
      return res.status(404).send('Pet not found');
    }
    res.redirect('/pets');
  } catch (error) {
    console.error(error);
    res.redirect('/pets');
  }
});

module.exports = router;
