const TestCase = require('../models/testCase.model');
const Problem = require('../models/problem.model');
const ApiError = require('../utils/apiError');

class AdminTestCaseService {
    /**
     * Lists all test cases, populating parent problem titles.
     */
    async getAll() {
        return await TestCase.find().populate('problem', 'title');
    }

    /**
     * Creates a new test case for a problem.
     */
    async createTestCase(testCaseData) {
        const { problem, input, expectedOutput, hidden, explanation } = testCaseData;
        if (!problem || input === undefined || expectedOutput === undefined) {
            throw new ApiError(400, 'Problem reference, Input, and Expected Output are required');
        }

        const problemExists = await Problem.exists({ _id: problem });
        if (!problemExists) {
            throw new ApiError(404, 'Problem associated with this testcase not found');
        }

        return await TestCase.create({
            problem,
            input,
            expectedOutput,
            hidden: hidden !== undefined ? hidden : true,
            explanation: explanation || ''
        });
    }

    /**
     * Updates an existing test case.
     */
    async updateTestCase(testCaseId, updateData) {
        const testCase = await TestCase.findById(testCaseId);
        if (!testCase) {
            throw new ApiError(404, 'TestCase not found');
        }

        if (updateData.input !== undefined) testCase.input = updateData.input;
        if (updateData.expectedOutput !== undefined) testCase.expectedOutput = updateData.expectedOutput;
        if (updateData.hidden !== undefined) testCase.hidden = updateData.hidden;
        if (updateData.explanation !== undefined) testCase.explanation = updateData.explanation;

        return await testCase.save();
    }

    /**
     * Deletes an existing test case.
     */
    async deleteTestCase(testCaseId) {
        const testCase = await TestCase.findById(testCaseId);
        if (!testCase) {
            throw new ApiError(404, 'TestCase not found');
        }

        await TestCase.findByIdAndDelete(testCaseId);
        return { message: 'TestCase deleted successfully' };
    }
}

module.exports = new AdminTestCaseService();
