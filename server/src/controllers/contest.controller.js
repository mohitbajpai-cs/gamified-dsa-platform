const contestService = require('../services/contest.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ContestController {
    getAll = asyncHandler(async (req, res) => {
        const contests = await contestService.getAllContests();
        res.status(200).json(new ApiResponse(200, contests, 'Contests retrieved successfully'));
    });

    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user ? req.user._id : null;
        const data = await contestService.getContestById(id, userId);
        res.status(200).json(new ApiResponse(200, data, 'Contest details retrieved successfully'));
    });

    register = asyncHandler(async (req, res) => {
        const { id } = req.body;
        const registration = await contestService.registerUser(id, req.user._id);
        res.status(200).json(new ApiResponse(200, registration, 'Registered for contest successfully'));
    });

    start = asyncHandler(async (req, res) => {
        const { id } = req.body;
        const registration = await contestService.startContest(id, req.user._id);
        res.status(200).json(new ApiResponse(200, registration, 'Contest session started successfully'));
    });

    submit = asyncHandler(async (req, res) => {
        const { contestId, problemId, code, language } = req.body;
        const result = await contestService.submitContestSolution({
            contestId,
            userId: req.user._id,
            problemId,
            code,
            language
        });
        res.status(200).json(new ApiResponse(200, result, 'Contest solution evaluated successfully'));
    });

    getLeaderboard = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const leaderboard = await contestService.getContestLeaderboard(id);
        res.status(200).json(new ApiResponse(200, leaderboard, 'Contest leaderboard retrieved successfully'));
    });

    getHistory = asyncHandler(async (req, res) => {
        const history = await contestService.getContestHistory(req.user._id);
        res.status(200).json(new ApiResponse(200, history, 'Contest history retrieved successfully'));
    });

    // Admin CRUD
    create = asyncHandler(async (req, res) => {
        const contest = await contestService.createContest(req.body);
        res.status(201).json(new ApiResponse(201, contest, 'Contest created successfully'));
    });

    update = asyncHandler(async (req, res) => {
        const contest = await contestService.updateContest(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, contest, 'Contest updated successfully'));
    });

    delete = asyncHandler(async (req, res) => {
        const result = await contestService.deleteContest(req.params.id);
        res.status(200).json(new ApiResponse(200, result, 'Contest deleted successfully'));
    });
}

module.exports = new ContestController();
