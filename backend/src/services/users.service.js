const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');

const findByEmail = async (email) => User.findOne({ email }).exec();

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  return user;
};

module.exports = {
  findByEmail,
  createUser,
};
