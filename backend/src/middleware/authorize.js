const normalizeRoles = (roles) => {
  if (!roles) return [];
  return Array.isArray(roles) ? roles : [roles];
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const roles = normalizeRoles(req.user && req.user.roles);
  const isAllowed = roles.some((role) => allowedRoles.includes(role));

  if (!isAllowed) {
    return res.status(403).json({ statusCode: 403, message: 'Forbidden' });
  }

  return next();
};

module.exports = { authorizeRoles };
