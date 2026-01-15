const express = require('express');
const blogController = require('../controllers/blog.controller');

const { authenticate, requireRoles } = require('../middleware/auth');
const { asyncHandler } = require('../utils/async-handler');
const router = express.Router();

router.post('/', authenticate, requireRoles(['publisher', 'admin']), asyncHandler(blogController.createBlog));
router.get('/', asyncHandler(blogController.getBlogs));
router.get('/slug/:slug', asyncHandler(blogController.getBlogBySlug));
router.get('/:id', asyncHandler(blogController.getBlog));
router.put('/:id', authenticate, requireRoles(['publisher', 'admin']), asyncHandler(blogController.updateBlog));
router.delete('/:id', authenticate, requireRoles(['publisher', 'admin']), asyncHandler(blogController.deleteBlog));

module.exports = router;
