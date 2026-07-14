const mongoose = require('mongoose');
const Submission = require('../models/submission.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const World = require('../models/world.model');
const judgeService = require('./judge.service');
const ApiError = require('../utils/apiError');

/**
 * Calculates dynamic level details based on cumulative XP using formula:
 * Next Level XP Threshold = 100 * (Level ^ 1.5)
 */
const getLevelInfo = (cumulativeXP) => {
    let level = 1;
    while (true) {
        const xpThreshold = Math.round(100 * Math.pow(level, 1.5));
        if (cumulativeXP >= xpThreshold) {
            level++;
        } else {
            break;
        }
    }
    const currentThreshold = level > 1 ? Math.round(100 * Math.pow(level - 1, 1.5)) : 0;
    const nextThreshold = Math.round(100 * Math.pow(level, 1.5));

    return {
        level,
        nextLevelXP: nextThreshold,
        xpInCurrentLevel: cumulativeXP - currentThreshold,
        xpForNextLevel: nextThreshold - currentThreshold
    };
};

/**
 * Calculates user consecutive solve streak in calendar days.
 */
const calculateStreak = (lastSolvedDate) => {
    if (!lastSolvedDate) {
        return { currentStreak: 1, reset: false };
    }
    
    const today = new Date();
    const last = new Date(lastSolvedDate);
    
    const todayMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const lastMidnight = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate());
    
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((todayMidnight - lastMidnight) / msPerDay);
    
    if (diffDays === 0) {
        return { keep: true };
    } else if (diffDays === 1) {
        return { increment: true };
    } else {
        return { reset: true };
    }
};

/**
 * Sweeps and unlocks user progression achievement flags.
 */
const checkAchievements = async (user, problem, result, worldCompleted, topicCompleted) => {
    const unlocked = [];
    const totalSolved = user.completedProblems.length;
    
    const Problem = require('../models/problem.model');
    const completedProblemsDocs = await Problem.find({ _id: { $in: user.completedProblems } }).populate('world');
    
    const arraySolvedCount = completedProblemsDocs.filter(p => p.tags.includes('arrays') || p.tags.includes('arrays-dungeons') || (p.world && p.world.name.toLowerCase().includes('arrays'))).length;
    const stringSolvedCount = completedProblemsDocs.filter(p => p.tags.includes('strings') || (p.world && p.world.name.toLowerCase().includes('strings'))).length;
    const treeSolvedCount = completedProblemsDocs.filter(p => p.tags.includes('trees') || p.tags.includes('bst') || (p.world && (p.world.name.toLowerCase().includes('trees') || p.world.name.toLowerCase().includes('bst')))).length;
    const graphSolvedCount = completedProblemsDocs.filter(p => p.tags.includes('graphs') || (p.world && p.world.name.toLowerCase().includes('graphs'))).length;
    const dpSolvedCount = completedProblemsDocs.filter(p => p.tags.includes('dynamic-programming') || (p.world && p.world.name.toLowerCase().includes('programming'))).length;
    
    const bossSolvedCount = completedProblemsDocs.filter(p => p.bossLevel).length;

    const conditions = [
        { id: 'First Blood', check: totalSolved >= 1, badge: 'first_blood', rarity: 'common', xp: 100, coins: 20, desc: 'Solved your first DSA challenge in the Abyss.' },
        { id: 'Novice Solver', check: totalSolved >= 5, badge: 'novice_solver', rarity: 'common', xp: 150, coins: 40, desc: 'Solved 5 DSA challenges.' },
        { id: 'Array Master', check: arraySolvedCount >= 10, badge: 'array_master', rarity: 'rare', xp: 250, coins: 80, desc: 'Mastered the Array Runes by solving 10 Array problems.' },
        { id: 'String Mage', check: stringSolvedCount >= 10, badge: 'string_mage', rarity: 'rare', xp: 250, coins: 80, desc: 'Tamed the String Serpent by solving 10 String problems.' },
        { id: 'Tree Guardian', check: treeSolvedCount >= 10, badge: 'tree_guardian', rarity: 'rare', xp: 250, coins: 80, desc: 'Protected the Tree of Traversals by solving 10 Tree problems.' },
        { id: 'Graph Explorer', check: graphSolvedCount >= 10, badge: 'graph_explorer', rarity: 'epic', xp: 400, coins: 150, desc: 'Traversed the void graphs by solving 10 Graph problems.' },
        { id: 'DP Champion', check: dpSolvedCount >= 10, badge: 'dp_champion', rarity: 'epic', xp: 500, coins: 200, desc: 'Solved the dynamic algorithm abyss with 10 DP problems.' },
        { id: 'Speed Runner', check: result.timeTaken !== undefined && result.timeTaken < 120000, badge: 'speed_runner', rarity: 'rare', xp: 200, coins: 50, desc: 'Completed any coding dungeon challenge in under 2 minutes.' },
        { id: 'Boss Slayer', check: bossSolvedCount >= 1, badge: 'boss_slayer', rarity: 'epic', xp: 500, coins: 150, desc: 'Defeated a world Boss Guardian.' },
        { id: 'Realm Conqueror', check: user.completedWorlds.length >= 1, badge: 'realm_conqueror', rarity: 'epic', xp: 600, coins: 200, desc: 'Fully conquered all problems in any Realm.' },
        { id: 'Abyss Legend', check: user.completedWorlds.length >= 9, badge: 'abyss_legend', rarity: 'legendary', xp: 1000, coins: 500, desc: 'Unlocked and conquered the final Abyss Throne.' }
    ];

    const Achievement = require('../models/achievement.model');

    for (const cond of conditions) {
        if (cond.check && !user.achievements.includes(cond.id)) {
            user.achievements.push(cond.id);
            user.unlockedAchievements.push(cond.id);
            unlocked.push(cond.id);

            try {
                await Achievement.create({
                    user: user._id,
                    title: cond.id,
                    description: cond.desc,
                    badge: cond.badge,
                    rarity: cond.rarity,
                    xpReward: cond.xp,
                    coinReward: cond.coins,
                    unlockedAt: new Date()
                });
            } catch (err) {
                // Ignore duplicates
            }

            user.xp += cond.xp;
            user.coins += cond.coins;
        }
    }
    
    return unlocked;
};

