const mongoose = require('mongoose');
const bossService = require('./src/services/boss.service');
const submissionService = require('./src/services/submission.service');
const Problem = require('./src/models/problem.model');
const User = require('./src/models/user.model');
const Progress = require('./src/models/progress.model');
const Boss = require('./src/models/boss.model');
const World = require('./src/models/world.model');
const connectDB = require('./src/config/db');
require('dotenv').config();

const run = async () => {
    try {
        await connectDB();
        console.log('Connected to Database.');

        // Initialize bosses in DB
        console.log('\n--- STEP 1: Initializing Boss Documents ---');
        await bossService.initializeBosses();
        
        const bosses = await Boss.find().populate('realmId').populate('problemId');
        console.log(`Initialized ${bosses.length} bosses in DB.`);
        if (bosses.length === 0) {
            throw new Error('Boss initialization failed to create documents');
        }

        // Create clean test user
        console.log('\n--- STEP 2: Creating test user ---');
        const username = `boss_slayer_${Math.floor(Math.random() * 10000)}`;
        const email = `${username}@abyss.com`;
        const testUser = await User.create({
            username,
            email,
            password: 'password123',
            xp: 100,
            coins: 50,
            level: 2,
            role: 'student'
        });
        console.log(`Created user: ${username}, Level: ${testUser.level}, ID: ${testUser._id}`);

        // Get arrays boss
        const arrayWorld = await World.findOne({ order: 0 });
        const arrayBoss = await bossService.getBossByRealmId(testUser._id, arrayWorld._id);
        console.log('Arrays Boss Info:', {
            bossName: arrayBoss.bossName,
            requiredLevel: arrayBoss.requiredLevel,
            requiredTrials: arrayBoss.requiredTrials,
            normalSolvedCount: arrayBoss.normalSolvedCount,
            unlocked: arrayBoss.unlocked,
            defeated: arrayBoss.defeated
        });

        // 3. Verify locked status
        console.log('\n--- STEP 3: Verifying Boss starts LOCKED ---');
        if (arrayBoss.unlocked) {
            throw new Error('Boss should be locked because normal trials have not been completed yet');
        }
        console.log('✔ Confirmed: Boss starts LOCKED.');

        // 4. Mock normal trials completion to unlock boss
        console.log('\n--- STEP 4: Solving normal trials to unlock Boss ---');
        // Fetch arrays normal problems
        const normalProblems = await Problem.find({ world: arrayWorld._id, bossLevel: false });
        let progress = await Progress.create({
            user: testUser._id,
            world: arrayWorld._id,
            completedProblems: [],
            unlockedWorlds: [arrayWorld._id]
        });

        // Complete required 8 normal trials
        for (const p of normalProblems) {
            progress.completedProblems.push(p._id);
        }
        await progress.save();

        // Reload array boss details
        const unlockedBoss = await bossService.getBossByRealmId(testUser._id, arrayWorld._id);
        console.log('Boss status after normal trials solve:', {
            normalSolvedCount: unlockedBoss.normalSolvedCount,
            unlocked: unlockedBoss.unlocked,
            defeated: unlockedBoss.defeated
        });

        if (!unlockedBoss.unlocked) {
            throw new Error('Boss failed to unlock after solving normal trials');
        }
        console.log('✔ Confirmed: Boss is now UNLOCKED.');

        // 5. Submit Boss solution (Accepted)
        console.log('\n--- STEP 5: Battling Boss (Submitting Accepted Solution) ---');
        const correct3SumCode = `
function solve(nums) {
    nums.sort((a,b) => a-b);
    let result = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i-1]) continue;
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            let sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left+1]) left++;
                while (left < right && nums[right] === nums[right-1]) right--;
                left++; right--;
            } else if (sum < 0) left++;
            else right--;
        }
    }
    return result;
}
`;
        const battleRes = await bossService.submitBossSolution(
            testUser._id,
            arrayWorld._id,
            correct3SumCode,
            'javascript'
        );

        console.log('Battle Result:', {
            verdict: battleRes.verdict,
            isVictory: battleRes.isVictory,
            bossRewards: battleRes.bossRewards
        });

        if (!battleRes.isVictory || !battleRes.bossRewards) {
            throw new Error('Boss fight submission failed or did not award custom boss rewards');
        }

        // Verify user profile updates
        const updatedUser = await User.findById(testUser._id);
        console.log('Updated User Stats after Boss slay:', {
            xp: updatedUser.xp,
            coins: updatedUser.coins,
            title: updatedUser.currentTitle,
            bossesDefeated: updatedUser.bossesDefeated,
            bossTrophies: updatedUser.bossTrophies,
            realmCompletion: updatedUser.realmCompletion.map(rc => ({ realmId: rc.realmId, conquered: rc.conquered }))
        });

        if (!updatedUser.bossesDefeated.includes(unlockedBoss.bossName)) {
            throw new Error('Boss name not added to user bossesDefeated list');
        }
        if (updatedUser.currentTitle !== unlockedBoss.reward.title) {
            throw new Error('User did not receive the unique boss title reward');
        }
        if (!updatedUser.bossTrophies.includes(`${unlockedBoss.bossName} Trophy`)) {
            throw new Error('User did not receive the boss trophy reward');
        }

        console.log('\n✔ --- ALL BOSS BATTLES AND REALM COMPLETIONS TESTS COMPLETED ---');

        // Cleanup
        console.log('\nCleaning up database test documents...');
        await User.findByIdAndDelete(testUser._id);
        await Progress.deleteMany({ user: testUser._id });
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
