const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');
router.post('/create',authenticate,upload.none(), issueController.createIssue);
router.put('/update/:id', issueController.updateIssue);
router.patch('/update-status/:id/publish', issueController.publishIssue);
router.get('/', issueController.getIssues);
router.get('/latest', issueController.getLatestIssue);
router.get('/featured-manuscripts', issueController.getFeaturedManuscripts);
router.get('/slug/:slug', issueController.getIssueBySlug);
router.get('/:id', issueController.getIssueById);
router.patch('/:id/add-manuscript', issueController.addManuscript);
router.patch('/:id/remove-manuscript', issueController.removeManuscript);
router.patch('/:id/archive', issueController.archiveIssue);
router.delete('/:id', issueController.deleteIssue);

module.exports = router;