class SubmissionService {
    /**
     * Evaluates and records user code submissions, updating rewards and level thresholds.
     */
    async submitSolution({ userId, problemId, code, language, isSubmit = false }) {
        // 1. Fetch user and problem context
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User account not found');
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new ApiError(404, 'DSA problem not found');
        }

        // 2. Fetch test cases associated with the problem based on isSubmit
        let testCases = [];
        if (isSubmit) {
            testCases = await TestCase.find({ problem: problemId, hidden: true });
        } else {
            testCases = await TestCase.find({ problem: problemId, hidden: false });
        }
        
        if (testCases.length === 0) {
            testCases = await TestCase.find({ problem: problemId });
        }
        
        const finalTestCases = (testCases.length > 0 ? testCases : [{ input: 'default', expectedOutput: 'default', hidden: false }]).map(tc => {
            const obj = tc.toObject ? tc.toObject() : tc;
            return {
                ...obj,
                comparisonMode: problem.comparisonMode || 'exact'
            };
        });

        // 3. Delegate execution details to JudgeService
        const result = await judgeService.execute(code, language, finalTestCases, isSubmit);

        // 3.5 Calculate Code Complexity Analysis
        let complexity = null;
        if (result.verdict !== 'compilation_error') {
            try {
                const complexityAnalysisService = require('./complexityAnalysis.service');
                complexity = complexityAnalysisService.analyze(code, language);
            } catch (err) {
                console.error('Complexity analysis execution error:', err);
            }
        }

        let progressUpdated = false;
        let isFirstSolve = false;
        let xpGained = 0;
        let coinsGained = 0;
        let progress = null;

