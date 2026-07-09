const topicService = require('../services/topic.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class TopicController {
    /**
     * GET /api/topics/:worldId
     */
    getByWorld = asyncHandler(async (req, res) => {
        const topics = await topicService.getTopicsByWorld(req.params.worldId);
        res.status(200).json(new ApiResponse(200, topics, 'Topics retrieved successfully'));
    });
}

module.exports = new TopicController();
