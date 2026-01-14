const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('./model-utils');

const reviewSchema = new mongoose.Schema(
  {
    content: { type: String,},
    decision: { type: String},
    manuscriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manuscript',
      required: true,
    },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

reviewSchema.virtual('manuscript', {
  ref: 'Manuscript',
  localField: 'manuscriptId',
  foreignField: '_id',
  justOne: true,
});

reviewSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewerId',
  foreignField: '_id',
  justOne: true,
});

applyBaseSchemaOptions(reviewSchema);

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
