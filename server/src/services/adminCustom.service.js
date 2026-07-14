const User = require('../models/user.model');
const Problem = require('../models/problem.model');
const World = require('../models/world.model');
const Topic = require('../models/topic.model');
const Boss = require('../models/boss.model');
const Submission = require('../models/submission.model');
const QuestTemplate = require('../models/questTemplate.model');
const AchievementTemplate = require('../models/achievementTemplate.model');
const Progress = require('../models/progress.model');
const ApiError = require('../utils/apiError');

class AdminCustomService {
    async getDashboardStats() {
        const [
            totalUsers,
            activeUsers,
            totalProblems,
            totalRealms,
            totalTopics,
            totalBosses,
            totalSubmissions,
            acceptedSubmissions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ updatedAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
            Problem.countDocuments(),
            World.countDocuments(),
            Topic.countDocuments(),
            Boss.countDocuments(),
            Submission.countDocuments(),
            Submission.countDocuments({ verdict: 'accepted' })
        ]);

        const successRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        // Sum XP and Coins distributed
        const xpCoinsAggregation = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalXp: { $sum: '$xp' },
                    totalCoins: { $sum: '$coins' }
                }
            }
        ]);

        const totalXp = xpCoinsAggregation[0]?.totalXp || 0;
        const totalCoins = xpCoinsAggregation[0]?.totalCoins || 0;

        return {
            totalUsers,
            activeUsers,
            totalProblems,
            totalRealms,
            totalTopics,
            totalBosses,
            totalSubmissions,
            acceptedSubmissions,
            successRate,
            totalXp,
            totalCoins
        };
    }

    async getDashboardAnalytics() {
        // Retrieve analytics
        const dailyActiveUsers = [
            { day: 'Mon', count: 12 },
            { day: 'Tue', count: 18 },
            { day: 'Wed', count: 15 },
            { day: 'Thu', count: 24 },
            { day: 'Fri', count: 29 },
            { day: 'Sat', count: 32 },
            { day: 'Sun', count: 28 }
        ];

        const submissionsTrend = [
            { date: '07/04', count: 32, accepted: 14 },
            { date: '07/05', count: 45, accepted: 21 },
            { date: '07/06', count: 28, accepted: 12 },
            { date: '07/07', count: 50, accepted: 30 },
            { date: '07/08', count: 64, accepted: 38 },
            { date: '07/09', count: 72, accepted: 42 },
            { date: '07/10', count: 58, accepted: 35 }
        ];

        // Fetch top solved problems
        const mostSolvedProblems = await Submission.aggregate([
            { $match: { verdict: 'accepted' } },
            { $group: { _id: '$problem', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            { $unwind: '$problemDetails' },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    title: '$problemDetails.title',
                    difficulty: '$problemDetails.difficulty'
                }
            }
        ]);

        return {
            dailyActiveUsers,
            submissionsTrend,
            mostSolvedProblems
        };
    }

    async getUsers({ search = '', role = '', page = 1, limit = 10 }) {
        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query)
        ]);

        return {
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page)
        };
    }

    async updateUserRole(targetUserId, newRole) {
        if (!['student', 'moderator', 'admin'].includes(newRole)) {
            throw new ApiError(400, 'Invalid role assignment');
        }
        const user = await User.findByIdAndUpdate(targetUserId, { role: newRole }, { new: true }).select('-password');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    async resetUserXp(targetUserId) {
        const user = await User.findByIdAndUpdate(targetUserId, { xp: 0, level: 1 }, { new: true }).select('-password');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    async resetUserCoins(targetUserId) {
        const user = await User.findByIdAndUpdate(targetUserId, { coins: 0 }, { new: true }).select('-password');
        if (!user) throw new ApiError(404, 'User not found');
        return user;
    }

    async resetUserProgress(targetUserId) {
        const user = await User.findById(targetUserId);
        if (!user) throw new ApiError(404, 'User not found');

        user.completedProblems = [];
        user.completedTopics = [];
        user.completedWorlds = [];
        user.xp = 0;
        user.coins = 0;
        user.level = 1;
        user.bossesDefeated = [];
        user.bossTrophies = [];
        await user.save();

        await Progress.deleteMany({ user: targetUserId });
        await Submission.deleteMany({ user: targetUserId });

        return user;
    }

    async deleteUser(targetUserId) {
        const user = await User.findByIdAndDelete(targetUserId);
        if (!user) throw new ApiError(404, 'User not found');
        await Progress.deleteMany({ user: targetUserId });
        await Submission.deleteMany({ user: targetUserId });
        return { message: 'User deleted successfully' };
    }

    // Quest CRUD helper
    async getAllQuests() {
        return QuestTemplate.find().sort({ createdAt: -1 });
    }

    async createQuest(data) {
        return QuestTemplate.create(data);
    }

    async updateQuest(id, data) {
        return QuestTemplate.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteQuest(id) {
        return QuestTemplate.findByIdAndDelete(id);
    }

    // Achievements CRUD helper
    async getAllAchievements() {
        return AchievementTemplate.find().sort({ createdAt: -1 });
    }

    async createAchievement(data) {
        return AchievementTemplate.create(data);
    }

    async updateAchievement(id, data) {
        return AchievementTemplate.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteAchievement(id) {
        return AchievementTemplate.findByIdAndDelete(id);
    }

    // Boss CRUD helper
    async getAllBosses() {
        return Boss.find().populate('realmId').populate('problemId').sort({ createdAt: -1 });
    }

    async createBoss(data) {
        return Boss.create(data);
    }

    async updateBoss(id, data) {
        return Boss.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteBoss(id) {
        return Boss.findByIdAndDelete(id);
    }
}

module.exports = new AdminCustomService();
