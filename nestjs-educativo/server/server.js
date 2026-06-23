const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const exercisesRouter = require('./routes/exercises');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', exercisesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nestjs-educativo' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`NestJS Educational Platform running on http://localhost:${PORT}`);
  logger.info('Docker container should be running: nestjs-executor');
});

module.exports = app;
