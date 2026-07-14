const questService = require('../services/quest.service');
const User = require('../models/user.model');
const Achievement = require('../models/achievement.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const MASTER_ACHIEVEMENTS = [
    { id: 'First Blood', title: 'First Blood', description: 'Solved your first DSA challenge in the Abyss.', badge: 'first_blood', rarity: 'common', xpReward: 100, coinReward: 20 },
    { id: 'Novice Solver', title: 'Novice Solver', description: 'Solved 5 DSA challenges.', badge: 'novice_solver', rarity: 'common', xpReward: 150, coinReward: 40 },
    { id: 'Array Master', title: 'Array Master', description: 'Mastered the Array Runes by solving 10 Array problems.', badge: 'array_master', rarity: 'rare', xpReward: 250, coinReward: 80 },
    { id: 'String Mage', title: 'String Mage', description: 'Tamed the String Serpent by solving 10 String problems.', badge: 'string_mage', rarity: 'rare', xpReward: 250, coinReward: 80 },
    { id: 'Tree Guardian', title: 'Tree Guardian', description: 'Protected the Tree of Traversals by solving 10 Tree problems.', badge: 'tree_guardian', rarity: 'rare', xpReward: 250, coinReward: 80 },
    { id: 'Graph Explorer', title: 'Graph Explorer', description: 'Traversed the void graphs by solving 10 Graph problems.', badge: 'graph_explorer', rarity: 'epic', xpReward: 400, coinReward: 150 },
    { id: 'DP Champion', title: 'DP Champion', description: 'Solved the dynamic algorithm abyss with 10 DP problems.', badge: 'dp_champion', rarity: 'epic', xpReward: 500, coinReward: 200 },
    { id: 'Speed Runner', title: 'Speed Runner', description: 'Completed any coding dungeon challenge in under 2 minutes.', badge: 'speed_runner', rarity: 'rare', xpReward: 200, coinReward: 50 },
    { id: 'Boss Slayer', title: 'Boss Slayer', description: 'Defeated a world Boss Guardian.', badge: 'boss_slayer', rarity: 'epic', xpReward: 500, coinReward: 150 },
    { id: 'Realm Conqueror', title: 'Realm Conqueror', description: 'Fully conquered all problems in any Realm.', badge: 'realm_conqueror', rarity: 'epic', xpReward: 600, coinReward: 200 },
    { id: 'Abyss Legend', title: 'Abyss Legend', description: 'Unlocked and conquered the final Abyss Throne.', badge: 'abyss_legend', rarity: 'legendary', xpReward: 1000, coinReward: 500 }
];

class QuestController {
    getDailyQuests = asyncHandler(async (req, res) => {
        const quests = await questService.getDailyQuests(req.user._id);
        res.status(200).json(new ApiResponse(200, quests, 'Daily quests retrieved successfully'));
    });

    getWeeklyQuests = asyncHandler(async (req, res) => {
        const quests = await questService.getWeeklyQuests(req.user._id);
        res.status(200).json(new ApiResponse(200, quests, 'Weekly quests retrieved successfully'));
    });

    claimQuestReward = asyncHandler(async (req, res) => {
        const { questId } = req.body;
        const result = await questService.claimQuestReward(req.user._id, questId);
        res.status(200).json(new ApiResponse(200, result, 'Quest reward claimed successfully'));
    });

    claimDailyLoginReward = asyncHandler(async (req, res) => {
        const result = await questService.claimDailyLoginReward(req.user._id);
        res.status(200).json(new ApiResponse(200, result, 'Daily login reward claimed successfully'));
    });

    getAchievements = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        const userAchievementsDocs = await Achievement.find({ user: req.user._id }).lean();

        const achievementsList = MASTER_ACHIEVEMENTS.map(ach => {
            const dbMatch = userAchievementsDocs.find(ua => ua.title.toLowerCase() === ach.title.toLowerCase());
            const isUnlocked = user.achievements.includes(ach.title) || !!dbMatch;
            
            return {
                ...ach,
                unlocked: isUnlocked,
                unlockedAt: dbMatch ? dbMatch.unlockedAt : (isUnlocked ? new Date() : null)
            };
        });

        res.status(200).json(new ApiResponse(200, achievementsList, 'Achievements list retrieved successfully'));
    });
}

module.exports = new QuestController();
