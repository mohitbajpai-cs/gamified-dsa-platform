const express = require('express');
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
const profileRoutes = require('./routes/profile.routes.js');
const leaderboardRoutes = require('./routes/leaderboard.routes.js');
const questRoutes = require('./routes/quest.routes.js');
const achievementRoutes = require('./routes/achievement.routes.js');
const rewardRoutes = require('./routes/reward.routes.js');
const bossRoutes = require('./routes/boss.routes.js');
const bossesRoutes = require('./routes/bosses.routes.js');
const contestRoutes = require('./routes/contest.routes.js');
const socialRoutes = require('./routes/social.routes.js');
const analyticsRoutes = require('./routes/analytics.routes.js');
const adminCustomRoutes = require('./routes/adminCustom.routes.js');
const adminWorldRoutes = require('./routes/adminWorld.routes.js');
const adminTopicRoutes = require('./routes/adminTopic.routes.js');
const adminProblemRoutes = require('./routes/adminProblem.routes.js');
const adminTestCaseRoutes = require('./routes/adminTestCase.routes.js');
const seedRoutes = require('./routes/seed.routes.js');
const errorHandler = require('./middleware/error.middleware.js');
const cors = require("cors");

const app = express();

// CORS must be registered BEFORE helmet so helmet cannot override CORS headers
const corsOptions = {
    origin: "https://gamified-dsa-platform1.onrender.com",
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    maxAge: 0
};

app.use(cors(corsOptions));

// Set security HTTP headers (after CORS so headers are not overridden)
app.use(helmet());

// Parse incoming request bodies
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Parse cookies
app.use(cookieParser());

// Development / Production request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Register routes
app.use('/', rootRoutes);
app.get('/api/db-diagnostics', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbName = mongoose.connection.name;
        const host = mongoose.connection.host;
        const User = require('./models/user.model');
        const World = require('./models/world.model');
        
        // List mongo-related env keys in process.env
        const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('mongo') || k.toLowerCase().includes('db') || k.toLowerCase().includes('url'));
        
        // List other database names in the cluster
        let dbList = [];
        try {
            const adminDb = mongoose.connection.db.admin();
            const result = await adminDb.listDatabases();
            dbList = result.databases.map(d => d.name);
        } catch (e) {
            dbList = ['error: ' + e.message];
        }
        
        const userCount = await User.countDocuments();
        const worldCount = await World.countDocuments();
        
        const users = await User.find({}, 'username email role').limit(10);
        const worlds = await World.find({}, 'name order difficulty').limit(10);
        
        res.status(200).json({
            success: true,
            dbName,
            host,
            envKeys,
            dbList,
            userCount,
            worldCount,
            users,
            worlds
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
app.use('/api/auth', authRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api', problemRoutes); // mounts /api/problems/:topicId and /api/problem/:id
app.use('/api/submission', submissionRoutes); // mounts POST /api/submission
app.use('/api/submissions', submissionRoutes); // mounts GET /api/submissions and GET /api/submissions/:problemId
app.use('/api/progress', progressRoutes);
app.use('/api/profile/stats', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/boss', bossRoutes);
app.use('/api/bosses', bossesRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);

// Register admin routes
app.use('/api/admin', adminCustomRoutes);
app.use('/api/admin/worlds', adminWorldRoutes);
app.use('/api/admin/topics', adminTopicRoutes);
app.use('/api/admin/problems', adminProblemRoutes);
app.use('/api/admin/testcases', adminTestCaseRoutes);
app.use('/api/admin/seed', seedRoutes);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;