const adminCustomService = require('../services/adminCustom.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AdminCustomController {
    getStats = asyncHandler(async (req, res) => {
        const stats = await adminCustomService.getDashboardStats();
        res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
    });

    getAnalytics = asyncHandler(async (req, res) => {
        const analytics = await adminCustomService.getDashboardAnalytics();
        res.status(200).json(new ApiResponse(200, analytics, 'Dashboard analytics retrieved successfully'));
    });

    getUsers = asyncHandler(async (req, res) => {
        const { search, role, page, limit } = req.query;
        const result = await adminCustomService.getUsers({ search, role, page, limit });
        res.status(200).json(new ApiResponse(200, result, 'Users list retrieved successfully'));
    });

    updateUserRole = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        const user = await adminCustomService.updateUserRole(id, role);
        res.status(200).json(new ApiResponse(200, user, 'User role updated successfully'));
    });

    resetXp = asyncHandler(async (req, res) => {
        const user = await adminCustomService.resetUserXp(req.params.id);
        res.status(200).json(new ApiResponse(200, user, 'User XP reset successfully'));
    });

    resetCoins = asyncHandler(async (req, res) => {
        const user = await adminCustomService.resetUserCoins(req.params.id);
        res.status(200).json(new ApiResponse(200, user, 'User Coins reset successfully'));
    });

    resetProgress = asyncHandler(async (req, res) => {
        const user = await adminCustomService.resetUserProgress(req.params.id);
        res.status(200).json(new ApiResponse(200, user, 'User progress reset successfully'));
    });

    deleteUser = asyncHandler(async (req, res) => {
        const result = await adminCustomService.deleteUser(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'User deleted successfully'));
    });

    // Quests CRUD
    getQuests = asyncHandler(async (req, res) => {
        const quests = await adminCustomService.getAllQuests();
        res.status(200).json(new ApiResponse(200, quests, 'Quests retrieved successfully'));
    });

    createQuest = asyncHandler(async (req, res) => {
        const quest = await adminCustomService.createQuest(req.body);
        res.status(201).json(new ApiResponse(201, quest, 'Quest created successfully'));
    });

    updateQuest = asyncHandler(async (req, res) => {
        const quest = await adminCustomService.updateQuest(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, quest, 'Quest updated successfully'));
    });

    deleteQuest = asyncHandler(async (req, res) => {
        const result = await adminCustomService.deleteQuest(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Quest deleted successfully'));
    });

    // Achievements CRUD
    getAchievements = asyncHandler(async (req, res) => {
        const achievements = await adminCustomService.getAllAchievements();
        res.status(200).json(new ApiResponse(200, achievements, 'Achievements retrieved successfully'));
    });

    createAchievement = asyncHandler(async (req, res) => {
        const achievement = await adminCustomService.createAchievement(req.body);
        res.status(201).json(new ApiResponse(201, achievement, 'Achievement created successfully'));
    });

    updateAchievement = asyncHandler(async (req, res) => {
        const achievement = await adminCustomService.updateAchievement(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, achievement, 'Achievement updated successfully'));
    });

    deleteAchievement = asyncHandler(async (req, res) => {
        const result = await adminCustomService.deleteAchievement(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Achievement deleted successfully'));
    });

    // Boss CRUD
    getBosses = asyncHandler(async (req, res) => {
        const bosses = await adminCustomService.getAllBosses();
        res.status(200).json(new ApiResponse(200, bosses, 'Bosses retrieved successfully'));
    });

    createBoss = asyncHandler(async (req, res) => {
        const boss = await adminCustomService.createBoss(req.body);
        res.status(201).json(new ApiResponse(201, boss, 'Boss created successfully'));
    });

    updateBoss = asyncHandler(async (req, res) => {
        const boss = await adminCustomService.updateBoss(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, boss, 'Boss updated successfully'));
    });

    deleteBoss = asyncHandler(async (req, res) => {
        const result = await adminCustomService.deleteBoss(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Boss deleted successfully'));
    });
}

module.exports = new AdminCustomController();
