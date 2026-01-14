const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const manuscriptsController = require('../controllers/manuscripts.controller');

const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const upload = require('../middleware/multer');

const router = express.Router();

// Public searchable manuscripts list (supports q/type/issueSlug/page/limit)
router.get('/public', asyncHandler(manuscriptsController.findAllPublic));
// Authenticated list (simple/all manuscripts, no issue filter)
router.get('/', authenticate, asyncHandler(manuscriptsController.findAll));
router.get('/types', asyncHandler(manuscriptsController.getTypes));
router.get('/public/:id', asyncHandler(manuscriptsController.findOnePublic));

// Accept multiple files (files[] for manuscript files, image for cover image)
router.post('/create', authenticate, upload.fields([
	{ name: 'files', maxCount: 10 },
	{ name: 'image', maxCount: 1 },
]), asyncHandler(manuscriptsController.create));
router.get('/all', authenticate, asyncHandler(manuscriptsController.findAll));
router.get('/my', authenticate, asyncHandler(manuscriptsController.findMine));
router.get('/my/summary', authenticate, asyncHandler(manuscriptsController.getSummary));

// Update manuscript status
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('publisher', 'admin'),
  asyncHandler(manuscriptsController.updateStatus)
);

router.patch(
  '/:id',
  authenticate,
  authorizeRoles('editor', 'publisher', 'admin'),
  upload.single('content'),
  asyncHandler(manuscriptsController.update)
);

router.get('/:id', asyncHandler(manuscriptsController.findOne));

module.exports = router;
