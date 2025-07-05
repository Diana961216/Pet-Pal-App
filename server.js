const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const passUserToView = require('./middleware/pass-user-to-view.js');
const isSignedIn = require('./middleware/is-signed-in.js');
const User = require('./models/user.js');
const Pet = require('./models/pet.js');
const Application = require('./models/application.js');
const getPets = require('./utils/getPets.js');
const userController = require('./controllers/user.js');
const isOwner = require('./middleware/is-owner.js');

const authController = require('./controllers/auth.js');

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error: ${err}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUserToView);
app.use('/auth', authController);
app.use('/pets', isSignedIn, require('./controllers/pet.js'));
app.use('/explore', require('./controllers/explore.js'));
app.use('/pets/:petId/applications', require('./controllers/application.js'));
app.use('/users', userController);


app.get('/', async (req, res) => {
  let pets;
  const { location, type } = req.query;

  if (location || type) { 
    pets = await getPets({ location: location || '33126', type });
  } else {
    pets = await getPets();
  }

  res.render('index.ejs', {
    user: req.session.user,
    pets
  });
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
