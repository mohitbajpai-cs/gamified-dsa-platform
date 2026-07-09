const submissionService = require('../services/submission.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class SubmissionController {
    /**
     * POST /api/submissions (or POST /api/submission)
     */
    submit = asyncHandler(async (req, res) => {
        const { problemId, code, language } = req.body;
        const result = await submissionService.submitSolution({
            userId: req.user._id,
            problemId,
            code,
            language
        });
        res.status(201).json(new ApiResponse(201, result, 'Submission evaluated successfully'));
    });

    /**
     * GET /api/submissions
     */
    getHistory = asyncHandler(async (req, res) => {
        const history = await submissionService.getHistory(req.user._id);
        res.status(200).json(new ApiResponse(200, history, 'Submission history retrieved successfully'));
    });

    /**
     * GET /api/submissions/:problemId
     */
    getProblemHistory = asyncHandler(async (req, res) => {
        const history = await submissionService.getProblemHistory(req.user._id, req.params.problemId);
        res.status(200).json(new ApiResponse(200, history, 'Problem submission history retrieved successfully'));
    });
}

module.exports = new SubmissionController();
