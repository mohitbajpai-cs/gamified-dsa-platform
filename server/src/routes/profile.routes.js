const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, {
        username: user.username,
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        totalSolved: user.totalSolved || user.completedProblems.length,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        completedTopics: user.completedTopics || [],
        completedWorlds: user.completedWorlds || [],
        achievements: user.achievements || [],
        rank: user.rank || 'Novice',
        currentTitle: user.currentTitle || 'Beginner Knight',
        joinedDate: user.createdAt,
        completedProblems: user.completedProblems || []
    }, 'Complete profile statistics retrieved successfully'));
}));

module.exports = router;
