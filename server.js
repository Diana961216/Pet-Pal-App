const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const passUserToView = require('./middleware/pass-user-to-view.js');
const isSignedIn = require('./middleware/is-signed-in.js');
const User = require('./models/user.js');
const Pet = require('./models/pet.js');
const Application = require('./models/application.js');
const getPets = require('./utils/getPets.js');
const userController = require('./controllers/user.js');
const authController = require('./controllers/auth.js');
const favoritesController = require('./controllers/favorites.js');
const isOwner = require('./middleware/is-owner.js');
const {getBreeds} = require('./utils/getBreeds.js');

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
    saveUninitialized: true
  })
);

app.use(flash());
app.use(passUserToView);

app.use('/auth', authController);
app.use('/users', isSignedIn, userController);
app.use('/pets', isSignedIn, require('./controllers/pet.js'));
app.use('/explore', require('./controllers/explore.js'));
app.use('/pets/:petId/applications', require('./controllers/application.js')); 
app.use('/applications', require('./controllers/application.js')); 
app.use('/favorites', isSignedIn, require('./controllers/favorites.js'));

app.get('/', async (req, res) => {
  const { location, type = '', breed = '' } = req.query;
  const pets = await getPets({ location, type, breed });
  const breeds = type ? await getBreeds(type) : [];

  let user = req.session.user;

  if (user) {
    const dbUser = await User.findById(user._id).lean();
    user = {
      _id: dbUser._id,
      email: dbUser.email,
      name: dbUser.name,
      favoritesApi: dbUser.favorites
        .filter(f => f.type === 'api')
        .map(f => f.petId),
      favoritesInternal: dbUser.favorites
        .filter(f => f.type === 'internal')
        .map(f => f.petId)
    };
  }

  res.render('index.ejs', {
    user,
    pets,
    location,
    type,
    breed,
    breeds
  });
});

app.get('/api/breeds/:type', async (req, res) => {
  try {
    const breeds = await getBreeds(req.params.type);
    res.json(breeds);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
