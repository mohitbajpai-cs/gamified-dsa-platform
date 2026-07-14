const submissionService = require('../services/submission.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const lastSubmissionCache = new Map();

class SubmissionController {
    /**
     * POST /api/submissions (or POST /api/submission)
     */
    submit = asyncHandler(async (req, res) => {
        const { problemId, code, language, isSubmit } = req.body;
        
        const userIdStr = String(req.user._id);
        const now = Date.now();
        if (lastSubmissionCache.has(userIdStr)) {
            const diff = now - lastSubmissionCache.get(userIdStr);
            if (diff < 3000) {
                throw new ApiError(429, 'Your spells are cooling down. Please wait 3 seconds before casting again.');
            }
        }
        lastSubmissionCache.set(userIdStr, now);

        const result = await submissionService.submitSolution({
            userId: req.user._id,
            problemId,
            code,
            language,
            isSubmit
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
