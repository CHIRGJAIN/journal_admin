const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

const findByEmail = async (email) => User.findOne({ email }).exec();

const findById = async (id) => User.findById(id).exec();

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  return user;
};

const updateUserSettings = async (userId, settings) => {
  const updateData = {};
  if (settings.name) updateData.name = settings.name;
  if (settings.email) updateData.email = settings.email;
  if (settings.phone !== undefined) updateData.phone = settings.phone;
  if (settings.unavailableDates) {
    updateData.unavailableDates = settings.unavailableDates;
  }
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  return user;
};
const findAll = async ({ status, role, q, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (role) {
    filter.roles = role;
  }
  if (q) {
    const regex = new RegExp(q, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).exec(),
    User.countDocuments(filter),
  ]);

  return { data, total, page: safePage, limit: safeLimit };
};

const updateStatus = async (id, status) =>
  User.findByIdAndUpdate(id, { status }, { new: true }).exec();

const updateRoles = async (id, roles) =>
  User.findByIdAndUpdate(id, { roles }, { new: true }).exec();

const updateProfile = async (id, payload) =>
  User.findByIdAndUpdate(id, payload, { new: true }).exec();

const deleteUser = async (id) => User.findByIdAndDelete(id).exec();
module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUserSettings,
  findAll,
  updateStatus,
  updateRoles,
  updateProfile,
  deleteUser,
};
