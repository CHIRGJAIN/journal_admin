const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  volume: {
    type: Number,
    required: true,
  },
  issueNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    
  },
  description: {
    type: String,
  },
  publicationDate: {
    type: Date,
  },
  // coverImage: {
  //   type: String,
  // },
  keywords: [{
    type: String,
  }],
  manuscripts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manuscript',
  }],
  totalPages: {
    type: Number,
    default: 0, // Total page count of all manuscripts in this issue
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

IssueSchema.index({ volume: 1, issueNumber: 1 }, { unique: true });

module.exports = mongoose.model('Issue', IssueSchema);
