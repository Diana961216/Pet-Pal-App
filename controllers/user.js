const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pet = require('../models/pet');
const Application = require('../models/application');
const ApiApplication = require('../models/apiApplication');
const bcrypt = require('bcrypt');
const isSignedIn = require('../middleware/is-signed-in.js');

router.get('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id.toString() !== req.params.userId) return res.redirect('/');
  
  const currentUser = await User.findById(req.params.userId);

  const myPets = await Pet.find({ owner: req.session.user._id });

  const myApps = await Application.find({ user: currentUser._id }).populate('pet');
  const myApiApps = await ApiApplication.find({ user: currentUser._id });

  const allApps = [
    ...myApps.map(app => ({
      type: 'internal',
      petName: app.pet.name,
      petId: app.pet._id,
      message: app.message,
      status: app.status,
      date: app.createdAt,
      appId: app._id
    })),
    ...myApiApps.map(app => ({
      type: 'api',
      petName: app.petName,
      petId: app.petId,
      message: app.message,
      date: app.createdAt,
      _id: app._id
    }))
  ];

  res.render('users/show.ejs', {
    user: currentUser,
    myPets,
    allApps
  });
});

router.get('/:userId/edit', isSignedIn, async (req, res) => {
  if (req.session.user._id.toString() !== req.params.userId) return res.redirect('/');
  const user = await User.findById(req.params.userId);
  res.render('users/edit.ejs', { user });
});

router.put('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id.toString() !== req.params.userId) return res.redirect('/');
  const user = await User.findById(req.params.userId);

  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email.toLowerCase();
  if (req.body.password) {
    user.password = bcrypt.hashSync(req.body.password, 10);
  }

  await user.save();
  res.redirect(`/users/${user._id}`);
});

router.delete('/:userId', isSignedIn, async (req, res) => {
  if (req.session.user._id.toString() !== req.params.userId) return res.redirect('/');

  await Application.deleteMany({ user: req.params.userId });
  await Pet.deleteMany({ owner: req.params.userId });
  await ApiApplication.deleteMany({ user: req.params.userId });
  await User.findByIdAndDelete(req.params.userId);

  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
