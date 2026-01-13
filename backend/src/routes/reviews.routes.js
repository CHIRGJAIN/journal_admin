const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const reviewsController = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/assign', authenticate, asyncHandler(reviewsController.assign));
router.patch('/:id/submit', authenticate, asyncHandler(reviewsController.submit));
router.get('/my', authenticate, asyncHandler(reviewsController.findMine));
router.get('/manuscript/:id', authenticate, asyncHandler(reviewsController.findForManuscript));

module.exports = router;
