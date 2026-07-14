const bossService = require('../services/boss.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class BossController {
    getAllBosses = asyncHandler(async (req, res) => {
        const bosses = await bossService.getAllBosses(req.user._id);
        res.status(200).json(new ApiResponse(200, bosses, 'All bosses retrieved successfully'));
    });

    getBossByRealmId = asyncHandler(async (req, res) => {
        const { realmId } = req.params;
        const boss = await bossService.getBossByRealmId(req.user._id, realmId);
        res.status(200).json(new ApiResponse(200, boss, 'Boss details retrieved successfully'));
    });

    submitBossSolution = asyncHandler(async (req, res) => {
        const { realmId, code, language } = req.body;
        const result = await bossService.submitBossSolution(req.user._id, realmId, code, language);
        res.status(200).json(new ApiResponse(200, result, 'Boss solution evaluated successfully'));
    });

    getBossRewards = asyncHandler(async (req, res) => {
        const rewards = await bossService.getUserRewards(req.user._id);
        res.status(200).json(new ApiResponse(200, rewards, 'Boss rewards retrieved successfully'));
    });
}

module.exports = new BossController();
