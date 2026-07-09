const worldService = require('../services/world.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class WorldController {
    /**
     * GET /api/worlds
     */
    getAll = asyncHandler(async (req, res) => {
        const worlds = await worldService.getAllWorlds();
        res.status(200).json(new ApiResponse(200, worlds, 'Worlds retrieved successfully'));
    });

    /**
     * GET /api/worlds/:id
     */
    getById = asyncHandler(async (req, res) => {
        const world = await worldService.getWorldById(req.params.id);
        res.status(200).json(new ApiResponse(200, world, 'World retrieved successfully'));
    });
}

module.exports = new WorldController();
