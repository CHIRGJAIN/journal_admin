const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

const router = express.Router();

router.get('/profile', authenticate, asyncHandler(usersController.getProfile));
router.put('/profile', authenticate, asyncHandler(usersController.updateProfile));
router.delete('/profile', authenticate, asyncHandler(usersController.deleteProfile));

router.get('/', authenticate, authorizeRoles('publisher', 'admin'), asyncHandler(usersController.getUsers));
router.get('/:id', authenticate, authorizeRoles('publisher', 'admin'), asyncHandler(usersController.getUserById));
router.patch('/:id/status', authenticate, authorizeRoles('publisher', 'admin'), asyncHandler(usersController.updateStatus));
router.patch('/:id/roles', authenticate, authorizeRoles('publisher', 'admin'), asyncHandler(usersController.updateRoles));

module.exports = router;
