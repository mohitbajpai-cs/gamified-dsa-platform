const mongoose = require('mongoose');
const questService = require('./src/services/quest.service');
const submissionService = require('./src/services/submission.service');
const Problem = require('./src/models/problem.model');
const User = require('./src/models/user.model');
const Progress = require('./src/models/progress.model');
const Quest = require('./src/models/quest.model');
const connectDB = require('./src/config/db');
require('dotenv').config();

const run = async () => {
    try {
        await connectDB();
        console.log('Connected to Database.');

        // Find seeded problems
        const problems = await Problem.find().limit(2);
        if (problems.length < 2) {
            console.log('Please seed database first (at least 2 problems needed).');
            return;
        }
        const [p1, p2] = problems;
        console.log('Using test problems:', { p1: p1.title, p2: p2.title });

        // 1. Create clean test user
        console.log('\n--- STEP 1: Creating fresh test user ---');
        const username = `test_quest_hero_${Math.floor(Math.random() * 10000)}`;
        const email = `${username}@abyss.com`;
        
        const testUser = await User.create({
            username,
            email,
            password: 'password123',
            xp: 0,
            coins: 0,
            level: 1,
            role: 'student'
        });
        console.log(`Created user: ${username}, ID: ${testUser._id}`);

        // 2. Generate Daily & Weekly Quests
        console.log('\n--- STEP 2: Generating Daily & Weekly Quests ---');
        const dailyQuests = await questService.getDailyQuests(testUser._id);
        const weeklyQuests = await questService.getWeeklyQuests(testUser._id);

        console.log('Daily Quests Generated:', dailyQuests.map(q => ({ title: q.title, type: q.targetType, value: q.targetValue })));
        console.log('Weekly Quests Generated:', weeklyQuests.map(q => ({ title: q.title, type: q.targetType, value: q.targetValue })));

        if (dailyQuests.length !== 3 || weeklyQuests.length !== 3) {
            throw new Error('Quest generation failed to create exactly 3 daily and 3 weekly quests');
        }

        // Mock quest progress by solving a problem
        console.log('\n--- STEP 3: Solving problem to check quest progress ---');
        const res = await submissionService.submitSolution({
            userId: testUser._id,
            problemId: p1._id,
            code: 'function solve(x) { return x; }',
            language: 'javascript'
        });

        console.log('Submission Verdict:', res.submission.verdict);
        
        // Reload quests to verify currentValue incremented
        const updatedDailyQuests = await Quest.find({ user: testUser._id, type: 'daily' });
        console.log('Updated Daily Quests Progress:', updatedDailyQuests.map(q => ({ title: q.title, currentValue: q.currentValue, completed: q.completed })));

        // 4. Test Daily Login streak bonus chest
        console.log('\n--- STEP 4: Claiming daily login rewards ---');
        const loginClaim = await questService.claimDailyLoginReward(testUser._id);
        console.log('Daily Login Claim response:', {
            streak: loginClaim.streak,
            claimedToday: loginClaim.claimedToday,
            xpAwarded: loginClaim.xpAwarded,
            coinsAwarded: loginClaim.coinsAwarded
        });

        let reloadedUser = await User.findById(testUser._id);
        console.log('User stats after daily login claim:', {
            xp: reloadedUser.xp,
            coins: reloadedUser.coins,
            streak: reloadedUser.dailyLogin.streak,
            claimedToday: reloadedUser.dailyLogin.claimedToday
        });

        if (reloadedUser.dailyLogin.streak !== 1 || !reloadedUser.dailyLogin.claimedToday) {
            throw new Error('Daily login streak or claim state not correctly persisted');
        }

        // Mock 7-day bonus claim trigger
        console.log('\n--- STEP 5: Mocking Day 7 streak bonus chest claim ---');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        reloadedUser.dailyLogin.streak = 6;
        reloadedUser.dailyLogin.lastLoginDate = yesterday;
        reloadedUser.dailyLogin.claimedToday = false;
        await reloadedUser.save();

        const loginClaimDay7 = await questService.claimDailyLoginReward(testUser._id);
        console.log('Day 7 login response:', {
            streak: loginClaimDay7.streak,
            xpAwarded: loginClaimDay7.xpAwarded,
            coinsAwarded: loginClaimDay7.coinsAwarded,
            isBonusChest: loginClaimDay7.isBonusChest
        });

        if (loginClaimDay7.streak !== 7 || !loginClaimDay7.isBonusChest) {
            throw new Error('Day 7 bonus chest jingle logic failed to trigger');
        }

        console.log('\n✔ --- ALL QUESTS & ACHIEVEMENTS INTEGRATION TESTS COMPLETED ---');

        // Cleanup
        console.log('\nCleaning up database test documents...');
        await User.findByIdAndDelete(testUser._id);
        await Progress.deleteMany({ user: testUser._id });
        await Quest.deleteMany({ user: testUser._id });
        console.log('Cleaned up test documents.');

    } catch (err) {
        console.error('✘ INTEGRATION TEST FAILED:', err.message);
        console.error(err.stack);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

run();
