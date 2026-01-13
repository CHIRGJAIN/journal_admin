const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const authService = require('../services/auth.service');

const login = async (req, res) => {
  const { email, password } = req.body || {};
  const user = await authService.validateUser(email, password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const payload = await authService.login(user);
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
  };

  res.cookie(config.accessTokenCookieName, payload.access_token, cookieOptions);
  res.json({ status: true, data: payload });
};

const register = async (req, res) => {
  const user = await authService.register(req.body);
  res.json({ status: true, data: user });
};

const profile = async (req, res) => {
  res.json({ status: true, data: req.user });
};

const accessToken = async (req, res) => {
  const token = req.cookies && req.cookies[config.accessTokenCookieName];
  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  try {
    jwt.verify(token, config.jwtSecret);
    return res.json({ status: true, data: { access_token: token } });
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }
};

module.exports = {
  login,
  register,
  profile,
  accessToken,
};
