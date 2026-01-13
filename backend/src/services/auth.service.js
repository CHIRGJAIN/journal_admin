const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../config/env');
const usersService = require('./users.service');

const validateUser = async (email, password) => {
  const user = await usersService.findByEmail(email);
  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }

  const result = user.toObject();
  delete result.password;
  return result;
};

const login = async (user, role) => {
  const normalizedRoles = Array.isArray(user.roles)
    ? user.roles
    : user.roles
    ? [user.roles]
    : [];

  const jwtPayload = {
    email: user.email,
    sub: user._id || user.id,
    roles: normalizedRoles,
    role: role || normalizedRoles[0],
    name: user.name,
    phone: user.phone,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return {
    token,
    user: {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      roles: normalizedRoles,
      role: role || normalizedRoles[0],
      expertise: user.expertise,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};

const register = async (data) => usersService.createUser(data);

module.exports = {
  validateUser,
  login,
  register,
};
