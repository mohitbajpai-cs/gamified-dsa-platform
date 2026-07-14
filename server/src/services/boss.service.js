const Boss = require('../models/boss.model');
const World = require('../models/world.model');
const Problem = require('../models/problem.model');
const Progress = require('../models/progress.model');
const User = require('../models/user.model');
const submissionService = require('./submission.service');
const ApiError = require('../utils/apiError');

class BossService {
    /**
     * Initializes bosses in the database if they don't exist.
     */
    async initializeBosses() {
        const worlds = await World.find().sort({ order: 1 });
        const worldIds = worlds.map(w => w._id.toString());

        const existingBosses = await Boss.find();
        const existingRealmIds = existingBosses.map(b => b.realmId ? b.realmId.toString() : '');

        const isStale = existingRealmIds.length === 0 || 
                        existingRealmIds.length !== worlds.length ||
                        existingRealmIds.some(rId => !worldIds.includes(rId));

        if (isStale) {
            await Boss.deleteMany({});
        } else {
            return;
        }

        const bossConfigs = [
            { name: 'Stone Golem', relic: 'Crystal Rune', title: 'Golem Shatterer', xp: 500, coins: 150 },
            { name: 'Leviathan', relic: 'Abyssal Pearl', title: 'Leviathan Slayer', xp: 600, coins: 200 },
            { name: 'Inferno Titan', relic: 'Magma Chain', title: 'Titan Defeater', xp: 700, coins: 250 },
            { name: 'Forest Guardian', relic: 'Elder Branch', title: 'Forest Sentinel', xp: 800, coins: 300 },
            { name: 'Ancient Ent', relic: 'Sacred Bark', title: 'Oak Whisperer', xp: 900, coins: 350 },
            { name: 'Frost King', relic: 'Ice Scepter', title: 'Frost Breaker', xp: 1000, coins: 400 },
            { name: 'Storm Dragon', relic: 'Thunder Scale', title: 'Dragon tamer', xp: 1100, coins: 450 },
            { name: 'Shadow Reaper', relic: 'Reaper Sickle', title: 'Soul Reaper', xp: 1200, coins: 500 },
            { name: 'Void Emperor', relic: 'Void Eye', title: 'Void Ascendant', xp: 1500, coins: 600 }
        ];

        for (let i = 0; i < worlds.length; i++) {
            const world = worlds[i];
            const config = bossConfigs[i] || bossConfigs[0];

            // Find problem with bossLevel: true in this world
            const bossProblem = await Problem.findOne({ world: world._id, bossLevel: true });
            if (!bossProblem) continue;

            await Boss.create({
                realmId: world._id,
                bossName: config.name,
                difficulty: 'boss',
                reward: {
                    xp: config.xp,
                    coins: config.coins,
                    relic: config.relic,
                    title: config.title
                },
                requiredLevel: world.unlockLevel,
                requiredTrials: 8, // Seeder creates 8 normal problems + 1 boss problem
                problemId: bossProblem._id
            });
        }
    }

    /**
     * Gets all bosses and their status for a user.
     */
    async getAllBosses(userId) {
        await this.initializeBosses();

        const bosses = await Boss.find().populate('realmId').populate('problemId').lean();
        const user = await User.findById(userId);

        const results = [];
        for (const boss of bosses) {
            // Check completed trials inside progress
            const progress = await Progress.findOne({ user: userId, world: boss.realmId._id });
            const completedProblems = progress ? progress.completedProblems.map(id => id.toString()) : [];
            
            // Exclude the boss problem from normal trials count
            const normalSolved = completedProblems.filter(pId => pId !== boss.problemId._id.toString());
            const hasCompletedTrials = normalSolved.length >= boss.requiredTrials;
            
            const isUnlocked = user.level >= boss.requiredLevel && hasCompletedTrials;
            const isDefeated = user.bossesDefeated.includes(boss.bossName) || completedProblems.includes(boss.problemId._id.toString());

            results.push({
                ...boss,
                normalSolvedCount: normalSolved.length,
                unlocked: isUnlocked,
                defeated: isDefeated
            });
        }

        return results;
    }

