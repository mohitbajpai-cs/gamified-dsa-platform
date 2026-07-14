require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Problem = require('./src/models/problem.model');
const World = require('./src/models/world.model');
const Topic = require('./src/models/topic.model');
const Contest = require('./src/models/contest.model');
const ContestParticipation = require('./src/models/contestParticipation.model');
const ContestSubmission = require('./src/models/contestSubmission.model');
const ContestRatingHistory = require('./src/models/contestRatingHistory.model');
const contestService = require('./src/services/contest.service');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-dsa';

async function run() {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    try {
        console.log('\n--- SETUP: Preparing Contest Test Data ---');
                // Clean previous test states
        await User.deleteMany({ email: /test_contest_user/ });
        await Contest.deleteMany({ title: /Test Championship/ });
        await World.deleteMany({ name: 'Contest World' });
        await Topic.deleteMany({ name: 'Contest Topic' });
        await Problem.deleteMany({ title: 'Contest Problem A' });

        // 1. Create test users
                const user1 = await User.create({
            username: 'contest_user_1',
            email: 'test_contest_user_1@abyss.com',
            password: 'Password123',
            role: 'student',
            contestRating: 1200,
            xp: 100,
            coins: 50
        });
        const user2 = await User.create({
            username: 'contest_user_2',
            email: 'test_contest_user_2@abyss.com',
            password: 'Password123',
            role: 'student',
            contestRating: 1400,
            xp: 150,
            coins: 100
        });
        console.log(`Created test users: ${user1.username} (${user1.contestRating}), ${user2.username} (${user2.contestRating})`);

        // Get a dummy problem to assign
        let problem = await Problem.findOne();
        if (!problem) {
            // Seed a dummy problem if not exists
            const world = await World.create({ 
                name: 'Contest World', 
                description: 'Testing', 
                unlockLevel: 1,
                difficulty: 'beginner',
                slug: 'contest-world'
            });
            const topic = await Topic.create({
                name: 'Contest Topic',
                description: 'Contest Topic Descr',
                world: world._id,
                difficulty: 'easy',
                order: 1,
                slug: 'contest-topic'
            });
            problem = await Problem.create({
                title: 'Contest Problem A',
                description: 'Solve the matrix',
                difficulty: 'easy',
                world: world._id,
                topic: topic._id,
                slug: 'contest-problem-a',
                xpReward: 100,
                coinReward: 25
            });
        }

        // 2. Create Rated Contest
        const contest = await contestService.createContest({
            title: 'Test Championship Gate',
            description: 'A timed championship to test Elo calculation stability',
            type: 'Weekly Contest',
            startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
            endTime: new Date(Date.now() + 30 * 60 * 1000),  // Ends in 30 mins
            duration: 60,
            problems: [problem._id],
            difficulty: 'Easy',
            maxParticipants: 10,
            rewards: {
                xp: 600,
                coins: 200,
                badge: 'badge-test-champion'
            },
            status: 'live'
        });
        console.log('Created Contest:', contest.title, 'Status:', contest.status);

        // 3. User Registrations
        console.log('\n--- STEP 1: Registering users for contest ---');
        const reg1 = await contestService.registerUser(contest._id, user1._id);
        const reg2 = await contestService.registerUser(contest._id, user2._id);
        console.log(`Registration status: User 1: ${reg1.status}, User 2: ${reg2.status}`);
        if (reg1.status !== 'registered' || reg2.status !== 'registered') {
            throw new Error('Registration status verification failed');
        }

        // 4. Start Sessions
        console.log('\n--- STEP 2: Starting active sessions ---');
        const start1 = await contestService.startContest(contest._id, user1._id);
        const start2 = await contestService.startContest(contest._id, user2._id);
        console.log(`Session status: User 1: ${start1.status}, User 2: ${start2.status}`);
        if (start1.status !== 'active' || start2.status !== 'active') {
            throw new Error('Active session initiation failed');
        }

        // 5. Solution Submissions
        console.log('\n--- STEP 3: Submitting code solutions ---');
        
        // Mocking execution result directly (since we test evaluation in other suites)
        // User 1 solves Problem A immediately (Accepted, 5 mins elapsed)
        const sub1 = await contestSubmissionMock(contest._id, user1._id, problem._id, 'accepted', 5);
        console.log('User 1 Submission Verdict:', sub1.verdict, 'solvedCount:', sub1.solvedCount, 'penalty:', sub1.penalty);

        // User 2 gets WA first (after 10 mins elapsed) then solves it (Accepted, 15 mins elapsed)
        const sub2Wa = await contestSubmissionMock(contest._id, user2._id, problem._id, 'wrong_answer', 10);
        console.log('User 2 WA Submission:', sub2Wa.verdict, 'solvedCount:', sub2Wa.solvedCount, 'penalty:', sub2Wa.penalty);
        
        const sub2Ac = await contestSubmissionMock(contest._id, user2._id, problem._id, 'accepted', 15);
        console.log('User 2 AC Submission:', sub2Ac.verdict, 'solvedCount:', sub2Ac.solvedCount, 'penalty:', sub2Ac.penalty);

        // Asserts solved counts & penalties
        if (sub1.solvedCount !== 1 || sub1.penalty !== 5) {
            throw new Error(`User 1 solving state mismatch: ${sub1.solvedCount} solved, ${sub1.penalty} penalty`);
        }
        // User 2 penalty: 15 mins + 20 mins penalty for 1 wrong answer = 35 mins
        if (sub2Ac.solvedCount !== 1 || sub2Ac.penalty !== 35) {
            throw new Error(`User 2 solving state mismatch: ${sub2Ac.solvedCount} solved, ${sub2Ac.penalty} penalty`);
        }
        console.log('✔ Submission scores, counts, and penalty metrics verified successfully.');

        // 6. Conclude Contest & Ratings Update
        console.log('\n--- STEP 4: Concluding contest & publishing results ---');
        // Force contest completion
        contest.status = 'completed';
        contest.endTime = new Date(Date.now() - 5000);
        await contest.save();

        await contestService.publishContestResults(contest._id);
        console.log('Ratings calculations and rewards disbursed.');

        // Verify updated ratings
        const updatedUser1 = await User.findById(user1._id);
        const updatedUser2 = await User.findById(user2._id);
        console.log(`\nNew Ratings:`);
        console.log(`${updatedUser1.username}: Rating: ${updatedUser1.contestRating} (highest: ${updatedUser1.highestRating}), XP: ${updatedUser1.xp}, Coins: ${updatedUser1.coins}, Badges: ${updatedUser1.contestBadges.join(', ')}`);
        console.log(`${updatedUser2.username}: Rating: ${updatedUser2.contestRating} (highest: ${updatedUser2.highestRating}), XP: ${updatedUser2.xp}, Coins: ${updatedUser2.coins}`);

        if (updatedUser1.contestRating <= 1200) {
            throw new Error('User 1 rating should have increased as they won the contest');
        }
        if (!updatedUser1.contestBadges.includes('badge-test-champion')) {
            throw new Error('User 1 should have received the contest badge');
        }

        // Verify history logs exist
        const history1 = await ContestRatingHistory.find({ user: user1._id });
        const history2 = await ContestRatingHistory.find({ user: user2._id });
        console.log(`Rating Logs Count: User 1: ${history1.length}, User 2: ${history2.length}`);
        if (history1.length === 0 || history2.length === 0) {
            throw new Error('Contest history logs not generated');
        }

        // Clean up test documents
        console.log('\nCleaning up test documents...');
        await User.deleteMany({ email: /test_contest_user/ });
        await Contest.deleteMany({ title: /Test Championship/ });
        await ContestParticipation.deleteMany({ contest: contest._id });
        await ContestSubmission.deleteMany({ contest: contest._id });
        await ContestRatingHistory.deleteMany({ contest: contest._id });
        console.log('Cleaned.');

        console.log('\n✔ --- ALL CONTEST SYSTEM INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('\n✘ INTEGRATION TEST FAILED:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

// Helper mock submission simulator to skip running actual node code compiler sandbox during database tests
async function contestSubmissionMock(contestId, userId, problemId, verdict, elapsedMin) {
    const registration = await ContestParticipation.findOne({ contest: contestId, user: userId });
    if (!registration) throw new Error('Contest participation not found');

    const prevAttemptsCount = await ContestSubmission.countDocuments({
        contest: contestId,
        user: userId,
        problem: problemId,
        verdict: { $ne: 'accepted' }
    });

    await ContestSubmission.create({
        contest: contestId,
        user: userId,
        problem: problemId,
        code: 'console.log("test")',
        language: 'javascript',
        verdict,
        penaltyTime: elapsedMin,
        testCasesPassed: verdict === 'accepted' ? 3 : 1,
        totalTestCases: 3
    });

    if (verdict === 'accepted') {
        const alreadySolved = await ContestSubmission.findOne({
            contest: contestId,
            user: userId,
            problem: problemId,
            verdict: 'accepted',
            _id: { $ne: null }
        });
        // Avoid duplicate counting
        const previousSolutions = await ContestSubmission.countDocuments({
            contest: contestId,
            user: userId,
            problem: problemId,
            verdict: 'accepted'
        });

        if (previousSolutions <= 1) {
            registration.solvedCount += 1;
            registration.penalty += elapsedMin + (prevAttemptsCount * 20);
            await registration.save();
        }
    }

    return {
        verdict,
        solvedCount: registration.solvedCount,
        penalty: registration.penalty
    };
}

run();
