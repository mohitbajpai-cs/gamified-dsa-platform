const Quest = require('../models/quest.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

class QuestService {
    /**
     * Gets or generates 3 daily quests for the user.
     */
    async getDailyQuests(userId) {
        const now = new Date();
        
        // Find existing non-expired daily quests
        let quests = await Quest.find({
            user: userId,
            type: 'daily',
            expiresAt: { $gt: now }
        });

        if (quests.length === 0) {
            // Delete expired ones to clean up
            await Quest.deleteMany({ user: userId, type: 'daily' });

            // Generate 3 daily quests
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const dailyTemplates = [
                {
                    title: 'Array Skirmish',
                    description: 'Solve 3 Easy difficulty problems.',
                    targetType: 'solve_easy',
                    targetValue: 3,
                    xpReward: 150,
                    coinReward: 50
                },
                {
                    title: 'Sorcerer\'s Trial',
                    description: 'Solve 2 Medium difficulty problems.',
                    targetType: 'solve_medium',
                    targetValue: 2,
                    xpReward: 250,
                    coinReward: 75
                },
                {
                    title: 'XP Accrual',
                    description: 'Accrue 300 Spell XP from challenges.',
                    targetType: 'earn_xp',
                    targetValue: 300,
                    xpReward: 100,
                    coinReward: 30
                },
                {
                    title: 'Topic Scholar',
                    description: 'Complete 1 algorithmic topic dungeon block.',
                    targetType: 'complete_topic',
                    targetValue: 1,
                    xpReward: 300,
                    coinReward: 100
                },
                {
                    title: 'Dungeon Crawler',
                    description: 'Solve 3 problems of any difficulty.',
                    targetType: 'solve_any',
                    targetValue: 3,
                    xpReward: 150,
                    coinReward: 50
                }
            ];

            // Select 3 random unique templates
            const shuffled = dailyTemplates.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            const newQuests = selected.map(q => ({
                user: userId,
                type: 'daily',
                expiresAt: endOfDay,
                ...q
            }));

            quests = await Quest.insertMany(newQuests);
        }

        return quests;
    }

    /**
     * Gets or generates 3 weekly quests for the user.
     */
    async getWeeklyQuests(userId) {
        const now = new Date();

        // Find existing non-expired weekly quests
        let quests = await Quest.find({
            user: userId,
            type: 'weekly',
            expiresAt: { $gt: now }
        });

        if (quests.length === 0) {
            // Delete expired ones to clean up
            await Quest.deleteMany({ user: userId, type: 'weekly' });

            // Generate Sunday midnight expiration date
            const endOfWeek = new Date();
            const daysUntilSunday = (7 - endOfWeek.getDay()) % 7;
            endOfWeek.setDate(endOfWeek.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
            endOfWeek.setHours(23, 59, 59, 999);

            const weeklyTemplates = [
                {
                    title: 'Archmage Marathon',
                    description: 'Solve 20 DSA coding challenges successfully.',
                    targetType: 'solve_any',
                    targetValue: 20,
                    xpReward: 1000,
                    coinReward: 350
                },
                {
                    title: 'Realm Liberator',
                    description: 'Fully conquer 1 entire realm world.',
                    targetType: 'complete_world',
                    targetValue: 1,
                    xpReward: 1500,
                    coinReward: 500
                },
                {
                    title: 'Void XP Harvest',
                    description: 'Earn 2000 Spell XP from your endeavors.',
                    targetType: 'earn_xp',
                    targetValue: 2000,
                    xpReward: 800,
                    coinReward: 300
                }
            ];

            const newQuests = weeklyTemplates.map(q => ({
                user: userId,
                type: 'weekly',
                expiresAt: endOfWeek,
                ...q
            }));

            quests = await Quest.insertMany(newQuests);
        }

        return quests;
    }

    /**
     * Claims a completed quest reward.
     */
    async claimQuestReward(userId, questId) {
        const quest = await Quest.findOne({ _id: questId, user: userId });
        if (!quest) {
            throw new ApiError(404, 'Quest not found');
        }

        if (!quest.completed) {
            throw new ApiError(400, 'Quest is not completed yet');
        }

        if (quest.claimed) {
            throw new ApiError(400, 'Quest reward has already been claimed');
        }

        quest.claimed = true;
        await quest.save();

        const user = await User.findById(userId);
        user.xp += quest.xpReward;
        user.coins += quest.coinReward;

        // Level up check
        let level = 1;
        while (true) {
            const xpThreshold = Math.round(100 * Math.pow(level, 1.5));
            if (user.xp >= xpThreshold) {
                level++;
            } else {
                break;
            }
        }
        const levelIncreased = level > user.level;
        user.level = level;

        // Sync claimed list
        user.claimedRewards.push(questId.toString());
        user.rewardHistory.push({
            rewardType: 'quest',
            xp: quest.xpReward,
            coins: quest.coinReward,
            rewardedAt: new Date()
        });

        await user.save();

        return {
            quest,
            user: {
                xp: user.xp,
                coins: user.coins,
                level: user.level,
                levelIncreased
            }
        };
    }

    /**
     * Handles login reward claiming.
     */
    async claimDailyLoginReward(userId) {
        const user = await User.findById(userId);
        const today = new Date();
        const todayStr = today.toDateString();

        if (user.dailyLogin.lastLoginDate) {
            const lastLoginStr = new Date(user.dailyLogin.lastLoginDate).toDateString();
            if (lastLoginStr === todayStr && user.dailyLogin.claimedToday) {
                throw new ApiError(400, 'Daily reward already claimed today');
            }
        }

        // Streak check: if last login was yesterday, increment. If today, keep. Otherwise reset to 1.
        let newStreak = 1;
        if (user.dailyLogin.lastLoginDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            const lastLoginStr = new Date(user.dailyLogin.lastLoginDate).toDateString();

            if (lastLoginStr === yesterdayStr) {
                newStreak = user.dailyLogin.streak + 1;
            } else if (lastLoginStr === todayStr) {
                newStreak = user.dailyLogin.streak;
            }
        }

        // Calculate reward scale
        const baseCoins = 20;
        const baseXP = 50;
        const streakMultiplier = Math.min(newStreak, 7); // Cap multiplier at 7 days

        let xpAwarded = baseXP * streakMultiplier;
        let coinsAwarded = baseCoins * streakMultiplier;

        // Day 7 bonus chest
        let isBonusChest = false;
        if (newStreak % 7 === 0) {
            xpAwarded += 500;
            coinsAwarded += 200;
            isBonusChest = true;
        }

        user.xp += xpAwarded;
        user.coins += coinsAwarded;
        
        // Level up check
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

        // Save state
        user.dailyLogin.streak = newStreak;
        user.dailyLogin.lastLoginDate = today;
        user.dailyLogin.claimedToday = true;

        user.rewardHistory.push({
            rewardType: 'daily_login',
            xp: xpAwarded,
            coins: coinsAwarded,
            rewardedAt: today
        });

        await user.save();

        return {
            streak: newStreak,
            claimedToday: true,
            xpAwarded,
            coinsAwarded,
            isBonusChest,
            user: {
                xp: user.xp,
                coins: user.coins,
                level: user.level
            }
        };
    }
}

module.exports = new QuestService();
