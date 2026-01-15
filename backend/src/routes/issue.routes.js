const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { authenticate, requireRoles } = require('../middleware/auth');
const upload = require('../middleware/multer');
router.post('/create', authenticate, requireRoles(['publisher', 'admin']), upload.none(), issueController.createIssue);
router.put('/update/:id', authenticate, requireRoles(['publisher', 'admin']), issueController.updateIssue);
router.patch('/update-status/:id/publish', authenticate, requireRoles(['publisher', 'admin']), issueController.publishIssue);
router.get('/', issueController.getIssues);
router.get('/latest', issueController.getLatestIssue);
router.get('/featured-manuscripts', issueController.getFeaturedManuscripts);
router.get('/slug/:slug', issueController.getIssueBySlug);
router.get('/:id', issueController.getIssueById);
router.patch('/:id/add-manuscript', authenticate, requireRoles(['publisher', 'admin']), issueController.addManuscript);
router.patch('/:id/remove-manuscript', authenticate, requireRoles(['publisher', 'admin']), issueController.removeManuscript);
router.patch('/:id/archive', authenticate, requireRoles(['publisher', 'admin']), issueController.archiveIssue);
router.delete('/:id', authenticate, requireRoles(['publisher', 'admin']), issueController.deleteIssue);

module.exports = router;
