const adminTopicService = require('../services/adminTopic.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AdminTopicController {
    /**
     * GET /api/admin/topics
     */
    getAll = asyncHandler(async (req, res) => {
        const topics = await adminTopicService.getAll();
        res.status(200).json(new ApiResponse(200, topics, 'Topics retrieved successfully'));
    });

    /**
     * POST /api/admin/topics
     */
    create = asyncHandler(async (req, res) => {
        const topic = await adminTopicService.createTopic(req.body);
        res.status(201).json(new ApiResponse(201, topic, 'Topic created successfully'));
    });

    /**
     * PUT /api/admin/topics/:id
     */
    update = asyncHandler(async (req, res) => {
        const topic = await adminTopicService.updateTopic(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, topic, 'Topic updated successfully'));
    });

    /**
     * DELETE /api/admin/topics/:id
     */
    delete = asyncHandler(async (req, res) => {
        const result = await adminTopicService.deleteTopic(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Topic and nested problems deleted successfully'));
    });
}

module.exports = new AdminTopicController();
