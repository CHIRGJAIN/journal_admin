const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.get('/access-token', asyncHandler(authController.accessToken));
router.get('/profile', authenticate, asyncHandler(authController.profile));
router.put('/settings', authenticate, asyncHandler(authController.updateSettings));

module.exports = router;