        if (isSubmit) {
            // Fetch or create user progress inside this world
            progress = await Progress.findOne({ user: userId, world: problem.world });
            if (!progress) {
                progress = new Progress({
                    user: userId,
                    world: problem.world,
                    completedProblems: [],
                    unlockedWorlds: [problem.world]
                });
            }

            // 4. Update stats if the submission is accepted
            if (result.verdict === 'accepted') {
                const isCompletedBefore = progress.completedProblems.some(
                    pId => String(pId) === String(problemId)
                );
                if (!isCompletedBefore) {
                    isFirstSolve = true;
                    progressUpdated = true;
                    xpGained = problem.xpReward || 0;
                    coinsGained = problem.coinReward || 0;

                    // Update Progress document
                    progress.completedProblems.push(problemId);
                    progress.totalXP += xpGained;
                    progress.totalCoins += coinsGained;

                    // Update User document
                    user.xp += xpGained;
                    user.coins += coinsGained;
                    
                    // Award Guild XP if user belongs to an alliance
                    try {
                        const Guild = mongoose.model('Guild');
                        const guild = await Guild.findOne({ members: user._id });
                        if (guild) {
                            guild.xp += xpGained;
                            const xpNeeded = guild.level * 1000;
                            if (guild.xp >= xpNeeded) {
                                guild.xp -= xpNeeded;
                                guild.level += 1;
                            }
                            await guild.save();
                        }
                    } catch (err) {
                        console.error('Guild model mapping error: ', err);
                    }
                    
                    // Keep completedProblems array on User synced
                    if (!user.completedProblems.includes(problemId.toString())) {
                        user.completedProblems.push(problemId.toString());
                    }
                    user.totalSolved = user.completedProblems.length;

                    // Calculate level scaling and level up details
                    const oldLevel = user.level || 1;
                    const levelDetails = getLevelInfo(user.xp);
                    user.level = levelDetails.level;
                    const levelIncreased = user.level > oldLevel;
                    progress.currentLevel = user.level;

                    // Streak System check & update
                    const today = new Date();
                    const streakResult = calculateStreak(user.lastSolvedDate);
                    if (streakResult.increment) {
                        user.currentStreak += 1;
                        user.lastSolvedDate = today;
                    } else if (streakResult.reset || !user.lastSolvedDate) {
                        user.currentStreak = 1;
                        user.lastSolvedDate = today;
                    } else if (streakResult.keep) {
                        user.lastSolvedDate = today;
                    }
                    if (user.currentStreak > user.longestStreak) {
                        user.longestStreak = user.currentStreak;
                    }
                    progress.currentStreak = user.currentStreak;

                    // Topic Complete check
                    const topicProblems = await Problem.find({ topic: problem.topic });
                    const completedSet = new Set(progress.completedProblems.map(id => id.toString()));
                    const allTopicSolved = topicProblems.every(tp => completedSet.has(tp._id.toString()));
                    let topicCompleted = false;
                    if (allTopicSolved && !user.completedTopics.includes(problem.topic.toString())) {
                        user.completedTopics.push(problem.topic.toString());
                        topicCompleted = true;
                    }

                    // Check if all non-boss problems are solved to unlock the boss level
                    const nonBossProblems = await Problem.find({
                        world: problem.world,
                        bossLevel: false
                    });

                    const allNonBossSolved = nonBossProblems.every(nbp =>
                        progress.completedProblems.some(cpId => String(cpId) === String(nbp._id))
                    );

                    if (allNonBossSolved && nonBossProblems.length > 0) {
                        progress.isBossUnlocked = true;
                    }

                    // Check if all problems under the current world are solved to complete the world
                    const worldProblems = await Problem.find({ world: problem.world });
                    const allWorldSolved = worldProblems.every(wp => completedSet.has(wp._id.toString()));
                    let worldCompleted = false;

                    if (problem.bossLevel || allWorldSolved) {
                        progress.isCompleted = true;
                        if (!user.completedWorlds.includes(problem.world.toString())) {
                            user.completedWorlds.push(problem.world.toString());
                            worldCompleted = true;
                        }

                        // Fetch next world sorted by order sequence
                        const currentWorld = await World.findById(problem.world);
                        if (currentWorld) {
                            const nextWorld = await World.findOne({
                                order: { $gt: currentWorld.order }
                            }).sort({ order: 1 });

                            if (nextWorld) {
                                // Add next world reference to unlocked worlds
                                if (!progress.unlockedWorlds.includes(nextWorld._id)) {
                                    progress.unlockedWorlds.push(nextWorld._id);
                                }

                                // Initialize next world progress tracking document
                                let nextProgress = await Progress.findOne({
                                    user: userId,
                                    world: nextWorld._id
                                });

                                if (!nextProgress) {
                                    await Progress.create({
                                        user: userId,
                                        world: nextWorld._id,
                                        completedProblems: [],
                                        unlockedWorlds: [...progress.unlockedWorlds]
                                    });
                                }
                            }
                        }
                    }

                    // Update active quests progress
                    const Quest = require('../models/quest.model');
                    const activeQuests = await Quest.find({
                        user: userId,
                        completed: false,
                        expiresAt: { $gt: new Date() }
                    });

                    for (const quest of activeQuests) {
                        let increment = 0;
                        if (quest.targetType === 'solve_easy' && problem.difficulty === 'easy') {
                            increment = 1;
                        } else if (quest.targetType === 'solve_medium' && problem.difficulty === 'medium') {
                            increment = 1;
                        } else if (quest.targetType === 'solve_any') {
                            increment = 1;
                        } else if (quest.targetType === 'earn_xp') {
                            increment = xpGained;
                        } else if (quest.targetType === 'complete_topic' && topicCompleted) {
                            increment = 1;
                        } else if (quest.targetType === 'complete_world' && worldCompleted) {
                            increment = 1;
                        }

                        if (increment > 0) {
                            quest.currentValue += increment;
                            if (quest.currentValue >= quest.targetValue) {
                                quest.currentValue = quest.targetValue;
                                quest.completed = true;
                            }
                            await quest.save();
                        }
                    }

                    // Unlock achievements
                    const newlyUnlockedAchievements = await checkAchievements(user, problem, result, worldCompleted, topicCompleted);

                    // Recalculate level scaling after achievements
                    const finalLevelDetails = getLevelInfo(user.xp);
                    const finalLevelIncreased = finalLevelDetails.level > oldLevel;
                    user.level = finalLevelDetails.level;
                    progress.currentLevel = user.level;

                    // Save achievement data to be passed in response
                    result.rewardsExtra = {
                        levelIncreased: levelIncreased || finalLevelIncreased,
                        topicCompleted,
                        worldCompleted,
                        newlyUnlockedAchievements,
                        currentStreak: user.currentStreak,
                        longestStreak: user.longestStreak
                    };
                }
            }
        }

