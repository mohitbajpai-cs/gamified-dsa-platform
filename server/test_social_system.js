require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const World = require('./src/models/world.model');
const Topic = require('./src/models/topic.model');
const Problem = require('./src/models/problem.model');
const Friendship = require('./src/models/friendship.model');
const Guild = require('./src/models/guild.model');
const Notification = require('./src/models/notification.model');

const friendService = require('./src/services/friend.service');
const guildService = require('./src/services/guild.service');
const notificationService = require('./src/services/notification.service');
const submissionService = require('./src/services/submission.service');
const codeExecutionService = require('./src/services/codeExecution.service');

codeExecutionService.execute = async () => {
    return { verdict: 'accepted', testCasesPassed: 1, totalTestCases: 1 };
};

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-dsa';

async function run() {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    try {
        console.log('\n--- SETUP: Preparing Social Test Data ---');
        // Clean previous states
        await User.deleteMany({ email: /test_social_user/ });
        await Friendship.deleteMany({});
        await Guild.deleteMany({});
        await Notification.deleteMany({});
        await World.deleteMany({ name: 'Social World' });
        await Topic.deleteMany({ name: 'Social Topic' });
        await Problem.deleteMany({ title: 'Social Problem A' });

        // 1. Create three users
        const u1 = await User.create({
            username: 'social_user_1',
            email: 'test_social_user_1@abyss.com',
            password: 'Password123',
            role: 'student',
            xp: 0,
            coins: 0
        });
        const u2 = await User.create({
            username: 'social_user_2',
            email: 'test_social_user_2@abyss.com',
            password: 'Password123',
            role: 'student',
            xp: 0,
            coins: 0
        });
        const u3 = await User.create({
            username: 'social_user_3',
            email: 'test_social_user_3@abyss.com',
            password: 'Password123',
            role: 'student',
            xp: 0,
            coins: 0
        });
        console.log(`Created users: ${u1.username}, ${u2.username}, ${u3.username}`);

        // 2. Friend Request Flow
        console.log('\n--- STEP 1: Verifying Friend request flow ---');
        const req = await friendService.sendFriendRequest(u1._id, u2.username);
        console.log('Friendship request created. Status:', req.status);
        if (req.status !== 'pending') throw new Error('Request state should be pending');

        // Check recipient notification
        const unreadCount2 = await notificationService.getUnreadCount(u2._id);
        console.log('User 2 Unread Count:', unreadCount2);
        if (unreadCount2 !== 1) throw new Error('User 2 should have received 1 notification');

        const notifs = await notificationService.getNotifications(u2._id);
        console.log('Notification details:', notifs[0].title, '-', notifs[0].message);

        // Accept request
        await friendService.acceptFriendRequest(u2._id, req._id);
        console.log('Request accepted by User 2.');

        const friends = await friendService.getFriends(u1._id);
        console.log('User 1 friends count:', friends.length, 'First friend:', friends[0]?.username);
        if (friends.length !== 1 || friends[0].username !== u2.username) {
            throw new Error('Friend list syncing failed');
        }

        // 3. Guild creations & Join
        console.log('\n--- STEP 2: Verifying Guild alliance creation/join ---');
        const guild = await guildService.createGuild(u3._id, {
            name: 'Shadow Alliance',
            description: 'Seek code optimization in the dark depths',
            banner: 'banner-shadow'
        });
        console.log(`Guild created: ${guild.name}, Invite Code: ${guild.inviteCode}, Level: ${guild.level}`);

        const joinedGuild = await guildService.joinGuild(u2._id, guild.inviteCode);
        console.log(`User 2 joined guild: ${joinedGuild.name}, Total members: ${joinedGuild.members.length}`);
        if (joinedGuild.members.length !== 2) {
            throw new Error('Guild member registration failed');
        }

        // 4. Guild XP Solve Hook
        console.log('\n--- STEP 3: Verifying Guild XP updates on solving problems ---');
        // Seed world/problem for user 2 to solve
        const world = await World.create({
            name: 'Social World',
            description: 'Social test world description',
            unlockLevel: 1,
            difficulty: 'beginner',
            slug: 'social-world'
        });
        const topic = await Topic.create({
            name: 'Social Topic',
            description: 'Topic Descr',
            world: world._id,
            difficulty: 'easy',
            order: 1,
            slug: 'social-topic'
        });
        const problem = await Problem.create({
            title: 'Social Problem A',
            description: 'Solve it',
            difficulty: 'easy',
            world: world._id,
            topic: topic._id,
            slug: 'social-problem-a',
            xpReward: 300,
            coinReward: 50
        });

        // Run solution submission (mocking direct solve as verified before)
        await submissionService.submitSolution({
            userId: u2._id,
            problemId: problem._id,
            code: 'function test() {}',
            language: 'javascript'
        });

        // Verify Guild XP update
        const updatedGuild = await Guild.findById(guild._id);
        console.log(`Guild Level: ${updatedGuild.level}, XP: ${updatedGuild.xp}`);
        if (updatedGuild.xp !== 300) {
            throw new Error(`Guild XP should have increased by 300, got: ${updatedGuild.xp}`);
        }
        console.log('✔ Solve hook successfully distributed Guild XP.');

        // 5. Exiling & Ownership transfer
        console.log('\n--- STEP 4: Verifying Owner transfers and exiles ---');
        // u3 transfers mastery to u2
        await guildService.transferOwnership(u3._id, u2._id);
        console.log('Alliance mastery transferred to User 2.');

        // u2 exiles u3
        await guildService.removeMember(u2._id, u3._id);
        const finalGuild = await Guild.findById(guild._id);
        console.log('Guild members count after exiling User 3:', finalGuild.members.length);
        if (finalGuild.members.length !== 1 || String(finalGuild.owner) !== String(u2._id)) {
            throw new Error('Exile or transfer operations failed');
        }

        // 6. Notification Read state actions
        console.log('\n--- STEP 5: Verifying Notification read states ---');
        const notifId = notifs[0]._id;
        await notificationService.markAsRead(notifId, u2._id);
        const finalUnread = await notificationService.getUnreadCount(u2._id);
        console.log('User 2 Unread Count after mark read:', finalUnread);
        if (finalUnread !== 0) throw new Error('Unread count should clear to 0');

        // Cleanup test data
        console.log('\nCleaning up test documents...');
        await User.deleteMany({ email: /test_social_user/ });
        await Friendship.deleteMany({});
        await Guild.deleteMany({});
        await Notification.deleteMany({});
        await World.deleteMany({ name: 'Social World' });
        await Topic.deleteMany({ name: 'Social Topic' });
        await Problem.deleteMany({ title: 'Social Problem A' });
        console.log('Cleaned.');

        console.log('\n✔ --- ALL SOCIAL SYSTEM INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        console.error('\n✘ INTEGRATION TEST FAILED:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run();
