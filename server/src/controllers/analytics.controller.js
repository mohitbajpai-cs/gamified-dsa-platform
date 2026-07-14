const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AnalyticsController {
    getUserAnalytics = asyncHandler(async (req, res) => {
        const data = await analyticsService.getUserAnalytics(req.user._id);
        res.status(200).json(new ApiResponse(200, data, 'User analytics loaded successfully'));
    });

    getAdminAnalytics = asyncHandler(async (req, res) => {
        const data = await analyticsService.getAdminAnalytics();
        res.status(200).json(new ApiResponse(200, data, 'Admin analytics loaded successfully'));
    });

    getActivityAnalytics = asyncHandler(async (req, res) => {
        const data = await analyticsService.getActivityHeatmap(req.user._id);
        res.status(200).json(new ApiResponse(200, data, 'Activity heatmap analytics loaded successfully'));
    });

    getTopicMasteryAnalytics = asyncHandler(async (req, res) => {
        const data = await analyticsService.getTopicMastery(req.user._id);
        res.status(200).json(new ApiResponse(200, data, 'Topic mastery analytics loaded successfully'));
    });
}

module.exports = new AnalyticsController();
