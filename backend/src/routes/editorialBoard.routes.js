const express = require('express');
const editorialBoardController = require('../controllers/editorialBoard.controller');
const { authenticate, requireRoles } = require('../middleware/auth');
const { asyncHandler } = require('../utils/async-handler');

const router = express.Router();

router.post(
  '/',
  authenticate,
  requireRoles(['publisher', 'admin']),
  asyncHandler(editorialBoardController.createMember)
);
router.get('/', asyncHandler(editorialBoardController.getMembers));
router.get('/:id', asyncHandler(editorialBoardController.getMember));
router.put(
  '/:id',
  authenticate,
  requireRoles(['publisher', 'admin']),
  asyncHandler(editorialBoardController.updateMember)
);
router.delete(
  '/:id',
  authenticate,
  requireRoles(['publisher', 'admin']),
  asyncHandler(editorialBoardController.deleteMember)
);

module.exports = router;
