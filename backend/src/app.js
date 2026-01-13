const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { errorHandler } = require('./middleware/error-handler');
const routes = require('./routes');

const app = express();

app.use(cors({  origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ statusCode: 404, message: 'Not found' });
});

app.use(errorHandler);

module.exports = { app };
