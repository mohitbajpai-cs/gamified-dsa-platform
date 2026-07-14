const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const World = require('../models/world.model');
const Problem = require('../models/problem.model');
const submissionService = require('./submission.service');
const ApiError = require('../utils/apiError');

class ProgressService {
    /**
     * Resolves consolidated progression log for the player, calculating levels, streak, and unlocked paths.
     */
    async getUserProgress(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User account not found');
        }

        // 1. Fetch all worlds and progress documents
        const allWorlds = await World.find().sort({ order: 1 });
        const progressDocs = await Progress.find({ user: userId });

        // 2. Map unlocked world IDs
        const unlockedWorldIds = new Set();
        progressDocs.forEach(p => unlockedWorldIds.add(p.world.toString()));
        progressDocs.forEach(p => {
            if (p.unlockedWorlds) {
                p.unlockedWorlds.forEach(wId => unlockedWorldIds.add(wId.toString()));
            }
        });

        // The first world is unlocked by default
        if (allWorlds.length > 0) {
            unlockedWorldIds.add(allWorlds[0]._id.toString());
        }

        const unlockedWorldsDocs = allWorlds.filter(w => unlockedWorldIds.has(w._id.toString()));

        // 3. Consolidate completed problem IDs
        const completedProblemIds = [];
        const completedProblemsDetail = [];
        progressDocs.forEach(p => {
            if (p.completedProblems) {
                p.completedProblems.forEach(pId => {
                    const idStr = pId.toString();
                    if (!completedProblemIds.includes(idStr)) {
                        completedProblemIds.push(idStr);
                        completedProblemsDetail.push({
                            _id: idStr,
                            world: p.world.toString()
                        });
                    }
                });
            }
        });

        // 4. Determine current active world (first unlocked world not completed)
        let currentWorldDoc = null;
        for (const world of allWorlds) {
            const isUnlocked = unlockedWorldIds.has(world._id.toString());
            if (isUnlocked) {
                const progress = progressDocs.find(p => p.world.toString() === world._id.toString());
                const isCompleted = progress ? progress.isCompleted : false;
                if (!isCompleted) {
                    currentWorldDoc = world;
                    break;
                }
            }
        }

        // Fallbacks if all are completed or no progression starts
        if (!currentWorldDoc && unlockedWorldsDocs.length > 0) {
            currentWorldDoc = unlockedWorldsDocs[unlockedWorldsDocs.length - 1];
        } else if (!currentWorldDoc && allWorlds.length > 0) {
            currentWorldDoc = allWorlds[0];
        }

        // 5. Calculate specific active world stats
        let progressPercentage = 0;
        let bossUnlocked = false;
        let activeWorldStreak = 0;

        if (currentWorldDoc) {
            const currentWorldProblems = await Problem.find({ world: currentWorldDoc._id });
            const currentWorldProgress = progressDocs.find(p => p.world.toString() === currentWorldDoc._id.toString());

            const totalProblemsInWorld = currentWorldProblems.length;
            const completedProblemsInWorld = currentWorldProgress ? currentWorldProgress.completedProblems.length : 0;

            if (totalProblemsInWorld > 0) {
                progressPercentage = Math.round((completedProblemsInWorld / totalProblemsInWorld) * 100);
            }

            bossUnlocked = currentWorldProgress ? currentWorldProgress.isBossUnlocked : false;
            activeWorldStreak = currentWorldProgress ? currentWorldProgress.currentStreak : 0;
        }

        // 6. Calculate level dynamics from submission helper
        const levelDetails = submissionService.getLevelDetails(user.xp);

        // Calculate solved metrics
        const allProblemsCount = await Problem.countDocuments();
        const solvedProblems = completedProblemIds.length;
        const solvedTopics = user.completedTopics ? user.completedTopics.length : 0;
        const solvedWorlds = user.completedWorlds ? user.completedWorlds.length : 0;
        const completionPercentage = allProblemsCount > 0 ? Math.round((solvedProblems / allProblemsCount) * 100) : 0;

        return {
            level: levelDetails.level,
            xp: user.xp,
            nextLevelXP: levelDetails.nextLevelXP,
            coins: user.coins,
            totalXP: user.xp,
            currentLevel: levelDetails.level,
            totalCoins: user.coins,
            completedProblems: completedProblemIds,
            completedProblemsDetail,
            unlockedWorlds: unlockedWorldsDocs,
            currentWorld: currentWorldDoc,
            bossUnlocked,
            progressPercentage,
            // Gamification requirements
            totalSolved: user.totalSolved || completedProblemIds.length,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            completedTopics: user.completedTopics || [],
            completedWorlds: user.completedWorlds || [],
            achievements: user.achievements || [],
            // Solved stats
            solvedProblems,
            solvedTopics,
            solvedWorlds,
            completionPercentage
        };
    }
}

module.exports = new ProgressService();
