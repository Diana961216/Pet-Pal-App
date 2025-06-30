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

  router.get('/:petId/edit', async (req, res) => {
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

  router.put('/:petId', async (req, res) => {
    try {
      const pet = await Pet.findByIdAndUpdate(req.params.petId, {
        name: req.body.name,
        breed: req.body.breed,
        age: req.body.age,
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
    
module.exports = router;