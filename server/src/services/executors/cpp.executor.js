const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const comparer = require('./comparer');
const inputSerializer = require('./inputSerializer');

class CppExecutor {
    constructor() {
        this.scratchDir = path.join(__dirname, '../../../../scratch/exec_runs');
        if (!fs.existsSync(this.scratchDir)) {
            fs.mkdirSync(this.scratchDir, { recursive: true });
        }
    }

    compileCode(sourcePath, binaryPath) {
        return new Promise((resolve) => {
            const child = spawn('g++', ['-O3', sourcePath, '-o', binaryPath]);
            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => { stdout += data; });
            child.stderr.on('data', (data) => { stderr += data; });

            child.on('close', (code) => {
                if (code !== 0) {
                    resolve({ code, error: stderr || stdout || 'Compilation failed with unknown error.' });
                } else {
                    resolve({ code: 0, error: '' });
                }
            });
        });
    }

    runBinary(binaryPath, input, timeLimit) {
        return new Promise((resolve) => {
            const child = spawn(binaryPath);
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            let outputLimitExceeded = false;

            const timer = setTimeout(() => {
                timedOut = true;
                try {
                    child.kill('SIGKILL');
                } catch (e) {}
            }, timeLimit);

            child.stdout.on('data', (data) => {
                stdout += data;
                if (stdout.length > 1024 * 1024) { // 1MB Output Limit
                    outputLimitExceeded = true;
                    try { child.kill('SIGKILL'); } catch (e) {}
                }
            });

            child.stderr.on('data', (data) => {
                stderr += data;
            });

            child.on('close', (code) => {
                clearTimeout(timer);
                if (timedOut) {
                    resolve({ verdict: 'time_limit_exceeded', output: '', error: 'Time Limit Exceeded' });
                } else if (outputLimitExceeded) {
                    resolve({ verdict: 'output_limit_exceeded', output: '', error: 'Output Limit Exceeded' });
                } else if (code !== 0 && code !== null) {
                    resolve({ verdict: 'runtime_error', output: stdout, error: stderr || `Exit code ${code}` });
                } else {
                    resolve({ verdict: 'accepted', output: stdout, error: '' });
                }
            });

            try {
                child.stdin.write(input + '\n');
                child.stdin.end();
            } catch (e) {
                // Ignore stdin pipe break if process died immediately
            }
        });
    }

    async execute(code, testCases, isSubmit = false, timeLimit = 2000) {
        const reqId = Math.random().toString(36).substring(7);
        const sourcePath = path.join(this.scratchDir, `${reqId}.cpp`);
        const binaryPath = path.join(this.scratchDir, `${reqId}.exe`);

        // 1. Write source file
        fs.writeFileSync(sourcePath, code);

        // 2. Compile securely using spawn
        const compileResult = await this.compileCode(sourcePath, binaryPath);
        if (compileResult.code !== 0) {
            try { fs.unlinkSync(sourcePath); } catch (e) {}
            return {
                verdict: 'compilation_error',
                score: 0,
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                errorMessage: `Compilation Error:\n${compileResult.error}`,
                executionTime: 0,
                memoryUsed: 0
            };
        }

        let testCasesPassed = 0;
        let maxExecutionTime = 0;
        let finalVerdict = 'accepted';
        let errorMessage = '';
        let actualOutput = null;
        let expectedOutput = null;
        let failedInput = null;

        // 3. Execute test cases
        for (let idx = 0; idx < testCases.length; idx++) {
            const tc = testCases[idx];
            const serializedInput = inputSerializer.serialize(tc.input);

            const startTime = process.hrtime();
            const runResult = await this.runBinary(binaryPath, serializedInput, timeLimit);
            const diff = process.hrtime(startTime);
            const elapsedMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
            maxExecutionTime = Math.max(maxExecutionTime, elapsedMs);

            if (runResult.verdict !== 'accepted') {
                if (finalVerdict === 'accepted') {
                    finalVerdict = runResult.verdict;
                    errorMessage = runResult.error;
                    failedInput = tc.input;
                }
            } else {
                const passed = comparer.compare(runResult.output, tc.expectedOutput, tc.comparisonMode || 'exact');
                if (passed) {
                    testCasesPassed++;
                } else {
                    if (finalVerdict === 'accepted') {
                        finalVerdict = 'wrong_answer';
                        errorMessage = `Wrong Answer: Expected '${tc.expectedOutput}', but got '${runResult.output.trim()}'`;
                        actualOutput = runResult.output.trim();
                        expectedOutput = tc.expectedOutput;
                        failedInput = tc.input;
                    }
                }
            }

            if (isSubmit && finalVerdict !== 'accepted') {
                break;
            }
        }

        // 4. Clean up temp binaries
        try { fs.unlinkSync(sourcePath); } catch (e) {}
        try { fs.unlinkSync(binaryPath); } catch (e) {}

        const memoryUsed = Math.floor(Math.random() * 800) + 1600; // Mock memory footprint

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

module.exports = new CppExecutor();
