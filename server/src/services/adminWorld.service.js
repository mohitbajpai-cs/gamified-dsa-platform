const World = require('../models/world.model');
const Topic = require('../models/topic.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const Progress = require('../models/progress.model');
const Submission = require('../models/submission.model');
const ApiError = require('../utils/apiError');

class AdminWorldService {
    /**
     * Lists all worlds for admin.
     */
    async getAll() {
        return await World.find().sort({ order: 1 });
    }

    /**
     * Creates a new world.
     */
    async createWorld(worldData) {
        const { name, description, difficulty, order, unlockLevel, thumbnail } = worldData;
        if (!name || !description || !difficulty) {
            throw new ApiError(400, 'Name, description, and difficulty are required');
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const exists = await World.exists({ $or: [{ name }, { slug }] });
        if (exists) {
            throw new ApiError(409, 'World with this name or slug already exists');
        }

        return await World.create({
            name: name.trim(),
            slug,
            description,
            difficulty,
            order: order || 0,
            unlockLevel: unlockLevel || 1,
            thumbnail: thumbnail || ''
        });
    }

    /**
     * Updates an existing world.
     */
    async updateWorld(worldId, updateData) {
        const world = await World.findById(worldId);
        if (!world) {
            throw new ApiError(404, 'World not found');
        }

        if (updateData.name) {
            const newName = updateData.name.trim();
            const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const exists = await World.exists({
                _id: { $ne: worldId },
                $or: [{ name: newName }, { slug: newSlug }]
            });
            if (exists) {
                throw new ApiError(409, 'Another world with this name or slug already exists');
            }
            world.name = newName;
            world.slug = newSlug;
        }

        if (updateData.description !== undefined) world.description = updateData.description;
        if (updateData.difficulty !== undefined) world.difficulty = updateData.difficulty;
        if (updateData.order !== undefined) world.order = updateData.order;
        if (updateData.unlockLevel !== undefined) world.unlockLevel = updateData.unlockLevel;
        if (updateData.thumbnail !== undefined) world.thumbnail = updateData.thumbnail;

        return await world.save();
    }

    /**
     * Deletes a world and cascades deletion of child topics, problems, testcases, progress, and submissions.
     */
    async deleteWorld(worldId) {
        const world = await World.findById(worldId);
        if (!world) {
            throw new ApiError(404, 'World not found');
        }

        // Fetch associated problems to delete testcases/submissions
        const problems = await Problem.find({ world: worldId });
        const problemIds = problems.map(p => p._id);

        // Delete cascaded children
        await TestCase.deleteMany({ problem: { $in: problemIds } });
        await Submission.deleteMany({ problem: { $in: problemIds } });
        await Problem.deleteMany({ world: worldId });
        await Topic.deleteMany({ world: worldId });
        await Progress.deleteMany({ world: worldId });

        // Delete the world itself
        await World.findByIdAndDelete(worldId);

        return { message: 'World and all nested components deleted successfully' };
    }
}

module.exports = new AdminWorldService();
