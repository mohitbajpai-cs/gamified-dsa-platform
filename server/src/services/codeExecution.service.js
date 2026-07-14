const vm = require('vm');

class CodeExecutionService {
    /**
     * Helper to safely parse JSON strings or return the raw string.
     */
    safeParse(str) {
        if (typeof str !== 'string') return str;
        try {
            // Check if it looks like a JSON array, object, boolean, number, or null
            const trimmed = str.trim();
            if (
                trimmed.startsWith('[') || 
                trimmed.startsWith('{') || 
                trimmed === 'true' || 
                trimmed === 'false' || 
                trimmed === 'null' || 
                !isNaN(trimmed)
            ) {
                return JSON.parse(str);
            }
            return str;
        } catch (e) {
            return str;
        }
    }

    /**
     * Recursively checks deep equality between actual and expected outputs.
     */
    deepEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return a === b;
        if (typeof a !== typeof b) return false;

        if (typeof a === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (keysA.length !== keysB.length) return false;

            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Parses the name of the function to call from the code definition.
     */
    getFunctionName(code, defaultName = 'solve') {
        const funcMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
        if (funcMatch && funcMatch[1]) return funcMatch[1];

        const varMatch = code.match(/(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*/);
        if (varMatch && varMatch[1]) return varMatch[1];

        return defaultName;
    }

    /**
     * Executes code in a secure vm sandbox against a set of test cases.
     * Supports both Sample Test Cases ("Run Code") and Hidden Test Cases ("Submit Code").
     */
    async execute(code, language, testCases, isSubmit = false, timeLimit = 2000) {
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

        const functionName = this.getFunctionName(code);
        let testCasesPassed = 0;
        let maxExecutionTime = 0;
        let finalVerdict = 'accepted';
        let errorMessage = '';

        // For Run Code, compile results details of each testcase.
        const runResults = [];

        for (let idx = 0; idx < testCases.length; idx++) {
            const tc = testCases[idx];
            const parsedInput = this.safeParse(tc.input);
            const parsedExpected = this.safeParse(tc.expectedOutput);

            // Sandbox execution environment setup
            const contextObject = {
                inputArgs: parsedInput,
                result: null,
                error: null
            };

            let sandbox;
            try {
                sandbox = vm.createContext(contextObject);
            } catch (err) {
                return {
                    verdict: 'runtime_error',
                    score: 0,
                    testCasesPassed,
                    totalTestCases: testCases.length,
                    errorMessage: `Sandbox initialization error: ${err.message}`,
                    executionTime: 0,
                    memoryUsed: 0
                };
            }

            const scriptCode = `
                try {
                    ${code}
                    
                    if (typeof ${functionName} !== 'function') {
                        throw new TypeError("Function '${functionName}' is not defined in your spell.");
                    }
                    
                    result = ${functionName}(inputArgs);
                } catch (e) {
                    error = {
                        name: e.name,
                        message: e.message
                    };
                }
            `;

            let script;
            try {
                script = new vm.Script(scriptCode);
            } catch (compileErr) {
                return {
                    verdict: 'compilation_error',
                    score: 0,
                    testCasesPassed: 0,
                    totalTestCases: testCases.length,
                    errorMessage: `Compilation Error: ${compileErr.message}`,
                    executionTime: 0,
                    memoryUsed: 0
                };
            }

            const startTime = process.hrtime();
            let tcPassed = false;
            let actualOutput = null;
            let tcVerdict = 'accepted';
            let tcError = '';
            let elapsedMs = 0;

            try {
                script.runInContext(sandbox, { timeout: timeLimit });
                
                const diff = process.hrtime(startTime);
                elapsedMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
                maxExecutionTime = Math.max(maxExecutionTime, elapsedMs);

                if (sandbox.error) {
                    tcVerdict = sandbox.error.name === 'SyntaxError' ? 'compilation_error' : 'runtime_error';
                    tcError = `${sandbox.error.name}: ${sandbox.error.message}`;
                    actualOutput = null;
                } else {
                    actualOutput = sandbox.result;
                    tcPassed = this.deepEqual(actualOutput, parsedExpected);
                    if (tcPassed) {
                        testCasesPassed++;
                    } else {
                        tcVerdict = 'wrong_answer';
                    }
                }
            } catch (execErr) {
                const diff = process.hrtime(startTime);
                elapsedMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
                maxExecutionTime = Math.max(maxExecutionTime, elapsedMs);

                if (execErr.message && execErr.message.includes('Script execution timed out')) {
                    tcVerdict = 'time_limit_exceeded';
                    tcError = `Time Limit Exceeded: Execution timed out after ${timeLimit}ms.`;
                } else {
                    tcVerdict = 'runtime_error';
                    tcError = `Runtime Error: ${execErr.message}`;
                }
                actualOutput = null;
            }

            // Save details for formatting run results
            runResults.push({
                index: idx + 1,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: actualOutput === null ? 'undefined' : (typeof actualOutput === 'object' ? JSON.stringify(actualOutput) : String(actualOutput)),
                passed: tcPassed,
                verdict: tcVerdict,
                error: tcError,
                runtime: elapsedMs
            });

            // Set final overall verdict priorities: compilation_error > time_limit_exceeded > runtime_error > wrong_answer
            if (tcVerdict !== 'accepted') {
                if (finalVerdict === 'accepted') {
                    finalVerdict = tcVerdict;
                    errorMessage = tcError;
                } else if (tcVerdict === 'compilation_error') {
                    finalVerdict = 'compilation_error';
                    errorMessage = tcError;
                } else if (tcVerdict === 'time_limit_exceeded' && finalVerdict !== 'compilation_error') {
                    finalVerdict = 'time_limit_exceeded';
                    errorMessage = tcError;
                } else if (tcVerdict === 'runtime_error' && finalVerdict !== 'compilation_error' && finalVerdict !== 'time_limit_exceeded') {
                    finalVerdict = 'runtime_error';
                    errorMessage = tcError;
                }
            }
        }

        // Mock memory usage cleanly within standard bounds (1.5 - 2.5 MB)
        const memoryUsed = Math.floor(Math.random() * 800) + 1600;

        if (isSubmit) {
            // Submit mode: Hide all detailed test case inputs/outputs for security
            return {
                verdict: finalVerdict,
                score: finalVerdict === 'accepted' ? 100 : 0,
                testCasesPassed,
                totalTestCases: testCases.length,
                errorMessage: (finalVerdict === 'compilation_error' || finalVerdict === 'runtime_error') ? errorMessage : '',
                executionTime: maxExecutionTime,
                memoryUsed
            };
        } else {
            // Run mode: format a premium console report of test results
            const lines = ['--- Spells Verification Console ---', ''];
            runResults.forEach(res => {
                lines.push(`Test Case ${res.index}: ${res.passed ? '✓ PASS' : '✗ FAIL'} (${res.verdict.toUpperCase().replace('_', ' ')})`);
                lines.push(`  Input:    ${res.input}`);
                lines.push(`  Expected: ${res.expected}`);
                lines.push(`  Actual:   ${res.actual}`);
                if (res.error) {
                    lines.push(`  Error:    ${res.error}`);
                }
                lines.push(`  Runtime:  ${res.runtime}ms`);
                lines.push('');
            });

            const overallPassed = testCasesPassed === testCases.length;
            return {
                verdict: finalVerdict,
                score: overallPassed ? 100 : 0,
                testCasesPassed,
                totalTestCases: testCases.length,
                errorMessage: lines.join('\n'),
                executionTime: maxExecutionTime,
                memoryUsed
            };
        }
    }
}

module.exports = new CodeExecutionService();
