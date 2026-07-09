const seedService = require('../services/seed.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class SeedController {
    /**
     * POST /api/admin/seed
     */
    runSeed = asyncHandler(async (req, res) => {
        const fullReset = req.body.fullReset === true;
        const result = await seedService.seedDatabase({
            userId: req.user._id,
            fullReset
        });
        res.status(200).json(new ApiResponse(200, result, 'Database seeded successfully'));
    });
}

module.exports = new SeedController();
