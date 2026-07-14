const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(async (req, res) => {
    const players = await User.find()
        .select('username level xp coins achievements completedProblems currentStreak longestStreak rank currentTitle createdAt')
        .lean();

    players.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        const aSolved = a.completedProblems?.length || 0;
        const bSolved = b.completedProblems?.length || 0;
        if (bSolved !== aSolved) return bSolved - aSolved;
        return (b.currentStreak || 0) - (a.currentStreak || 0);
    });

    const leaderboard = players.slice(0, 100).map((player, idx) => ({
        rank: idx + 1,
        username: player.username,
        level: player.level,
        xp: player.xp,
        coins: player.coins,
        totalSolved: player.completedProblems?.length || 0,
        currentStreak: player.currentStreak || 0,
        rankClass: player.rank || 'Novice',
        currentTitle: player.currentTitle || 'Beginner Knight'
    }));

    res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard data retrieved successfully'));
}));

module.exports = router;
