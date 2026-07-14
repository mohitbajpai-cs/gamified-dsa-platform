const javascriptExecutor = require('./executors/javascript.executor');
const cppExecutor = require('./executors/cpp.executor');
const cExecutor = require('./executors/c.executor');
const javaExecutor = require('./executors/java.executor');

class JudgeService {
    async execute(code, language, testCases, isSubmit = false, timeLimit = 2000) {
        try {
            const lang = language.toLowerCase();
            let result;

            switch (lang) {
                case 'javascript':
                case 'js':
                    result = await javascriptExecutor.execute(code, testCases, isSubmit, timeLimit);
                    break;
                case 'cpp':
                case 'c++':
                    result = await cppExecutor.execute(code, testCases, isSubmit, timeLimit);
                    break;
                case 'c':
                    result = await cExecutor.execute(code, testCases, isSubmit, timeLimit);
                    break;
                case 'java':
                    result = await javaExecutor.execute(code, testCases, isSubmit, timeLimit);
                    break;
                default:
                    return {
                        verdict: 'compilation_error',
                        score: 0,
                        testCasesPassed: 0,
                        totalTestCases: testCases.length,
                        errorMessage: `Compilation Error: Language '${language}' is not supported by Valthor's execution core.`,
                        executionTime: 0,
                        memoryUsed: 0
                    };
            }

            // Map custom execution verdicts to standard database schema enums
            if (result.verdict === 'output_limit_exceeded') {
                result.verdict = 'runtime_error';
                result.errorMessage = 'Runtime Error: Output Limit Exceeded (Printed too much data)';
            } else if (result.verdict === 'presentation_error') {
                result.verdict = 'wrong_answer';
                result.errorMessage = 'Wrong Answer: Presentation Error (Output format issues)';
            } else if (result.verdict === 'internal_error') {
                result.verdict = 'runtime_error';
                result.errorMessage = 'Runtime Error: Internal Judge Error';
            }

            return result;
        } catch (err) {
            console.error('JudgeService Internal Error:', err);
            return {
                verdict: 'runtime_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: `Runtime Error: Internal Judge Error (${err.message})`,
                executionTime: 0,
                memoryUsed: 0
            };
        }
    }
}

module.exports = new JudgeService();
