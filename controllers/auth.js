const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});

router.post('/sign-up', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/auth/sign-up');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    req.flash('error', 'An account with that email already exists.');
    return res.redirect('/auth/sign-up');
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/auth/sign-up');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  await User.create({ email: email.toLowerCase(), password: hashedPassword });

  req.flash('success', 'Account created! Please sign in.');
  res.redirect('/auth/sign-in');
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/auth/sign-in');
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/auth/sign-in');
  }

  req.session.user = {
    _id: user._id,
    email: user.email
  };

  req.flash('success', 'You are now signed in.');
  res.redirect('/');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
