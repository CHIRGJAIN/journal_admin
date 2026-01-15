const express = require('express');
const contactMessageController = require('../controllers/contactMessage.controller');
const { authenticate, requireRoles } = require('../middleware/auth');
const { asyncHandler } = require('../utils/async-handler');

const router = express.Router();

router.post('/', asyncHandler(contactMessageController.createMessage));
router.get(
  '/',
  authenticate,
  requireRoles(['publisher', 'admin']),
  asyncHandler(contactMessageController.getMessages)
);

module.exports = router;
