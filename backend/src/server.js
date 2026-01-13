const { app } = require('./app');
const { config } = require('./config/env');
const { connectToDatabase } = require('./config/db');

const start = async () => {
  await connectToDatabase();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
