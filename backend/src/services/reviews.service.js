const { Review } = require('../models/review.model');
const { Manuscript } = require('../models/manuscript.model');
const { HttpError } = require('../utils/http-error');
const { isValidObjectId } = require('../utils/object-id');

const decisionStatusMap = {
  ACCEPT: 'ACCEPTED',
  REJECT: 'REJECTED',
  REVISE: 'REVISION_REQUESTED',
};

const assignReviewer = async (manuscriptId, reviewerId) => {
  if (!isValidObjectId(manuscriptId)) {
    throw new HttpError(400, 'Manuscript not found');
  }

  const manuscript = await Manuscript.findById(manuscriptId).exec();
  if (!manuscript) {
    throw new HttpError(400, 'Manuscript not found');
  }

  await Manuscript.findByIdAndUpdate(manuscriptId, { status: 'UNDER_REVIEW' }).exec();

  return Review.create({
    manuscriptId,
    reviewerId,
    content: '',
    decision: 'PENDING',
  });
};

const submitReview = async (reviewId, content, decision) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { content, decision },
    { new: true }
  ).exec();

  if (!review) {
    throw new HttpError(404, 'Review not found');
  }

  const nextStatus = decisionStatusMap[decision];
  if (nextStatus && review.manuscriptId) {
    await Manuscript.findByIdAndUpdate(
      review.manuscriptId,
      { status: nextStatus },
      { new: true }
    ).exec();
  }

  return review;
};

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
