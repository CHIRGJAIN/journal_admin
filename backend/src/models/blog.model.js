const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: [String], // Array of strings for description
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String, // URL or path to image
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', BlogSchema);
