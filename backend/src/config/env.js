const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  port: Number.parseInt(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  nodeEnv: process.env.NODE_ENV || 'development',
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME || 'access_token',
};

module.exports = { config };
