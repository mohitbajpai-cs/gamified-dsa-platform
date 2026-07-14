const mongoose = require('mongoose');
const adminCustomService = require('./src/services/adminCustom.service');
const adminWorldService = require('./src/services/adminWorld.service');
const User = require('./src/models/user.model');
const World = require('./src/models/world.model');
const Quest = require('./src/models/quest.model');
const Achievement = require('./src/models/achievement.model');
const connectDB = require('./src/config/db');
require('dotenv').config();

const run = async () => {
    try {
        await connectDB();
        console.log('Connected to Database.');

        // 1. Create clean admin and moderator users
        console.log('\n--- STEP 1: Creating staff test users ---');
        const adminUser = await User.create({
            username: `admin_${Math.floor(Math.random() * 10000)}`,
            email: `admin_${Date.now()}@abyss.com`,
            password: 'password123',
            xp: 500,
            coins: 200,
            role: 'admin'
        });

        const modUser = await User.create({
            username: `mod_${Math.floor(Math.random() * 10000)}`,
            email: `mod_${Date.now()}@abyss.com`,
            password: 'password123',
            xp: 200,
            coins: 100,
            role: 'moderator'
        });

        console.log(`Created admin: ${adminUser.username}, moderator: ${modUser.username}`);

        // 2. Fetch dashboard stats
        console.log('\n--- STEP 2: Verifying Dashboard Stats ---');
        const stats = await adminCustomService.getDashboardStats();
        console.log('Dashboard Stats output:', stats);
        if (stats.totalUsers < 2) {
            throw new Error('Stats failed to count newly created users');
        }
        console.log('✔ Confirmed: Stats successfully resolved.');

        // 3. User Management Filter & Paginate
        console.log('\n--- STEP 3: Verifying User Directory Queries ---');
        const searchRes = await adminCustomService.getUsers({ search: 'mod_', page: 1, limit: 5 });
        console.log(`Found ${searchRes.total} matching user profiles.`);
        if (searchRes.users.length === 0) {
            throw new Error('User search returned empty list');
        }

        // 4. Role changes & progress resets
        console.log('\n--- STEP 4: Verifying resets & permissions updates ---');
        const updatedMod = await adminCustomService.updateUserRole(modUser._id, 'admin');
        console.log('Updated user role:', updatedMod.role);
        if (updatedMod.role !== 'admin') {
            throw new Error('Role change failed to persist');
        }

        const resetXpUser = await adminCustomService.resetUserXp(adminUser._id);
        console.log('XP after reset:', resetXpUser.xp);
        if (resetXpUser.xp !== 0) {
            throw new Error('XP reset failed to set value to 0');
        }

        // 5. Quest Management CRUD
        console.log('\n--- STEP 5: Verifying Quest CRUD ---');
                const newQuest = await adminCustomService.createQuest({
            title: 'Solve 10 Recursion Problems',
            description: 'Solve 10 Medium tasks under recursion',
            type: 'weekly',
            targetType: 'solve_medium',
            targetValue: 10,
            xpReward: 500,
            coinsReward: 150
        });
        console.log('Created Quest:', newQuest.title);

        const updatedQuest = await adminCustomService.updateQuest(newQuest._id, { coinsReward: 200 });
        console.log('Updated Quest Coins reward:', updatedQuest.coinsReward);
        if (updatedQuest.coinsReward !== 200) {
            throw new Error('Quest update failed to persist');
        }

        await adminCustomService.deleteQuest(newQuest._id);
        console.log('Deleted Quest successfully.');

        // 6. Achievement Management CRUD
        console.log('\n--- STEP 6: Verifying Achievement CRUD ---');
        const newAch = await adminCustomService.createAchievement({
            title: 'Abyss Conqueror',
            description: 'Slain all 9 Zone Guardians',
            icon: 'icon-conqueror',
            rarity: 'legendary',
            coinsReward: 500,
            xpReward: 100,
            conditionType: 'bosses_defeated',
            conditionValue: 9
        });
        console.log('Created Achievement:', newAch.title);

        const updatedAch = await adminCustomService.updateAchievement(newAch._id, { coinsReward: 1000 });
        console.log('Updated Achievement Coins:', updatedAch.coinsReward);
        if (updatedAch.coinsReward !== 1000) {
            throw new Error('Achievement update failed');
        }

        await adminCustomService.deleteAchievement(newAch._id);
        console.log('Deleted Achievement successfully.');

        // Cleanup
        console.log('\nCleaning up staff test users...');
        await User.findByIdAndDelete(adminUser._id);
        await User.findByIdAndDelete(modUser._id);
        console.log('Cleaned up test documents.');

        console.log('\n✔ --- ALL ADMIN MANAGEMENT PORTAL SERVICE TESTS COMPLETED ---');

    } catch (err) {
        console.error('✘ INTEGRATION TEST FAILED:', err.message);
        console.error(err.stack);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
};

run();
