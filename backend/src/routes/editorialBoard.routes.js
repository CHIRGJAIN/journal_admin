const express = require('express');
const editorialBoardController = require('../controllers/editorialBoard.controller');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/async-handler');
const router = express.Router();

router.post('/create', authenticate, asyncHandler(editorialBoardController.createEditorialBoard));
router.get('/', asyncHandler(editorialBoardController.getEditorialBoards));
router.get('/:id', asyncHandler(editorialBoardController.getEditorialBoard));
router.put('/update/:id', authenticate, asyncHandler(editorialBoardController.updateEditorialBoard));
router.delete('/:id', authenticate, asyncHandler(editorialBoardController.deleteEditorialBoard));

module.exports = router;
