const Contest = require('../models/contest.model');
const ContestParticipation = require('../models/contestParticipation.model');
const ContestSubmission = require('../models/contestSubmission.model');
const ContestRatingHistory = require('../models/contestRatingHistory.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const User = require('../models/user.model');
const codeExecutionService = require('./codeExecution.service');
const ApiError = require('../utils/apiError');

class ContestService {
    // Transition statuses dynamically
    async syncContestStatuses() {
        const now = new Date();
        
        // Find upcoming contests that should be live
        const upcomingToLive = await Contest.find({
            status: 'upcoming',
            startTime: { $lte: now },
            endTime: { $gt: now }
        });
        for (const c of upcomingToLive) {
            c.status = 'live';
            await c.save();
        }

        // Find live contests that should be completed
        const liveToCompleted = await Contest.find({
            status: 'live',
            endTime: { $lte: now }
        });
        for (const c of liveToCompleted) {
            c.status = 'completed';
            await c.save();
            // Publish results and process ratings
            await this.publishContestResults(c._id);
        }
    }

    async getAllContests() {
        await this.syncContestStatuses();
        return Contest.find().sort({ startTime: -1 });
    }

    async getContestById(contestId, userId) {
        await this.syncContestStatuses();
        const contest = await Contest.findById(contestId).populate('problems', 'title difficulty');
        if (!contest) throw new ApiError(404, 'Contest not found');

        let registration = null;
        if (userId) {
            registration = await ContestParticipation.findOne({ contest: contestId, user: userId });
        }

        return {
            contest,
            registration
        };
    }

    async registerUser(contestId, userId) {
        const contest = await Contest.findById(contestId);
        if (!contest) throw new ApiError(404, 'Contest not found');
        if (contest.status === 'completed') {
            throw new ApiError(400, 'Cannot register for a completed contest');
        }

        // Check slots
        const currentParticipants = await ContestParticipation.countDocuments({ contest: contestId });
        if (currentParticipants >= contest.maxParticipants) {
            throw new ApiError(400, 'Contest lobby is full');
        }

        // Create participation
        try {
            const registration = await ContestParticipation.create({
                contest: contestId,
                user: userId,
                status: 'registered'
            });
            return registration;
        } catch (err) {
            // Already registered
            return ContestParticipation.findOne({ contest: contestId, user: userId });
        }
    }

    async startContest(contestId, userId) {
        const contest = await Contest.findById(contestId);
        if (!contest) throw new ApiError(404, 'Contest not found');
        
        let registration = await ContestParticipation.findOne({ contest: contestId, user: userId });
        if (!registration) {
            // Auto register for practice/virtual
            registration = await this.registerUser(contestId, userId);
        }

        registration.status = 'active';
        registration.startTime = new Date();
        registration.endTime = new Date(Date.now() + contest.duration * 60 * 1000);
        await registration.save();

        return registration;
    }

    async submitContestSolution({ contestId, userId, problemId, code, language }) {
        const contest = await Contest.findById(contestId);
        if (!contest) throw new ApiError(404, 'Contest not found');

        const registration = await ContestParticipation.findOne({ contest: contestId, user: userId });
        if (!registration || registration.status !== 'active') {
            throw new ApiError(400, 'You must start the contest session before submitting solutions');
        }

        const elapsedMs = Date.now() - registration.startTime.getTime();
        const elapsedMin = Math.floor(elapsedMs / 1000 / 60);

        // Fetch test cases
        const testCases = await TestCase.find({ problem: problemId });
        const finalTestCases = testCases.length > 0 ? testCases : [{ input: 'default', expectedOutput: 'default', hidden: false }];

        // Evaluate solution
        const result = await codeExecutionService.execute(code, language, finalTestCases);

        // Count existing wrong submissions for penalty
        const prevAttemptsCount = await ContestSubmission.countDocuments({
            contest: contestId,
            user: userId,
            problem: problemId,
            verdict: { $ne: 'accepted' }
        });

        // Save submission
        await ContestSubmission.create({
            contest: contestId,
            user: userId,
            problem: problemId,
            code,
            language,
            verdict: result.verdict,
            penaltyTime: elapsedMin,
            testCasesPassed: result.testCasesPassed || 0,
            totalTestCases: result.totalTestCases || 3
        });

        // If newly accepted, recalculate solvedCount and penalty
        if (result.verdict === 'accepted') {
            const alreadySolved = await ContestSubmission.findOne({
                contest: contestId,
                user: userId,
                problem: problemId,
                verdict: 'accepted',
                _id: { $ne: result._id }
            });

            if (!alreadySolved) {
                registration.solvedCount += 1;
                // penalty = elapsed minutes + 20 minutes per wrong attempt
                registration.penalty += elapsedMin + (prevAttemptsCount * 20);
                await registration.save();
            }
        }

        return {
            verdict: result.verdict,
            solvedCount: registration.solvedCount,
            penalty: registration.penalty,
            testCasesPassed: result.testCasesPassed,
            totalTestCases: result.totalTestCases
        };
    }

    async getContestLeaderboard(contestId) {
        return ContestParticipation.find({ contest: contestId })
            .populate('user', 'username contestRating')
            .sort({ solvedCount: -1, penalty: 1 })
            .exec();
    }

    async getContestHistory(userId) {
        return ContestRatingHistory.find({ user: userId })
            .populate('contest', 'title type startTime')
            .sort({ createdAt: -1 });
    }

    // Publish Results & Ratings Calculations
    async publishContestResults(contestId) {
        const contest = await Contest.findById(contestId);
        if (!contest || contest.status !== 'completed') return;

        const participations = await ContestParticipation.find({ contest: contestId })
            .sort({ solvedCount: -1, penalty: 1 });

        const totalParticipants = participations.length;
        if (totalParticipants === 0) return;

        // Perform Elo calculation
        const K_FACTOR = 32;

        for (let i = 0; i < totalParticipants; i++) {
            const playerPart = participations[i];
            const player = await User.findById(playerPart.user);
            if (!player) continue;

            const oldRating = player.contestRating || 1200;
            const rank = i + 1;

            // Actual score mapped between 1.0 (1st place) and 0.0 (last place)
            const actualScore = totalParticipants > 1 ? (totalParticipants - rank) / (totalParticipants - 1) : 1.0;

            // Expected score (versus average cohort rating of 1200)
            const expectedScore = 1 / (1 + Math.pow(10, (1200 - oldRating) / 400));

            const ratingChange = Math.round(K_FACTOR * (actualScore - expectedScore));
            const newRating = Math.max(100, oldRating + ratingChange);

            // Update user document
            player.contestRating = newRating;
            player.highestRating = Math.max(player.highestRating || 1200, newRating);
            player.contestsPlayed += 1;
            if (rank === 1) player.contestsWon += 1;
            player.bestRank = player.bestRank ? Math.min(player.bestRank, rank) : rank;

            // Distribute contest rewards on first completion
            if (playerPart.status !== 'completed') {
                player.xp += contest.rewards.xp || 500;
                player.coins += contest.rewards.coins || 100;
                if (contest.rewards.badge) {
                    player.contestBadges.push(contest.rewards.badge);
                }
                playerPart.status = 'completed';
            }

            await player.save();

            playerPart.ratingChange = ratingChange;
            await playerPart.save();

            // Record Rating History log
            await ContestRatingHistory.create({
                user: player._id,
                contest: contestId,
                oldRating,
                newRating,
                rank,
                ratingChange
            });
        }
    }

    // Admin CRUD helpers
    async createContest(data) {
        return Contest.create(data);
    }

    async updateContest(id, data) {
        return Contest.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteContest(id) {
        return Contest.findByIdAndDelete(id);
    }
}

module.exports = new ContestService();
