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

const login = async (user) => {
  const payload = {
    email: user.email,
    sub: user.id,
    roles: user.roles,
  };

  return {
    access_token: jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    }),
    user: {
      email: user.email,
      name: user.name,
      roles: user.roles,
      expertise: user.expertise,
    },
  };
};

const register = async (data) => usersService.createUser(data);

module.exports = {
  validateUser,
  login,
  register,
};
