const adminProblemService = require('../services/adminProblem.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AdminProblemController {
    /**
     * GET /api/admin/problems
     */
    getAll = asyncHandler(async (req, res) => {
        const problems = await adminProblemService.getAll();
        res.status(200).json(new ApiResponse(200, problems, 'Problems retrieved successfully'));
    });

    /**
     * POST /api/admin/problems
     */
    create = asyncHandler(async (req, res) => {
        const problem = await adminProblemService.createProblem(req.body);
        res.status(201).json(new ApiResponse(201, problem, 'Problem created successfully'));
    });

    /**
     * PUT /api/admin/problems/:id
     */
    update = asyncHandler(async (req, res) => {
        const problem = await adminProblemService.updateProblem(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, problem, 'Problem updated successfully'));
    });

    /**
     * DELETE /api/admin/problems/:id
     */
    delete = asyncHandler(async (req, res) => {
        const result = await adminProblemService.deleteProblem(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Problem and nested test cases deleted successfully'));
    });
}

module.exports = new AdminProblemController();
