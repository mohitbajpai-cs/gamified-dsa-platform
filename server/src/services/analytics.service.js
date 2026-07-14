const mongoose = require('mongoose');
const Submission = require('../models/submission.model');
const User = require('../models/user.model');
const Problem = require('../models/problem.model');
const Topic = require('../models/topic.model');
const Guild = require('../models/guild.model');
const ContestParticipation = require('../models/contestParticipation.model');

class AnalyticsService {
    async getUserAnalytics(userId) {
        const uId = new mongoose.Types.ObjectId(userId);

        // 1. Difficulty distribution of solved problems
        const difficultySolves = await Submission.aggregate([
            { $match: { user: uId, verdict: 'accepted' } },
            { $group: { _id: '$problem', lang: { $first: '$language' } } }, // Unique solved problems
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            { $unwind: '$problemDetails' },
            { $group: { _id: '$problemDetails.difficulty', count: { $sum: 1 } } }
        ]);

        const difficultySolvedObj = { easy: 0, medium: 0, hard: 0 };
        difficultySolves.forEach(ds => {
            if (ds._id) difficultySolvedObj[ds._id.toLowerCase()] = ds.count;
        });

        // 2. Language Usage
        const langUsage = await Submission.aggregate([
            { $match: { user: uId } },
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 3. Success Rate
        const totalSubmissions = await Submission.countDocuments({ user: uId });
        const acceptedSubmissions = await Submission.countDocuments({ user: uId, verdict: 'accepted' });
        const successRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        // 4. Topic mastery
        const topicMastery = await this.getTopicMastery(userId);

        // 5. Contest Performance History
        const contestHistory = await ContestParticipation.find({ user: uId })
            .populate('contest', 'title type')
            .sort({ createdAt: -1 })
            .limit(10);

        // 6. Guild Contribution
        let guildContribution = null;
        const guild = await Guild.findOne({ members: uId }).populate('members', 'xp');
        if (guild) {
            const user = await User.findById(uId);
            guildContribution = {
                guildName: guild.name,
                userXP: user.xp,
                guildXP: guild.xp,
                contributionPct: guild.xp > 0 ? Math.round((user.xp / Math.max(user.xp, guild.xp)) * 100) : 0
            };
        }

        // Generate insights
        let strongestTopic = 'None';
        let weakestTopic = 'None';
        if (topicMastery.length > 0) {
            const sortedMastery = [...topicMastery].sort((a, b) => b.percentage - a.percentage);
            strongestTopic = sortedMastery[0].name;
            weakestTopic = sortedMastery[sortedMastery.length - 1].name;
        }

        const user = await User.findById(userId);

        return {
            difficultySolved: difficultySolvedObj,
            languageUsage: langUsage.map(l => ({ name: l._id, value: l.count })),
            successRate,
            totalSubmissions,
            acceptedSubmissions,
            topicMastery: topicMastery.slice(0, 8),
            contests: contestHistory,
            guildContribution,
            insights: {
                strongestTopic,
                weakestTopic,
                mostUsedLanguage: langUsage[0]?._id || 'JavaScript',
                streak: user.currentStreak || 0,
                successRate: `${successRate}%`,
                nextRealm: 'Volcano of Mastery',
                weakTopicsToPractice: topicMastery.filter(t => t.percentage < 40).map(t => t.name).slice(0, 3)
            }
        };
    }

    async getTopicMastery(userId) {
        const uId = new mongoose.Types.ObjectId(userId);

        // Fetch user's solved unique problems
        const solvedSubmissions = await Submission.find({ user: uId, verdict: 'accepted' }).select('problem');
        const solvedProblemIds = new Set(solvedSubmissions.map(s => String(s.problem)));

        // Get all topics
        const topics = await Topic.find({});
        const masteryPromises = topics.map(async (t) => {
            const totalProblemsCount = await Problem.countDocuments({ topic: t._id });
            const problems = await Problem.find({ topic: t._id }).select('_id');
            const solvedCount = problems.filter(p => solvedProblemIds.has(String(p._id))).length;

            return {
                name: t.name,
                solved: solvedCount,
                total: totalProblemsCount,
                percentage: totalProblemsCount > 0 ? Math.round((solvedCount / totalProblemsCount) * 100) : 0
            };
        });

        return await Promise.all(masteryPromises);
    }

    async getActivityHeatmap(userId) {
        const uId = new mongoose.Types.ObjectId(userId);

        const activity = await Submission.aggregate([
            { $match: { user: uId } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return activity.map(a => ({ date: a._id, count: a.count }));
    }

    async getAdminAnalytics() {
        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }) || totalUsers;
        const totalSubmissions = await Submission.countDocuments({});
        const acceptedSubmissions = await Submission.countDocuments({ verdict: 'accepted' });
        const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        // Language popularity
        const languagePopularity = await Submission.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Guild leaderboard
        const guildStandings = await Guild.find().sort({ level: -1, xp: -1 }).limit(5);

        // Daily submissions over last 7 days
        const dailySubmissions = await Submission.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Daily user registrations
        const dailyRegistrations = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return {
            totalUsers,
            activeUsers,
            totalSubmissions,
            acceptanceRate,
            mostPopularLanguage: languagePopularity[0]?._id || 'JavaScript',
            guildRankings: guildStandings.map(g => ({ name: g.name, level: g.level, xp: g.xp })),
            dailySubmissions: dailySubmissions.map(d => ({ date: d._id, count: d.count })),
            dailyRegistrations: dailyRegistrations.map(r => ({ date: r._id, count: r.count }))
        };
    }
}

module.exports = new AnalyticsService();
