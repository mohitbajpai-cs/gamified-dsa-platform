const Problem = require('../models/problem.model');
const Topic = require('../models/topic.model');
const World = require('../models/world.model');
const TestCase = require('../models/testCase.model');
const Submission = require('../models/submission.model');
const ApiError = require('../utils/apiError');

class AdminProblemService {
    /**
     * Lists all problems, populating world and topic names.
     */
    async getAll() {
        return await Problem.find()
            .populate('world', 'name')
            .populate('topic', 'name');
    }

    /**
     * Creates a new coding problem under a world and topic.
     */
    async createProblem(problemData) {
        const {
            world, topic, title, description, difficulty, starterCode,
            solutionTemplate, examples, constraints, hints, tags,
            xpReward, coinReward, bossLevel
        } = problemData;

        if (!world || !topic || !title || !description || !difficulty) {
            throw new ApiError(400, 'World, Topic, Title, Description, and Difficulty are required');
        }

        const worldExists = await World.exists({ _id: world });
        if (!worldExists) {
            throw new ApiError(404, 'World not found');
        }

        const topicExists = await Topic.exists({ _id: topic });
        if (!topicExists) {
            throw new ApiError(404, 'Topic not found');
        }

        const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const exists = await Problem.exists({ $or: [{ title }, { slug }] });
        if (exists) {
            throw new ApiError(409, 'Problem with this title or slug already exists');
        }

        const problem = await Problem.create({
            world,
            topic,
            title: title.trim(),
            slug,
            description,
            difficulty,
            starterCode: starterCode || '',
            solutionTemplate: solutionTemplate || '',
            examples: examples || [],
            constraints: constraints || [],
            hints: hints || [],
            tags: tags || [],
            xpReward: xpReward || 0,
            coinReward: coinReward || 0,
            bossLevel: bossLevel || false
        });

        // Increment total problem counters
        await World.findByIdAndUpdate(world, { $inc: { totalProblems: 1 } });
        await Topic.findByIdAndUpdate(topic, { $inc: { totalProblems: 1 } });

        return problem;
    }

    /**
     * Updates an existing problem.
     */
    async updateProblem(problemId, updateData) {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new ApiError(404, 'Problem not found');
        }

        if (updateData.title) {
            const newTitle = updateData.title.trim();
            const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const exists = await Problem.exists({
                _id: { $ne: problemId },
                $or: [{ title: newTitle }, { slug: newSlug }]
            });
            if (exists) {
                throw new ApiError(409, 'Another problem with this title or slug already exists');
            }
            problem.title = newTitle;
            problem.slug = newSlug;
        }

        if (updateData.description !== undefined) problem.description = updateData.description;
        if (updateData.difficulty !== undefined) problem.difficulty = updateData.difficulty;
        if (updateData.starterCode !== undefined) problem.starterCode = updateData.starterCode;
        if (updateData.solutionTemplate !== undefined) problem.solutionTemplate = updateData.solutionTemplate;
        if (updateData.examples !== undefined) problem.examples = updateData.examples;
        if (updateData.constraints !== undefined) problem.constraints = updateData.constraints;
        if (updateData.hints !== undefined) problem.hints = updateData.hints;
        if (updateData.tags !== undefined) problem.tags = updateData.tags;
        if (updateData.xpReward !== undefined) problem.xpReward = updateData.xpReward;
        if (updateData.coinReward !== undefined) problem.coinReward = updateData.coinReward;
        if (updateData.bossLevel !== undefined) problem.bossLevel = updateData.bossLevel;

        return await problem.save();
    }

    /**
     * Deletes a problem and cascades deletion of testcases and submissions, decrementing counters.
     */
    async deleteProblem(problemId) {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new ApiError(404, 'Problem not found');
        }

        // Delete cascade items
        await TestCase.deleteMany({ problem: problemId });
        await Submission.deleteMany({ problem: problemId });

        // Decrement counters
        await World.findByIdAndUpdate(problem.world, { $inc: { totalProblems: -1 } });
        await Topic.findByIdAndUpdate(problem.topic, { $inc: { totalProblems: -1 } });

        // Delete the problem itself
        await Problem.findByIdAndDelete(problemId);

        return { message: 'Problem and all nested testcases/submissions deleted successfully' };
    }
}

module.exports = new AdminProblemService();
