const express = require('express');
const blogController = require('../controllers/blog.controller');

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/async-handler');
const router = express.Router();

router.post('/', authenticate, asyncHandler(blogController.createBlog));
router.get('/', asyncHandler(blogController.getBlogs));
router.get('/slug/:slug', asyncHandler(blogController.getBlogBySlug));
router.get('/:id', asyncHandler(blogController.getBlog));
router.put('/:id', authenticate, asyncHandler(blogController.updateBlog));
router.delete('/:id', authenticate, asyncHandler(blogController.deleteBlog));

module.exports = router;
