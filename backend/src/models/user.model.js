const mongoose = require('mongoose');
const { applyBaseSchemaOptions } = require('./model-utils');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    roles: { type: String, required: true },
    expertise: { type: String},
    unavailableDates: {
      ranges: { type: String },
      note: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

applyBaseSchemaOptions(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = { User };
