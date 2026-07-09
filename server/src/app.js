const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rootRoutes = require('./routes/root.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const worldRoutes = require('./routes/world.routes.js');
const topicRoutes = require('./routes/topic.routes.js');
const problemRoutes = require('./routes/problem.routes.js');
const submissionRoutes = require('./routes/submission.routes.js');
const progressRoutes = require('./routes/progress.routes.js');
const adminWorldRoutes = require('./routes/adminWorld.routes.js');
const adminTopicRoutes = require('./routes/adminTopic.routes.js');
const adminProblemRoutes = require('./routes/adminProblem.routes.js');
const adminTestCaseRoutes = require('./routes/adminTestCase.routes.js');
const seedRoutes = require('./routes/seed.routes.js');
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
app.use('/api/worlds', worldRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api', problemRoutes); // mounts /api/problems/:topicId and /api/problem/:id
app.use('/api/submission', submissionRoutes); // mounts POST /api/submission
app.use('/api/submissions', submissionRoutes); // mounts GET /api/submissions and GET /api/submissions/:problemId
app.use('/api/progress', progressRoutes);

// Register admin routes
app.use('/api/admin/worlds', adminWorldRoutes);
app.use('/api/admin/topics', adminTopicRoutes);
app.use('/api/admin/problems', adminProblemRoutes);
app.use('/api/admin/testcases', adminTestCaseRoutes);
app.use('/api/admin/seed', seedRoutes);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;