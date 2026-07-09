const mongoose = require('mongoose');
const Submission = require('../models/submission.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const World = require('../models/world.model');
const codeExecutionService = require('./codeExecution.service');
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

class SubmissionService {
    /**
     * Evaluates and records user code submissions, updating rewards and level thresholds.
     */
    async submitSolution({ userId, problemId, code, language }) {
        // 1. Fetch user and problem context
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User account not found');
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new ApiError(404, 'DSA problem not found');
        }

        // 2. Fetch test cases associated with the problem
        const testCases = await TestCase.find({ problem: problemId });
        const finalTestCases = testCases.length > 0 ? testCases : [{ input: 'default', expectedOutput: 'default', hidden: false }];

        // 3. Delegate execution details to CodeExecutionService
        const result = await codeExecutionService.execute(code, language, finalTestCases);

        let progressUpdated = false;
        let isFirstSolve = false;
        let xpGained = 0;
        let coinsGained = 0;

        // Fetch or create user progress inside this world
        let progress = await Progress.findOne({ user: userId, world: problem.world });
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

                // Calculate level scaling
                const levelDetails = getLevelInfo(user.xp);
                user.level = levelDetails.level;
                progress.currentLevel = user.level;

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

                // Check if the solved problem was the boss level to complete the world and unlock the next world
                if (problem.bossLevel) {
                    progress.isCompleted = true;

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
            }
        }

        // 5. Establish transaction boundary with standalone support fallback
        let session = null;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (e) {
            session = null; // System lacks replica set support
        }

        try {
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

            return {
                submission,
                rewards: {
                    xpGained,
                    coinsGained,
                    isFirstSolve,
                    currentLevel: user.level
                }
            };

        } catch (error) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            throw error;
        }
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
