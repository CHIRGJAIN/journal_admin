const mongoose = require('mongoose');
const { config } = require('./env');

const connectToDatabase = async () => {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed', err);
    throw err;
  }
};

module.exports = { connectToDatabase };
