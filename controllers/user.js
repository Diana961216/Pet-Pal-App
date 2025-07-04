const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pet = require('../models/pet');
const Application = require('../models/application');
const bcrypt = require('bcrypt');
const isSignedIn = require('../middleware/is-signed-in.js');


router.get('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id !== req.params.userId) return res.redirect('/');
  const currentUser = await User.findById(req.params.userId);
  const myPets = await Pet.find({ owner: currentUser._id });
  const myApps = await Application.find({ user: currentUser._id }).populate('pet');
  res.render('users/show.ejs', { user: currentUser, myPets, myApps });
});


router.get('/:userId/edit', isSignedIn, async (req, res) => {
  if (req.session.user._id !== req.params.userId) return res.redirect('/');
  const user = await User.findById(req.params.userId);
  res.render('users/edit.ejs', { user });
});


router.put('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id !== req.params.userId) return res.redirect('/');
  const user = await User.findById(req.params.userId);
  
  user.username = req.body.username || user.username;

  if (req.body.password) {
    user.password = bcrypt.hashSync(req.body.password, 10);
  }

  await user.save();
  res.redirect(`/users/${user._id}`);
});


router.delete('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id !== req.params.userId) return res.redirect('/');

  await Application.deleteMany({ user: req.params.userId });

  await Pet.deleteMany({ owner: req.params.userId });

  await User.findByIdAndDelete(req.params.userId);

  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
