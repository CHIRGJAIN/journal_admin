const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

const extractToken = (req) => {
  const cookieToken = req.cookies && req.cookies[config.accessTokenCookieName];
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization || '';

  const [scheme, token] = authHeader.split(' ');
  if (scheme === 'Bearer' && token) {
    return token;
  }

  return null;
};

const authenticate = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      name: payload.name,
      phone: payload.phone,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  }
};

module.exports = { authenticate };
