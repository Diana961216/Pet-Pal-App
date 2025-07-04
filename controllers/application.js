const express = require('express');
const router = express.Router({mergeParams: true});
const Pet = require('../models/pet.js');    
const Application = require('../models/application.js');
const User = require('../models/user.js');
const isSignedIn = require('../middleware/is-signed-in.js');


router.get('/new', isSignedIn, async (req, res) => {
    try {
      const pet = await Pet.findById(req.params.petId);
      if (!pet) return res.redirect('/');
      res.render('applications/new.ejs', { pet, user: req.session.user });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

  router.post('/', isSignedIn, async (req, res) => {
    try {
      const newApp = new Application({
        user: req.session.user._id,
        pet: req.params.petId,
        message: req.body.message,
        status: 'pending'
      });
      await newApp.save();
      res.redirect(`/pets/${req.params.petId}`);
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

  router.get('/:id/edit', isSignedIn, async (req, res) => {
    try {
      const app = await Application.findById(req.params.id).populate('pet');
      if (!app || !app.user.equals(req.session.user._id)) {
        return res.redirect(`/pets/${req.params.petId}`);
      }
      res.render('applications/edit.ejs', { app, user: req.session.user });
    } catch (err) {
      console.error(err);
      res.redirect(`/pets/${req.params.petId}`);
    }
  });

  router.put('/:id', isSignedIn, async (req, res) => {
    try {
      const app = await Application.findById(req.params.id).populate('pet');
      if (!app) return res.redirect(`/pets/${req.params.petId}`);
  
      if (app.user.equals(req.session.user._id)) {
        app.message = req.body.message;
      } else if (app.pet.owner.equals(req.session.user._id)) {
        app.status = req.body.status;
      }
      await app.save();
      res.redirect(`/pets/${req.params.petId}`);
    } catch (err) {
      console.error(err);
      res.redirect(`/pets/${req.params.petId}`);
    }
  });

  router.delete('/:id', isSignedIn, async (req, res) => {
    try {
      await Application.findByIdAndDelete(req.params.id);
      res.redirect(`/pets/${req.params.petId}`);
    } catch (err) {
      console.error(err);
      res.redirect(`/pets/${req.params.petId}`);
    }
  });
  
  module.exports = router;


