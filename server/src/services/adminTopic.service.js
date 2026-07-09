const Topic = require('../models/topic.model');
const World = require('../models/world.model');
const Problem = require('../models/problem.model');
const TestCase = require('../models/testCase.model');
const Submission = require('../models/submission.model');
const ApiError = require('../utils/apiError');

class AdminTopicService {
    /**
     * Lists all topics, populating parent world names.
     */
    async getAll() {
        return await Topic.find().populate('world', 'name').sort({ order: 1 });
    }

    /**
     * Creates a new topic inside a world.
     */
    async createTopic(topicData) {
        const { world, name, description, order } = topicData;
        if (!world || !name) {
            throw new ApiError(400, 'World reference and Topic name are required');
        }

        const worldExists = await World.exists({ _id: world });
        if (!worldExists) {
            throw new ApiError(404, 'Parent world not found');
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const exists = await Topic.exists({ slug });
        if (exists) {
            throw new ApiError(409, 'Topic with this name/slug already exists');
        }

        return await Topic.create({
            world,
            name: name.trim(),
            slug,
            description: description || '',
            order: order || 0
        });
    }

    /**
     * Updates an existing topic.
     */
    async updateTopic(topicId, updateData) {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new ApiError(404, 'Topic not found');
        }

        if (updateData.name) {
            const newName = updateData.name.trim();
            const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const exists = await Topic.exists({
                _id: { $ne: topicId },
                slug: newSlug
            });
            if (exists) {
                throw new ApiError(409, 'Another topic with this name/slug already exists');
            }
            topic.name = newName;
            topic.slug = newSlug;
        }

        if (updateData.description !== undefined) topic.description = updateData.description;
        if (updateData.order !== undefined) topic.order = updateData.order;

        return await topic.save();
    }

    /**
     * Deletes a topic and cascades deletion of child problems, testcases, and submissions.
     */
    async deleteTopic(topicId) {
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new ApiError(404, 'Topic not found');
        }

        const problems = await Problem.find({ topic: topicId });
        const problemIds = problems.map(p => p._id);

        // Delete cascade items
        await TestCase.deleteMany({ problem: { $in: problemIds } });
        await Submission.deleteMany({ problem: { $in: problemIds } });
        await Problem.deleteMany({ topic: topicId });

        // Delete the topic itself
        await Topic.findByIdAndDelete(topicId);

        return { message: 'Topic and all nested problems/testcases deleted successfully' };
    }
}

module.exports = new AdminTopicService();
