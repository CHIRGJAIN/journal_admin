const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const authService = require('../services/auth.service');
const usersService = require('../services/users.service');
const { HttpError } = require('../utils/http-error');

const login = async (req, res) => {
  const { email, password, role } = req.body || {};
  const validation = await authService.validateUser(email, password);

  if (!validation.valid) {
    if (validation.reason === 'NOT_APPROVED') {
      throw new HttpError(403, 'Account pending approval');
    }
    throw new HttpError(401, 'Invalid credentials');
  }

  const payload = await authService.login(validation.user, role);
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
  };

  // set cookie with token
  res.cookie(config.accessTokenCookieName, payload.token, cookieOptions);
  // return standardized response: { token, user }
  res.json({ status: true, data: payload });
};

const register = async (req, res) => {
  const payload = {
    ...req.body,
    roles: req.body.roles || 'author',
    status: 'PENDING',
  };
  const user = await authService.register(payload);
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  res.json({ status: true, data: result });
};

const profile = async (req, res) => {
  const user = await usersService.findById(req.user.userId);
  if (!user) throw new HttpError(404, 'User not found');
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.password;
  res.json({ status: true, data: result });
};

const updateSettings = async (req, res) => {
  const userId = req.user.userId;
  const usersService = require('../services/users.service');
  const user = await usersService.updateUserSettings(userId, req.body);
  res.json({ status: true, data: user });
};

const accessToken = async (req, res) => {
  const token = req.cookies && req.cookies[config.accessTokenCookieName];
  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  try {
    jwt.verify(token, config.jwtSecret);
    return res.json({ status: true, data: { token } });
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }
};

module.exports = {
  login,
  register,
  profile,
  accessToken,
  updateSettings,
};
