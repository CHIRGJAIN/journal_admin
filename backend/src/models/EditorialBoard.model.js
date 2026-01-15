const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('./model-utils');

const editorialBoardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    country: { type: String, trim: true },
    email: { type: String, trim: true },
    bio: { type: String },
    expertise: [{ type: String, trim: true }],
    image: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

applyBaseSchemaOptions(editorialBoardSchema);

const EditorialBoard = mongoose.model('EditorialBoard', editorialBoardSchema);

module.exports = { EditorialBoard };
