const mongoose = require('mongoose');

const EditorialBoardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  post: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  website: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EditorialBoard', EditorialBoardSchema);
