class CodeExecutionService {
    /**
     * Executes the user code against a set of test cases.
     * Abstraction wrapper: can be replaced later with Docker, Judge0, or Piston
     * without modifying services or controllers.
     *
     * @param {string} code - The submitted source code string.
     * @param {string} language - The programming language.
     * @param {Array} testCases - The array of evaluation TestCases from the DB.
     * @returns {Promise<Object>} The execution result output.
     */
    async execute(code, language, testCases) {
        // Base input validations
        if (!code || code.trim() === "") {
            return {
                verdict: 'compilation_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: 'Compilation Error: Submitted code cannot be empty.',
                executionTime: 0,
                memoryUsed: 0
            };
        }

        // Mock error conditions if code contains clear syntactic flaws
        const trimmedCode = code.trim();
        if (trimmedCode.includes('syntax_error_simulation')) {
            return {
                verdict: 'compilation_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: 'Compilation Error: SyntaxError: Unexpected token',
                executionTime: 0,
                memoryUsed: 0
            };
        }

        if (trimmedCode.includes('infinite_loop_simulation')) {
            return {
                verdict: 'time_limit_exceeded',
                score: 0,
                testCasesPassed: Math.floor(testCases.length / 3),
                totalTestCases: testCases.length,
                errorMessage: 'Time Limit Exceeded: Execution timed out after 1000ms.',
                executionTime: 1000,
                memoryUsed: 2048
            };
        }

        if (trimmedCode.includes('runtime_error_simulation')) {
            return {
                verdict: 'runtime_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: 'Runtime Error: TypeError: Cannot read properties of undefined',
                executionTime: 12,
                memoryUsed: 1024
            };
        }

        // Mock wrong answer conditions
        const hasReturn = trimmedCode.includes('return');
        if (!hasReturn) {
            return {
                verdict: 'wrong_answer',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: 'Wrong Answer: Code output does not match expected output.',
                executionTime: 8,
                memoryUsed: 512
            };
        }

        // Successful execution mock
        return {
            verdict: 'accepted',
            score: 100,
            testCasesPassed: testCases.length,
            totalTestCases: testCases.length,
            errorMessage: '',
            executionTime: Math.floor(Math.random() * 50) + 10, // Mock 10-60ms runtime
            memoryUsed: Math.floor(Math.random() * 1000) + 1200 // Mock 1.2-2.2MB RAM usage
        };
    }
}

module.exports = new CodeExecutionService();
