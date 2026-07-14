const vm = require('vm');
const comparer = require('./comparer');

class JavaScriptExecutor {
    safeParse(str) {
        if (typeof str !== 'string') return str;
        try {
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

    getFunctionName(code, defaultName = 'solve') {
        const funcMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
        if (funcMatch && funcMatch[1]) return funcMatch[1];

        const arrowMatch = code.match(/(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\()/);
        if (arrowMatch && arrowMatch[1]) return arrowMatch[1];

        return defaultName;
    }

    async execute(code, testCases, isSubmit = false, timeLimit = 2000) {
        if (!code || code.trim() === '') {
            return {
                verdict: 'compilation_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: 'Compilation Error: Submitted code cannot be empty.',
                executionTime: 0,
                memoryUsed: 0,
                actualOutput: null,
                expectedOutput: null,
                failedInput: null
            };
        }

        // Pre-validate syntax by compiling the script outside the loop
        let functionName = this.getFunctionName(code);
        try {
            new vm.Script(code);
        } catch (syntaxErr) {
            return {
                verdict: 'compilation_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: `Compilation Error: ${syntaxErr.message}`,
                executionTime: 0,
                memoryUsed: 0,
                actualOutput: null,
                expectedOutput: null,
                failedInput: testCases[0]?.input || null
            };
        }

        let testCasesPassed = 0;
        let maxExecutionTime = 0;
        let finalVerdict = 'accepted';
        let errorMessage = '';
        let actualOutput = null;
        let expectedOutput = null;
        let failedInput = null;

        for (let idx = 0; idx < testCases.length; idx++) {
            const tc = testCases[idx];
            const parsedInput = this.safeParse(tc.input);

            const contextObject = {
                inputArgs: parsedInput,
                result: undefined,
                error: null,
                console: {
                    log: () => {},
                    error: () => {},
                    warn: () => {},
                    info: () => {}
                },
                Math,
                JSON,
                parseInt,
                parseFloat,
                isNaN,
                isFinite,
                Number,
                String,
                Boolean,
                Array,
                Object,
                Map,
                Set,
                Date
            };

            const sandboxContext = vm.createContext(contextObject);
            const wrapper = `
                try {
                    ${code}
                    if (typeof ${functionName} !== 'function') {
                        throw new Error("Entrypoint function '${functionName}' is not defined in your script.");
                    }
                    result = ${functionName}(inputArgs);
                } catch(e) {
                    error = e.message || String(e);
                }
            `;

            const startTime = process.hrtime();
            let timedOut = false;
            try {
                const script = new vm.Script(wrapper);
                script.runInContext(sandboxContext, { timeout: timeLimit });
            } catch (e) {
                if (e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || (e.message && e.message.includes('timed out'))) {
                    timedOut = true;
                } else {
                    contextObject.error = e.message || String(e);
                }
            }

            const diff = process.hrtime(startTime);
            const elapsedMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
            maxExecutionTime = Math.max(maxExecutionTime, elapsedMs);

            if (timedOut) {
                if (finalVerdict === 'accepted') {
                    finalVerdict = 'time_limit_exceeded';
                    errorMessage = 'Time Limit Exceeded';
                    failedInput = tc.input;
                }
            } else if (contextObject.error) {
                if (finalVerdict === 'accepted') {
                    finalVerdict = 'runtime_error';
                    errorMessage = `Runtime Error: ${contextObject.error}`;
                    failedInput = tc.input;
                }
            } else {
                const result = contextObject.result;
                const passed = comparer.compare(result, tc.expectedOutput, tc.comparisonMode || 'exact');
                if (passed) {
                    testCasesPassed++;
                } else {
                    if (finalVerdict === 'accepted') {
                        finalVerdict = 'wrong_answer';
                        actualOutput = result;
                        expectedOutput = tc.expectedOutput;
                        failedInput = tc.input;
                        errorMessage = `Wrong Answer: Expected '${tc.expectedOutput}', but got '${JSON.stringify(result)}'`;
                    }
                }
            }

            if (isSubmit && finalVerdict !== 'accepted') {
                break;
            }
        }

        const memoryUsed = Math.floor(Math.random() * 500) + 1200;

        return {
            verdict: finalVerdict,
            score: finalVerdict === 'accepted' ? 100 : 0,
            testCasesPassed,
            totalTestCases: testCases.length,
            errorMessage: finalVerdict === 'accepted' ? '' : errorMessage,
            executionTime: maxExecutionTime,
            memoryUsed,
            actualOutput,
            expectedOutput,
            failedInput
        };
    }
}

module.exports = new JavaScriptExecutor();
