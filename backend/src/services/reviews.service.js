const { Review } = require('../models/review.model');
const { Manuscript } = require('../models/manuscript.model');
const { HttpError } = require('../utils/http-error');
const { isValidObjectId } = require('../utils/object-id');

const assignReviewer = async (manuscriptId, reviewerId) => {
  if (!isValidObjectId(manuscriptId)) {
    throw new HttpError(400, 'Manuscript not found');
  }

  const manuscript = await Manuscript.findById(manuscriptId).exec();
  if (!manuscript) {
    throw new HttpError(400, 'Manuscript not found');
  }

  return Review.create({
    manuscriptId,
    reviewerId,
    content: '',
    decision: 'PENDING',
  });
};

const submitReview = async (reviewId, content, decision) =>
  Review.findByIdAndUpdate(
    reviewId,
    { content, decision },
    { new: true }
  ).exec();

const findReviewsByReviewer = async (reviewerId) =>
  Review.find({ reviewerId })
    .populate('manuscript')
    .exec();

const findReviewsForManuscript = async (manuscriptId) => {
  if (!isValidObjectId(manuscriptId)) {
    return [];
  }

  return Review.find({ manuscriptId })
    .populate('reviewer', 'name email')
    .exec();
};

module.exports = {
  assignReviewer,
  submitReview,
  findReviewsByReviewer,
  findReviewsForManuscript,
};
