const express = require('express');
const editorialBoardController = require('../controllers/editorialBoard.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');
const { asyncHandler } = require('../utils/async-handler');
const router = express.Router();

router.post(
  '/create',
  authenticate,
  authorizeRoles('publisher', 'admin'),
  asyncHandler(editorialBoardController.createEditorialBoard)
);
router.get('/', asyncHandler(editorialBoardController.getEditorialBoards));
router.get('/:id', asyncHandler(editorialBoardController.getEditorialBoard));
router.put(
  '/update/:id',
  authenticate,
  authorizeRoles('publisher', 'admin'),
  asyncHandler(editorialBoardController.updateEditorialBoard)
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('publisher', 'admin'),
  asyncHandler(editorialBoardController.deleteEditorialBoard)
);

module.exports = router;
