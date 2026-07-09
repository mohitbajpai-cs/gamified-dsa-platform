const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rootRoutes = require('./routes/root.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const errorHandler = require('./middleware/error.middleware.js');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse incoming request bodies
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Parse cookies
app.use(cookieParser());

// Development / Production request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Register routes
app.use('/', rootRoutes);
app.use('/api/auth', authRoutes);

// Centralized error handling middleware
app.use(errorHandler);



module.exports = app;