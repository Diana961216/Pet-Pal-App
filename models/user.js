const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  favorites: [
    {
      petId: String,
      type: { type: String, enum: ['internal', 'api'] }
    }
  ]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
