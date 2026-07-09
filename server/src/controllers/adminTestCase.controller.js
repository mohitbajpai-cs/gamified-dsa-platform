const adminTestCaseService = require('../services/adminTestCase.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class AdminTestCaseController {
    /**
     * GET /api/admin/testcases
     */
    getAll = asyncHandler(async (req, res) => {
        const testCases = await adminTestCaseService.getAll();
        res.status(200).json(new ApiResponse(200, testCases, 'TestCases retrieved successfully'));
    });

    /**
     * POST /api/admin/testcases
     */
    create = asyncHandler(async (req, res) => {
        const testCase = await adminTestCaseService.createTestCase(req.body);
        res.status(201).json(new ApiResponse(201, testCase, 'TestCase created successfully'));
    });

    /**
     * PUT /api/admin/testcases/:id
     */
    update = asyncHandler(async (req, res) => {
        const testCase = await adminTestCaseService.updateTestCase(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, testCase, 'TestCase updated successfully'));
    });

    /**
     * DELETE /api/admin/testcases/:id
     */
    delete = asyncHandler(async (req, res) => {
        const result = await adminTestCaseService.deleteTestCase(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'TestCase deleted successfully'));
    });
}

module.exports = new AdminTestCaseController();
