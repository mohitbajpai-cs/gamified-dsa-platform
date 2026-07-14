require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const World = require('./src/models/world.model');
const Topic = require('./src/models/topic.model');
const Problem = require('./src/models/problem.model');
const Submission = require('./src/models/submission.model');
const Guild = require('./src/models/guild.model');

const analyticsService = require('./src/services/analytics.service');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-dsa';

async function run() {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    try {
        console.log('\n--- SETUP: Preparing Analytics Test Data ---');
        // Clean previous states
        await User.deleteMany({ email: /test_analytics_user/ });
        await World.deleteMany({ name: 'Analytics World' });
        await Submission.deleteMany({ code: '/* analytics test code */' });

        // 1. Create a user
        const user = await User.create({
            username: 'analytics_user_1',
            email: 'test_analytics_user_1@abyss.com',
            password: 'Password123',
            role: 'student',
            xp: 1500,
            coins: 300,
            currentStreak: 5
        });

        // 2. Create World, Topic, and Problems
        const world = await World.create({
            name: 'Analytics World',
            description: 'Analytics world descr',
            unlockLevel: 1,
            difficulty: 'intermediate',
            slug: 'analytics-world'
        });

        const topic = await Topic.create({
            name: 'Analytics Topic A',
            description: 'Topic details',
            world: world._id,
            difficulty: 'easy',
            order: 1,
            slug: 'analytics-topic-a'
        });

        const problem1 = await Problem.create({
            title: 'Analytics Prob 1',
            description: 'Task details',
            difficulty: 'easy',
            world: world._id,
            topic: topic._id,
            slug: 'analytics-prob-1',
            xpReward: 100,
            coinReward: 20
        });

        const problem2 = await Problem.create({
            title: 'Analytics Prob 2',
            description: 'Task details',
            difficulty: 'medium',
            world: world._id,
            topic: topic._id,
            slug: 'analytics-prob-2',
            xpReward: 200,
            coinReward: 40
        });

        // 3. Create submissions
        await Submission.create({
            user: user._id,
            problem: problem1._id,
            code: '/* analytics test code */',
            language: 'javascript',
            verdict: 'accepted'
        });

        await Submission.create({
            user: user._id,
            problem: problem2._id,
            code: '/* analytics test code */',
            language: 'python',
            verdict: 'wrong_answer'
        });

        console.log('Seeded test analytics dataset.');

        // 4. Test getUserAnalytics
        console.log('\n--- STEP 1: Testing User Analytics Aggregation ---');
        const userStats = await analyticsService.getUserAnalytics(user._id);
        console.log('Success Rate:', userStats.successRate, '%');
        console.log('Total Submissions:', userStats.totalSubmissions);
        console.log('Easy Solved Count:', userStats.difficultySolved.easy);
        console.log('Medium Solved Count:', userStats.difficultySolved.medium);
        console.log('Insights - Strongest Topic:', userStats.insights.strongestTopic);
        console.log('Insights - Most Used Language:', userStats.insights.mostUsedLanguage);

        if (userStats.totalSubmissions !== 2) throw new Error('Total submissions count mismatch');
        if (userStats.difficultySolved.easy !== 1) throw new Error('Easy solved count mismatch');
        if (userStats.successRate !== 50) throw new Error('Success rate calculation mismatch');

        // 5. Test getActivityHeatmap
        console.log('\n--- STEP 2: Testing Activity Heatmap Dates Aggregation ---');
        const heatmap = await analyticsService.getActivityHeatmap(user._id);
        console.log('Heatmap records count:', heatmap.length);
        console.log('Heatmap day 1:', heatmap[0]);
        if (heatmap.length === 0) throw new Error('Heatmap count should not be empty');

        // 6. Test getTopicMastery
        console.log('\n--- STEP 3: Testing Topic Mastery calculations ---');
        const mastery = await analyticsService.getTopicMastery(user._id);
        const testTopicMastery = mastery.find(m => m.name === 'Analytics Topic A');
        console.log('Analytics Topic A mastery details:', testTopicMastery);
        // We solved 1 out of 2 problems in that topic -> percentage should be 50%
        if (testTopicMastery.percentage !== 50) {
            throw new Error(`Mastery pct should be 50%, got: ${testTopicMastery.percentage}%`);
        }

        // 7. Test getAdminAnalytics
        console.log('\n--- STEP 4: Testing Global Admin Analytics Aggregation ---');
        const adminStats = await analyticsService.getAdminAnalytics();
        console.log('Total users registered:', adminStats.totalUsers);
        console.log('Submissions in last 7 days:', adminStats.dailySubmissions);
        console.log('Registrations in last 7 days:', adminStats.dailyRegistrations);
        if (adminStats.totalUsers === 0) throw new Error('Admin total users should not be zero');

        // Cleanup
        console.log('\nCleaning up seeded test documents...');
        await User.deleteMany({ email: /test_analytics_user/ });
        await World.deleteMany({ name: 'Analytics World' });
        await Topic.deleteMany({ name: 'Analytics Topic A' });
        await Problem.deleteMany({ slug: /analytics-prob/ });
        await Submission.deleteMany({ code: '/* analytics test code */' });
        console.log('Cleaned.');

        console.log('\n✔ --- ALL ANALYTICS INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('\n✘ INTEGRATION TEST FAILED:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run();
