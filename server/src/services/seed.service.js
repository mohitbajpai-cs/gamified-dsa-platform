const World = require('../models/world.model');
const Topic = require('../models/topic.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const Progress = require('../models/progress.model');
const Submission = require('../models/submission.model');
const Achievement = require('../models/achievement.model');
const ApiError = require('../utils/apiError');

class SeedService {
    /**
     * Seeds the entire gamified DSA curriculum, including 9 worlds, 9 topics, 81 problems,
     * 162 test cases, and default achievements. Only allowed in development mode.
     */
    async seedDatabase({ userId, fullReset = false }) {
        // 1. Enforce DEV mode checks
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
            throw new ApiError(403, 'Seeding is forbidden outside development mode');
        }

        console.log('[Seeder] Initiating curriculum database wipe...');

        // 2. Tear down gameplay curriculum data (Users are NEVER wiped by default)
        await World.deleteMany({});
        await Topic.deleteMany({});
        await Problem.deleteMany({});
        await TestCase.deleteMany({});
        await Progress.deleteMany({});
        await Submission.deleteMany({});

        if (fullReset) {
            console.log('[Seeder] Full reset requested. Wiping player achievements...');
            await Achievement.deleteMany({});
        }

        // 3. Define the 9 Worlds
        const worldsData = [
            { name: 'Arrays', difficulty: 'beginner', order: 0, unlockLevel: 1 },
            { name: 'Strings', difficulty: 'beginner', order: 1, unlockLevel: 1 },
            { name: 'Linked Lists', difficulty: 'intermediate', order: 2, unlockLevel: 2 },
            { name: 'Stacks', difficulty: 'intermediate', order: 3, unlockLevel: 2 },
            { name: 'Queues', difficulty: 'intermediate', order: 4, unlockLevel: 2 },
            { name: 'Trees', difficulty: 'advanced', order: 5, unlockLevel: 3 },
            { name: 'BST', difficulty: 'advanced', order: 6, unlockLevel: 3 },
            { name: 'Graphs', difficulty: 'advanced', order: 7, unlockLevel: 4 },
            { name: 'Dynamic Programming', difficulty: 'advanced', order: 8, unlockLevel: 4 }
        ];

        console.log('[Seeder] Populating new worlds, topics, problems, and test cases...');

        // 4. Seeding Curriculum loop
        for (const wData of worldsData) {
            const worldSlug = wData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const world = await World.create({
                name: wData.name,
                slug: worldSlug,
                description: `Tread carefully in the ${wData.name} world of the Abyss. Master its pathways or perish.`,
                difficulty: wData.difficulty,
                order: wData.order,
                unlockLevel: wData.unlockLevel,
                thumbnail: `/assets/dungeons/${worldSlug}.png`,
                totalProblems: 9 // Dynamic insert matches: 3 Easy, 3 Medium, 2 Hard, 1 Boss
            });

            // Create a Topic for this world
            const topic = await Topic.create({
                world: world._id,
                name: `${wData.name} Dungeons`,
                slug: `${worldSlug}-dungeons`,
                description: `Core concepts and algorithms for solving ${wData.name} challenges.`,
                order: 0,
                totalProblems: 9
            });

            // Generate 9 Problems (3 Easy, 3 Medium, 2 Hard, 1 Boss)
            const problemsToCreate = [];

            // 3 Easy Problems
            for (let i = 1; i <= 3; i++) {
                problemsToCreate.push({
                    title: `${wData.name} Knight ${i}`,
                    difficulty: 'easy',
                    xpReward: 50,
                    coinReward: 10,
                    bossLevel: false
                });
            }

            // 3 Medium Problems
            for (let i = 1; i <= 3; i++) {
                problemsToCreate.push({
                    title: `${wData.name} Sorcerer ${i}`,
                    difficulty: 'medium',
                    xpReward: 100,
                    coinReward: 20,
                    bossLevel: false
                });
            }

            // 2 Hard Problems
            for (let i = 1; i <= 2; i++) {
                problemsToCreate.push({
                    title: `${wData.name} Overlord ${i}`,
                    difficulty: 'hard',
                    xpReward: 150,
                    coinReward: 35,
                    bossLevel: false
                });
            }

            // 1 Boss Problem
            problemsToCreate.push({
                title: `Boss Battle: ${wData.name} Behemoth`,
                difficulty: 'boss',
                xpReward: 300,
                coinReward: 75,
                bossLevel: true
            });

            // Save Problems & Test Cases
            for (const pTemplate of problemsToCreate) {
                const problemSlug = pTemplate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                const problem = await Problem.create({
                    world: world._id,
                    topic: topic._id,
                    title: pTemplate.title,
                    slug: problemSlug,
                    description: `Defeat the ${pTemplate.title} by casting the correct javascript spell. Solve this ${pTemplate.difficulty} challenge to gain rewards.`,
                    difficulty: pTemplate.difficulty,
                    starterCode: `function solve(input) {\n    // Write your code here\n    return input;\n}`,
                    solutionTemplate: `function solve(input) {\n    // Solution code\n    return input;\n}`,
                    examples: [
                        { input: '[1, 2, 3]', output: '[1, 2, 3]', explanation: 'Returns the exact value' }
                    ],
                    constraints: [
                        'Time Complexity: O(N)',
                        'Space Complexity: O(1)'
                    ],
                    hints: [
                        'Inspect the input items.',
                        'Try to divide and conquer.'
                    ],
                    tags: [worldSlug, pTemplate.difficulty],
                    xpReward: pTemplate.xpReward,
                    coinReward: pTemplate.coinReward,
                    bossLevel: pTemplate.bossLevel
                });

                // Create Test Cases for the problem
                // TestCase 1 (Visible Sample)
                await TestCase.create({
                    problem: problem._id,
                    input: 'test',
                    expectedOutput: 'test',
                    hidden: false,
                    explanation: 'Sample trace match'
                });

                // TestCase 2 (Hidden Evaluation)
                await TestCase.create({
                    problem: problem._id,
                    input: 'evaluation',
                    expectedOutput: 'evaluation',
                    hidden: true,
                    explanation: 'Verification test'
                });
            }
        }

        // 5. Seed Default Achievements if admin user triggers it
        if (userId) {
            console.log('[Seeder] Populating default player achievements...');
            const achievementsList = [
                { title: 'First Blood', description: 'Solved your first DSA challenge', rarity: 'common', xpReward: 50, coinReward: 10, badge: 'first_blood' },
                { title: 'Array Apprentice', description: 'Mastered the Array World', rarity: 'common', xpReward: 100, coinReward: 20, badge: 'array_apprentice' },
                { title: 'String Slayer', description: 'Tamed the String Serpent', rarity: 'rare', xpReward: 150, coinReward: 30, badge: 'string_slayer' },
                { title: 'Tree Guardian', description: 'Protected the Tree of Traversals', rarity: 'rare', xpReward: 150, coinReward: 30, badge: 'tree_guardian' },
                { title: 'Graph Explorer', description: 'Traversed the void graphs', rarity: 'epic', xpReward: 250, coinReward: 50, badge: 'graph_explorer' },
                { title: 'DP Master', description: 'Solved the dynamic algorithm abyss', rarity: 'epic', xpReward: 300, coinReward: 60, badge: 'dp_master' },
                { title: 'Abyss Conqueror', description: 'Conquered the entire protocol', rarity: 'legendary', xpReward: 500, coinReward: 100, badge: 'abyss_conqueror' }
            ];

            for (const ach of achievementsList) {
                const hasAchievement = await Achievement.findOne({ user: userId, title: ach.title });
                if (!hasAchievement) {
                    await Achievement.create({
                        user: userId,
                        ...ach,
                        unlockedAt: new Date()
                    });
                }
            }
        }

        console.log('[Seeder] Database seeding completed successfully.');
        return { message: 'Curriculum database seeded successfully' };
    }
}

module.exports = new SeedService();
