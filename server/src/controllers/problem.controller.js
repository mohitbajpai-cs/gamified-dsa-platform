const problemService = require('../services/problem.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ProblemController {
    /**
     * GET /api/problems/:topicId
     */
    getByTopic = asyncHandler(async (req, res) => {
        const problems = await problemService.getProblemsByTopic(req.params.topicId);
        res.status(200).json(new ApiResponse(200, problems, 'Problems retrieved successfully'));
    });

    /**
     * GET /api/problem/:id
     */
    getById = asyncHandler(async (req, res) => {
        const problem = await problemService.getProblemById(req.params.id);
        res.status(200).json(new ApiResponse(200, problem, 'Problem retrieved successfully'));
    });
}

module.exports = new ProblemController();