    /**
     * Gets a specific boss status by realm ID.
     */
    async getBossByRealmId(userId, realmId) {
        await this.initializeBosses();

        const boss = await Boss.findOne({ realmId }).populate('realmId').populate('problemId').lean();
        if (!boss) {
            throw new ApiError(404, 'Boss not found for this realm');
        }

        const user = await User.findById(userId);
        const progress = await Progress.findOne({ user: userId, world: realmId });
        const completedProblems = progress ? progress.completedProblems.map(id => id.toString()) : [];
        
        const normalSolved = completedProblems.filter(pId => pId !== boss.problemId._id.toString());
        const hasCompletedTrials = normalSolved.length >= boss.requiredTrials;
        
        const isUnlocked = user.level >= boss.requiredLevel && hasCompletedTrials;
        const isDefeated = user.bossesDefeated.includes(boss.bossName) || completedProblems.includes(boss.problemId._id.toString());

        return {
            ...boss,
            normalSolvedCount: normalSolved.length,
            unlocked: isUnlocked,
            defeated: isDefeated
        };
    }

    /**
     * Executes boss solution evaluation. If accepted, awards relics, titles, trophies, and marks world conquered.
     */
    async submitBossSolution(userId, realmId, code, language) {
        await this.initializeBosses();
        const boss = await Boss.findOne({ realmId });
        if (!boss) {
            throw new ApiError(404, 'Boss not found');
        }

        // Run submission via existing submission engine
        const submissionResult = await submissionService.submitSolution({
            userId,
            problemId: boss.problemId,
            code,
            language,
            isSubmit: true
        });

        const isVictory = submissionResult.submission.verdict === 'accepted';
        let bossRewardsData = null;

        if (isVictory) {
            const user = await User.findById(userId);

            // Award extra boss reward only on the FIRST defeat
            const isFirstDefeat = !user.bossesDefeated.includes(boss.bossName);
            if (isFirstDefeat) {
                user.bossesDefeated.push(boss.bossName);
                user.bossTrophies.push(`${boss.bossName} Trophy`);
                
                // Add title
                if (boss.reward.title && user.currentTitle !== boss.reward.title) {
                    user.currentTitle = boss.reward.title;
                }

                // Award XP and Coins
                user.xp += boss.reward.xp;
                user.coins += boss.reward.coins;

                // Sync realm completion conquered status
                let rc = user.realmCompletion.find(c => c.realmId.toString() === realmId.toString());
                if (!rc) {
                    user.realmCompletion.push({
                        realmId,
                        completionPct: 100,
                        conquered: true
                    });
                } else {
                    rc.completionPct = 100;
                    rc.conquered = true;
                }

                // Track in rewardHistory
                user.rewardHistory.push({
                    rewardType: `boss_${boss.bossName.toLowerCase().replace(/\s+/g, '_')}`,
                    xp: boss.reward.xp,
                    coins: boss.reward.coins,
                    rewardedAt: new Date()
                });

                // Check achievements and level progression
                let level = 1;
                while (true) {
                    const xpThreshold = Math.round(100 * Math.pow(level, 1.5));
                    if (user.xp >= xpThreshold) {
                        level++;
                    } else {
                        break;
                    }
                }
                user.level = level;

                await user.save();

                bossRewardsData = {
                    xp: boss.reward.xp,
                    coins: boss.reward.coins,
                    relic: boss.reward.relic,
                    title: boss.reward.title,
                    trophy: `${boss.bossName} Trophy`
                };
            }
        }

        return {
            submission: submissionResult.submission,
            verdict: submissionResult.submission.verdict,
            isVictory,
            bossRewards: bossRewardsData,
            complexity: submissionResult.complexity
        };
    }

    /**
     * Gets user's earned relics and defeated boss list.
     */
    async getUserRewards(userId) {
        const user = await User.findById(userId);
        const defeatedBosses = user.bossesDefeated;
        
        // Find relics matching defeated bosses
        const bosses = await Boss.find({ bossName: { $in: defeatedBosses } });
        const relics = bosses.map(b => b.reward.relic);
        const trophies = user.bossTrophies;

        return {
            defeatedBosses,
            relics,
            trophies
        };
    }
}

module.exports = new BossService();
