const World = require('../models/world.model');
const ApiError = require('../utils/apiError');

class WorldService {
    /**
     * Retrieves all worlds sorted by their display order.
     */
    async getAllWorlds() {
        return await World.find().sort({ order: 1 });
    }

    /**
     * Retrieves a single world by ID.
     */
    async getWorldById(id) {
        const world = await World.findById(id);
        if (!world) {
            throw new ApiError(404, 'World not found');
        }
        return world;
    }
}

module.exports = new WorldService();
