const express = require('express');
const authRoutes = require('./auth.routes');
const manuscriptsRoutes = require('./manuscripts.routes');
const reviewsRoutes = require('./reviews.routes');
const issueRoutes = require('./issue.routes');
const editorialBoardRoutes = require('./editorialBoard.routes');
const blogRoutes = require('./blog.routes');

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/manuscripts', manuscriptsRoutes);
router.use('/api/reviews', reviewsRoutes);
router.use('/api/issues', issueRoutes);

router.use('/api/editorial-board', editorialBoardRoutes);
router.use('/api/blog', blogRoutes);

module.exports = router;
