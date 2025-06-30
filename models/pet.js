const mongoose = require('mongoose');


const petSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  });
  
  const Pet = mongoose.model('Pet', petSchema);
  module.exports = Pet;