        // 5. Build submission document
        const submission = new Submission({
            user: userId,
            problem: problemId,
            code,
            language,
            verdict: result.verdict,
            score: result.score,
            executionTime: result.executionTime,
            memoryUsed: result.memoryUsed,
            testCasesPassed: result.testCasesPassed,
            totalTestCases: result.totalTestCases,
            errorMessage: result.errorMessage,
            submittedAt: new Date()
        });

        if (isSubmit) {
            // Establish transaction boundary with standalone support fallback
            let session = null;
            const topologyType = mongoose.connection.client?.topology?.description?.type;
            const isReplicaSet = topologyType === 'ReplicaSetWithPrimary' || topologyType === 'ReplicaSetNoPrimary';

            if (isReplicaSet) {
                try {
                    session = await mongoose.startSession();
                    session.startTransaction();
                } catch (e) {
                    session = null;
                }
            }

            try {
                if (session) {
                    await submission.save({ session });
                    if (progressUpdated) {
                        await progress.save({ session });
                        await user.save({ session });
                    }
                    await session.commitTransaction();
                    session.endSession();
                } else {
                    await submission.save();
                    if (progressUpdated) {
                        await progress.save();
                        await user.save();
                    }
                }
            } catch (error) {
                if (session) {
                    await session.abortTransaction();
                    session.endSession();
                }
                throw error;
            }
        }

        const submissionJson = submission.toObject ? submission.toObject() : submission;
        // Canonical output fields for the frontend
        submissionJson.actualOutput = result.actualOutput !== undefined ? result.actualOutput : null;
        submissionJson.expectedOutput = result.expectedOutput !== undefined ? result.expectedOutput : null;
        submissionJson.failedInput = result.failedInput !== undefined ? result.failedInput : null;
        submissionJson.passedCases = result.testCasesPassed;
        submissionJson.totalCases = result.totalTestCases;
        submissionJson.runtime = result.executionTime;
        submissionJson.memory = result.memoryUsed;
        submissionJson.stderr = result.errorMessage || '';

        return {
            submission: submissionJson,
            rewards: {
                xpGained,
                coinsGained,
                isFirstSolve,
                currentLevel: user.level,
                ...(result.rewardsExtra || {})
            },
            complexity
        };
    }

    /**
     * Retrieves submission history for the authenticated user.
     */
    async getHistory(userId) {
        return await Submission.find({ user: userId })
            .populate('problem', 'title difficulty bossLevel')
            .sort({ submittedAt: -1 });
    }

    /**
     * Retrieves submission history for a specific problem.
     */
    async getProblemHistory(userId, problemId) {
        return await Submission.find({ user: userId, problem: problemId })
            .populate('problem', 'title difficulty bossLevel')
            .sort({ submittedAt: -1 });
    }

    // Export level helper for progress service
    getLevelDetails(xp) {
        return getLevelInfo(xp);
    }
}

module.exports = new SubmissionService();
