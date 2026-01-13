const reviewsService = require('../services/reviews.service');

const assign = async (req, res) => {
  const { manuscriptId, reviewerId } = req.body || {};
  const review = await reviewsService.assignReviewer(manuscriptId, reviewerId);
  res.json({ status: true, data: review });
};

const submit = async (req, res) => {
  const { content, decision } = req.body || {};
  const review = await reviewsService.submitReview(req.params.id, content, decision);
  res.json({ status: true, data: review });
};

const findMine = async (req, res) => {
  const reviews = await reviewsService.findReviewsByReviewer(req.user.userId);
  res.json({ status: true, data: reviews });
};

const findForManuscript = async (req, res) => {
  const reviews = await reviewsService.findReviewsForManuscript(req.params.id);
  res.json({ status: true, data: reviews });
};

module.exports = {
  assign,
  submit,
  findMine,
  findForManuscript,
};
