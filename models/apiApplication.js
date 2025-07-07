const mongoose = require('mongoose');

const apiApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: String,
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApiApplication = mongoose.model('ApiApplication', apiApplicationSchema);

module.exports = ApiApplication;
