const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rootRoutes = require('./routes/root.routes.js');
const errorHandler = require('./middleware/error.middleware.js');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse incoming request bodies
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Development / Production request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Register the root routes middleware
app.use('/', rootRoutes);

// Centralized error handling middleware
app.use(errorHandler);


module.exports = app;