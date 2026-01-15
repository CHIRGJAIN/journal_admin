const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('./model-utils');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    source: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applyBaseSchemaOptions(contactMessageSchema);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

module.exports = { ContactMessage };
