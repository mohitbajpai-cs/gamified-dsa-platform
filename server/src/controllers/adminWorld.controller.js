const adminWorldService = require('../services/adminWorld.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AdminWorldController {
    /**
     * GET /api/admin/worlds
     */
    getAll = asyncHandler(async (req, res) => {
        const worlds = await adminWorldService.getAll();
        res.status(200).json(new ApiResponse(200, worlds, 'Worlds retrieved successfully'));
    });

    /**
     * POST /api/admin/worlds
     */
    create = asyncHandler(async (req, res) => {
        const world = await adminWorldService.createWorld(req.body);
        res.status(201).json(new ApiResponse(201, world, 'World created successfully'));
    });

    /**
     * PUT /api/admin/worlds/:id
     */
    update = asyncHandler(async (req, res) => {
        const world = await adminWorldService.updateWorld(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, world, 'World updated successfully'));
    });

    /**
     * DELETE /api/admin/worlds/:id
     */
    delete = asyncHandler(async (req, res) => {
        const result = await adminWorldService.deleteWorld(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'World and all nested items deleted successfully'));
    });
}

module.exports = new AdminWorldController();
