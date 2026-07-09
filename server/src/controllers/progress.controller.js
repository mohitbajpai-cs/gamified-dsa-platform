const progressService = require('../services/progress.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ProgressController {
    /**
     * GET /api/progress
     */
    get = asyncHandler(async (req, res) => {
        const progress = await progressService.getUserProgress(req.user._id);
        res.status(200).json(new ApiResponse(200, progress, 'Player progress logs retrieved successfully'));
    });
}

module.exports = new ProgressController();
