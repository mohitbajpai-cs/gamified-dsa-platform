const Problem = require('../models/problem.model');
const Topic = require('../models/topic.model');
const ApiError = require('../utils/apiError');

class ProblemService {
    /**
     * Retrieves all problems linked to a topic (omits solution template to prevent cheating).
     */
    async getProblemsByTopic(topicId) {
        const topicExists = await Topic.exists({ _id: topicId });
        if (!topicExists) {
            throw new ApiError(404, 'Topic associated with problems not found');
        }
        return await Problem.find({ topic: topicId }).select('-solutionTemplate');
    }

    /**
     * Retrieves complete problem specifications (excluding solutionTemplate for security).
     */
    async getProblemById(id) {
        const problem = await Problem.findById(id).select('-solutionTemplate');
        if (!problem) {
            throw new ApiError(404, 'Problem not found');
        }
        return problem;
    }
}

module.exports = new ProblemService();
