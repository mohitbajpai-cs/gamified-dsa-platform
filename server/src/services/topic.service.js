const Topic = require('../models/topic.model');
const World = require('../models/world.model');
const ApiError = require('../utils/apiError');

class TopicService {
    /**
     * Retrieves all topics grouped under a specific world ID.
     */
    async getTopicsByWorld(worldId) {
        // Validate that parent world exists
        const worldExists = await World.exists({ _id: worldId });
        if (!worldExists) {
            throw new ApiError(404, 'World associated with topics not found');
        }
        return await Topic.find({ world: worldId }).sort({ order: 1 });
    }
}

module.exports = new TopicService();
