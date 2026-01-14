const usersService = require('../services/users.service');
const { HttpError } = require('../utils/http-error');

const sanitizeUser = (user) => {
  if (!user) return null;
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  return result;
};

const getUsers = async (req, res) => {
  const { status, role, q, page, limit } = req.query;
  const result = await usersService.findAll({ status, role, q, page, limit });
  const safeLimit = result.limit || 1;

  res.json({
    status: true,
    data: result.data.map(sanitizeUser),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / safeLimit),
    },
  });
};

const getUserById = async (req, res) => {
  const user = await usersService.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ status: true, data: sanitizeUser(user) });
};

const getProfile = async (req, res) => {
  const user = await usersService.findById(req.user.userId);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ status: true, data: sanitizeUser(user) });
};

const updateProfile = async (req, res) => {
  const user = await usersService.updateProfile(req.user.userId, req.body);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ status: true, data: sanitizeUser(user) });
};

const deleteProfile = async (req, res) => {
  await usersService.deleteUser(req.user.userId);
  res.json({ status: true, message: 'Account deleted' });
};

const updateStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!status) throw new HttpError(400, 'Status is required');

  const user = await usersService.updateStatus(req.params.id, status);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ status: true, data: sanitizeUser(user) });
};

const updateRoles = async (req, res) => {
  const { roles } = req.body || {};
  if (!roles) throw new HttpError(400, 'Roles is required');

  const user = await usersService.updateRoles(req.params.id, roles);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ status: true, data: sanitizeUser(user) });
};

module.exports = {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  deleteProfile,
  updateStatus,
  updateRoles,
};
