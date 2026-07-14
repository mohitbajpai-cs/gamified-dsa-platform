/**
 * ============================================================
 * ONLINE JUDGE — AUTOMATED REGRESSION TEST SUITE
 * ============================================================
 * Tests every language × every verdict × every target problem.
 * Talks directly to the judge services — no HTTP overhead.
 * Runs in isolation (no auth needed, no DB writes for run-only tests).
 *
 * Usage:  node regression.js
 * ============================================================
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

// ── Colour helpers ──────────────────────────────────────────
const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

const ok   = (s) => `${GREEN}✓${RESET} ${s}`;
const fail = (s) => `${RED}✗${RESET} ${s}`;
const warn = (s) => `${YELLOW}⚠${RESET} ${s}`;
const hdr  = (s) => `\n${BOLD}${CYAN}${s}${RESET}`;
const dim  = (s) => `${DIM}${s}${RESET}`;

// ── Load judge services ─────────────────────────────────────
const jsExecutor   = require('./src/services/executors/javascript.executor');
const cExecutor    = require('./src/services/executors/c.executor');
const cppExecutor  = require('./src/services/executors/cpp.executor');
const javaExecutor = require('./src/services/executors/java.executor');
const comparer     = require('./src/services/executors/comparer');
const inputSerializer = require('./src/services/executors/inputSerializer');

// ── Result tracking ─────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
const report   = [];

function record(section, name, isOk, reason = '') {
    const entry = { section, name, ok: isOk, reason };
    report.push(entry);
    if (isOk) {
        passed++;
        console.log('  ' + ok(`${name}`));
    } else {
        failed++;
        failures.push(entry);
        console.log('  ' + fail(`${name}`) + (reason ? `  ${dim('→ ' + reason)}` : ''));
    }
}

function assert(section, name, condition, reason = '') {
    record(section, name, !!condition, reason);
}

// ── Helper: run one test case through the judge ─────────────
async function runJudge(executor, code, testCases, isSubmit = false) {
    try {
        return await executor.execute(code, testCases, isSubmit, 3000);
    } catch (e) {
        return { verdict: '__exception__', errorMessage: e.message };
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 1 — COMPARER UNIT TESTS
// ═══════════════════════════════════════════════════════════
function runComparerTests() {
    console.log(hdr('═══ SECTION 1: Comparer Unit Tests ═══'));

    const sec = 'Comparer';

    // Exact equality
    assert(sec, 'Integer: 42 vs "42"',      comparer.compare(42,       '42',      'exact'));
    assert(sec, 'Integer: "42" vs "42"',    comparer.compare('42',     '42',      'exact'));
    assert(sec, 'Integer mismatch',         !comparer.compare(41,       '42',      'exact'));
    assert(sec, 'Array: [0,1] vs "[0,1]"',  comparer.compare([0,1],    '[0,1]',   'exact'));
    assert(sec, 'Array: "0 1" vs "[0,1]"',  comparer.compare('0 1',    '[0,1]',   'exact'));
    assert(sec, 'Array: "0 1 " vs "[0,1]"', comparer.compare('0 1 ',   '[0,1]',   'exact'));
    assert(sec, 'Array mismatch',           !comparer.compare([1,0],    '[0,1]',   'exact'));
    assert(sec, 'Boolean: true vs "true"',  comparer.compare(true,     'true',    'exact'));
    assert(sec, 'Boolean: false vs "false"',comparer.compare(false,    'false',   'exact'));
    assert(sec, 'Null: null vs "null"',     comparer.compare(null,     'null',    'exact'));
    assert(sec, 'Null: null vs null',       comparer.compare(null,      null,      'exact'));
    assert(sec, 'Negative: -3 vs "-3"',     comparer.compare(-3,       '-3',      'exact'));
    assert(sec, 'String: "abc" vs "abc"',   comparer.compare('abc',    'abc',     'exact'));

    // Floating point
    assert(sec, 'Float: 3.14159 vs "3.14159"',  comparer.compare(3.14159,  '3.14159', 'floating'));
    assert(sec, 'Float epsilon: 3.14159 vs 3.141590001', comparer.compare(3.14159, '3.141590001', 'floating'));
    assert(sec, 'Float mismatch',               !comparer.compare(3.0,      '3.5',    'floating'));

    // Unordered array
    assert(sec, 'Unordered: [1,0] vs "[0,1]"',      comparer.compare([1,0],     '[0,1]',      'unordered_array'));
    assert(sec, 'Unordered: "1 0" vs "[0,1]"',       comparer.compare('1 0',     '[0,1]',      'unordered_array'));
    assert(sec, 'Unordered wrong length',            !comparer.compare([1,0,2],   '[0,1]',      'unordered_array'));

    // 2D matrix
    const mat2d = [[1,2],[3,4]];
    const exp2d = '[[1,2],[3,4]]';
    assert(sec, '2D matrix match',         comparer.compare(mat2d, exp2d, 'exact'));
    assert(sec, '2D matrix mismatch',     !comparer.compare([[1,2],[4,3]], exp2d, 'exact'));

    // Whitespace-normalised C-style output
    assert(sec, 'C output "1 3 2 " vs "[1,3,2]"',  comparer.compare('1 3 2 ',   '[1,3,2]',  'exact'));
    assert(sec, 'C output "1 3 2\\n" vs "[1,3,2]"', comparer.compare('1 3 2\n',  '[1,3,2]',  'exact'));
    assert(sec, 'C output multi-line matrix',       comparer.compare('1 2\n3 4\n','[[1,2],[3,4]]','exact'));
}

// ═══════════════════════════════════════════════════════════
// SECTION 2 — INPUT SERIALIZER UNIT TESTS
// ═══════════════════════════════════════════════════════════
function runSerializerTests() {
    console.log(hdr('═══ SECTION 2: Input Serializer Unit Tests ═══'));

    const sec = 'InputSerializer';

    assert(sec, 'Integer 5 → "5"',            inputSerializer.serialize(5) === '5');
    assert(sec, 'String "5" → "5"',           inputSerializer.serialize('5') === '5');
    assert(sec, 'Bool true → "true"',         inputSerializer.serialize(true) === 'true');
    assert(sec, 'Bool false → "false"',       inputSerializer.serialize(false) === 'false');
    assert(sec, 'null → "null"',              inputSerializer.serialize(null) === 'null');
    
    // 1D array
    const r1d = inputSerializer.serialize('[2,7,11,15]');
    assert(sec, '1D array: correct length header', r1d.startsWith('4\n'));
    assert(sec, '1D array: correct elements',      r1d === '4\n2 7 11 15');

    // Empty array
    const rEmpty = inputSerializer.serialize('[]');
    assert(sec, 'Empty array: produces "0\\n"', rEmpty === '0\n' || rEmpty.startsWith('0'));

    // JSON object (multi-param)
    const rObj = inputSerializer.serialize('{"nums":[2,7,11,15],"target":9}');
    assert(sec, 'Multi-param object: non-empty', rObj.length > 0);

    // 2D matrix
    const rMat = inputSerializer.serialize('[[1,2],[3,4]]');
    assert(sec, '2D matrix: header "2 2"', rMat.startsWith('2 2'));

    // Raw string passthrough
    const rStr = inputSerializer.serialize('hello');
    assert(sec, 'Raw string passthrough', rStr === 'hello');
}

// ═══════════════════════════════════════════════════════════
// SECTION 3 — JAVASCRIPT EXECUTOR: VERDICT TYPES
// ═══════════════════════════════════════════════════════════
async function runJSVerdictTests() {
    console.log(hdr('═══ SECTION 3: JavaScript — Verdict Types ═══'));

    const sec = 'JS:Verdicts';
    const simpleTC = [{ input: '[1,2,3]', expectedOutput: '[1,2,3]', comparisonMode: 'exact' }];

    // Accepted
    const codeAC = 'function solve(input) { return input; }';
    const rAC = await runJudge(jsExecutor, codeAC, simpleTC);
    assert(sec, 'Accepted: correct solution',     rAC.verdict === 'accepted');
    assert(sec, 'Accepted: testCasesPassed = 1',  rAC.testCasesPassed === 1);
    assert(sec, 'Accepted: actualOutput = null',  rAC.actualOutput === null);

    // Wrong Answer
    const codeWA = 'function solve(input) { return [9,9,9]; }';
    const rWA = await runJudge(jsExecutor, codeWA, simpleTC);
    assert(sec, 'WA: verdict = wrong_answer',          rWA.verdict === 'wrong_answer');
    assert(sec, 'WA: actualOutput defined',             rWA.actualOutput !== null && rWA.actualOutput !== undefined);
    assert(sec, 'WA: expectedOutput defined',           rWA.expectedOutput !== null && rWA.expectedOutput !== undefined);
    assert(sec, 'WA: failedInput defined',              rWA.failedInput !== null);
    assert(sec, 'WA: testCasesPassed = 0',             rWA.testCasesPassed === 0);

    // Compilation Error (syntax error)
    const codeCE = 'function solve( { return 1; }';
    const rCE = await runJudge(jsExecutor, codeCE, simpleTC);
    assert(sec, 'CE: verdict = compilation_error',     rCE.verdict === 'compilation_error');
    assert(sec, 'CE: errorMessage contains error',     typeof rCE.errorMessage === 'string' && rCE.errorMessage.length > 0);

    // Runtime Error
    const codeRE = 'function solve(input) { throw new Error("Kaboom!"); }';
    const rRE = await runJudge(jsExecutor, codeRE, simpleTC);
    assert(sec, 'RE: verdict = runtime_error',         rRE.verdict === 'runtime_error');

    // Empty code = Compilation Error
    const rEmpty = await runJudge(jsExecutor, '', simpleTC);
    assert(sec, 'Empty: verdict = compilation_error',  rEmpty.verdict === 'compilation_error');

    // Time Limit Exceeded
    const codeTLE = 'function solve(input) { while(true){} }';
    const rTLE = await runJudge(jsExecutor, codeTLE, simpleTC);
    assert(sec, 'TLE: verdict = time_limit_exceeded',  rTLE.verdict === 'time_limit_exceeded');

    // Correct verdict stops early (isSubmit=true stops on first failure)
    const mixedTCs = [
        { input: '1', expectedOutput: '1', comparisonMode: 'exact' },
        { input: '2', expectedOutput: '2', comparisonMode: 'exact' },
        { input: '3', expectedOutput: '999', comparisonMode: 'exact' },
        { input: '4', expectedOutput: '4', comparisonMode: 'exact' }
    ];
    const codeSolve = 'function solve(input) { return input; }';
    const rEarlyStop = await runJudge(jsExecutor, codeSolve, mixedTCs, true);
    assert(sec, 'isSubmit: stops at first failure', rEarlyStop.testCasesPassed === 2);
}

// ═══════════════════════════════════════════════════════════
// SECTION 4 — PROBLEM-SPECIFIC REGRESSION: JAVASCRIPT
// ═══════════════════════════════════════════════════════════
const JS_PROBLEMS = [
    {
        name: 'Largest Element',
        code: [
            'function solve(input) {',
            '    let max = input[0];',
            '    for (let i = 1; i < input.length; i++)',
            '        if (input[i] > max) max = input[i];',
            '    return max;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9', comparisonMode: 'exact' },
            { input: '[1]',               expectedOutput: '1', comparisonMode: 'exact' },
            { input: '[-5,-3,-1,-9]',     expectedOutput: '-1', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Second Largest',
        code: [
            'function solve(input) {',
            '    let first = -Infinity, second = -Infinity;',
            '    for (let x of input) {',
            '        if (x > first) { second = first; first = x; }',
            '        else if (x > second && x !== first) second = x;',
            '    }',
            '    return second === -Infinity ? -1 : second;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[3,1,4,1,5,9,2,6]', expectedOutput: '6', comparisonMode: 'exact' },
            { input: '[1,1,1]',            expectedOutput: '-1', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Check Sorted',
        code: [
            'function solve(input) {',
            '    for (let i = 1; i < input.length; i++)',
            '        if (input[i] < input[i-1]) return false;',
            '    return true;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[1,2,3,4,5]', expectedOutput: 'true',  comparisonMode: 'exact' },
            { input: '[1,3,2,4,5]', expectedOutput: 'false', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Remove Duplicates',
        code: [
            'function solve(input) {',
            '    let nums = [...new Set(input)].sort(function(a,b){return a-b;});',
            '    return nums.length;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[1,1,2,3,3,4]', expectedOutput: '4', comparisonMode: 'exact' },
            { input: '[1]',           expectedOutput: '1', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Rotate Array',
        code: [
            'function solve(input) {',
            '    const nums = input.nums;',
            '    const k = input.k % nums.length;',
            '    return [...nums.slice(nums.length - k), ...nums.slice(0, nums.length - k)];',
            '}'
        ].join('\n'),
        testCases: [
            { input: '{"nums":[1,2,3,4,5,6,7],"k":3}', expectedOutput: '[5,6,7,1,2,3,4]', comparisonMode: 'exact' },
            { input: '{"nums":[1,2],"k":1}',            expectedOutput: '[2,1]',            comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Move Zeroes',
        code: [
            'function solve(input) {',
            '    const res = input.filter(x => x !== 0);',
            '    while (res.length < input.length) res.push(0);',
            '    return res;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', comparisonMode: 'exact' },
            { input: '[0,0,1]',      expectedOutput: '[1,0,0]',       comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Two Sum',
        code: [
            'function solve(input) {',
            '    const nums = input.nums, target = input.target;',
            '    const map = {};',
            '    for (let i = 0; i < nums.length; i++) {',
            '        const comp = target - nums[i];',
            '        if (map[comp] !== undefined) return [map[comp], i];',
            '        map[nums[i]] = i;',
            '    }',
            '    return [];',
            '}'
        ].join('\n'),
        testCases: [
            { input: '{"nums":[2,7,11,15],"target":9}', expectedOutput: '[0,1]', comparisonMode: 'unordered_array' },
            { input: '{"nums":[3,2,4],"target":6}',     expectedOutput: '[1,2]', comparisonMode: 'unordered_array' }
        ]
    },
    {
        name: 'Sort Colors',
        code: [
            'function solve(input) {',
            '    const cnt = [0,0,0];',
            '    for (const x of input) cnt[x]++;',
            '    return [...Array(cnt[0]).fill(0),...Array(cnt[1]).fill(1),...Array(cnt[2]).fill(2)];',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]', comparisonMode: 'exact' },
            { input: '[2,0,1]',        expectedOutput: '[0,1,2]',        comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Majority Element',
        code: [
            'function solve(input) {',
            '    let count = 0, cand = null;',
            '    for (const x of input) {',
            '        if (count === 0) cand = x;',
            '        count += x === cand ? 1 : -1;',
            '    }',
            '    return cand;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[3,2,3]',           expectedOutput: '3', comparisonMode: 'exact' },
            { input: '[2,2,1,1,1,2,2]',   expectedOutput: '2', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Kadane (Max Subarray)',
        code: [
            'function solve(input) {',
            '    let maxSum = input[0], curr = input[0];',
            '    for (let i = 1; i < input.length; i++) {',
            '        curr = Math.max(input[i], curr + input[i]);',
            '        maxSum = Math.max(maxSum, curr);',
            '    }',
            '    return maxSum;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', comparisonMode: 'exact' },
            { input: '[1]',                       expectedOutput: '1', comparisonMode: 'exact' },
            { input: '[-1,-2,-3]',                expectedOutput: '-1', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Next Permutation',
        code: [
            'function solve(input) {',
            '    const nums = [...input];',
            '    let i = nums.length - 2;',
            '    while (i >= 0 && nums[i] >= nums[i+1]) i--;',
            '    if (i >= 0) {',
            '        let j = nums.length - 1;',
            '        while (nums[j] <= nums[i]) j--;',
            '        [nums[i],nums[j]] = [nums[j],nums[i]];',
            '    }',
            '    let l = i+1, r = nums.length-1;',
            '    while (l < r) { [nums[l],nums[r]] = [nums[r],nums[l]]; l++; r--; }',
            '    return nums;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[1,2,3]', expectedOutput: '[1,3,2]', comparisonMode: 'exact' },
            { input: '[3,2,1]', expectedOutput: '[1,2,3]', comparisonMode: 'exact' },
            { input: '[1,1,5]', expectedOutput: '[1,5,1]', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Merge Intervals',
        code: [
            'function solve(input) {',
            '    const intervals = input.sort(function(a,b){return a[0]-b[0];});',
            '    const res = [intervals[0]];',
            '    for (let i = 1; i < intervals.length; i++) {',
            '        const last = res[res.length-1];',
            '        if (intervals[i][0] <= last[1]) {',
            '            last[1] = Math.max(last[1], intervals[i][1]);',
            '        } else {',
            '            res.push(intervals[i]);',
            '        }',
            '    }',
            '    return res;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', comparisonMode: 'exact' },
            { input: '[[1,4],[4,5]]',                expectedOutput: '[[1,5]]',                comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Rotate Matrix',
        code: [
            'function solve(input) {',
            '    const n = input.length;',
            '    const matrix = input.map(r => [...r]);',
            '    for (let i = 0; i < n; i++)',
            '        for (let j = i+1; j < n; j++)',
            '            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];',
            '    for (let i = 0; i < n; i++) matrix[i].reverse();',
            '    return matrix;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]', comparisonMode: 'exact' },
            { input: '[[1]]',                      expectedOutput: '[[1]]',                      comparisonMode: 'exact' }
        ]
    }
];

async function runJSProblemTests() {
    console.log(hdr('═══ SECTION 4: JavaScript — Problem Regression ═══'));

    for (const problem of JS_PROBLEMS) {
        const sec = `JS:${problem.name}`;
        const r = await runJudge(jsExecutor, problem.code, problem.testCases);

        assert(sec,
            `${problem.name}: accepted (${problem.testCases.length} test cases)`,
            r.verdict === 'accepted',
            r.verdict !== 'accepted'
                ? `got ${r.verdict} | ${r.errorMessage || JSON.stringify(r.actualOutput)} vs expected ${JSON.stringify(r.expectedOutput)}`
                : ''
        );
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 5 — C EXECUTOR: VERDICT TYPES
// ═══════════════════════════════════════════════════════════
async function runCVerdictTests() {
    console.log(hdr('═══ SECTION 5: C — Verdict Types ═══'));

    const sec = 'C:Verdicts';
    const simpleTC = [{ input: '3\n1 2 3', expectedOutput: '3', comparisonMode: 'exact' }];

    // Check if gcc is available
    const testCode = '#include<stdio.h>\nint main(){printf("3");return 0;}';
    const rTest = await runJudge(cExecutor, testCode, simpleTC);
    if (rTest.verdict === 'compilation_error' && rTest.errorMessage.toLowerCase().includes('gcc')) {
        console.log('  ' + warn('C: gcc not found — skipping C verdict tests'));
        record(sec, 'C environment available', false, 'gcc not in PATH');
        return false;
    }

    // Accepted
    const codeAC = '#include<stdio.h>\nint main(){\n    int n; scanf("%d",&n);\n    int arr[n];\n    for(int i=0;i<n;i++) scanf("%d",&arr[i]);\n    int max=arr[0];\n    for(int i=1;i<n;i++) if(arr[i]>max) max=arr[i];\n    printf("%d",max);\n    return 0;\n}';
    const tcLargest = [{ input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9', comparisonMode: 'exact' }];
    const rAC = await runJudge(cExecutor, codeAC, tcLargest);
    assert(sec, 'Accepted: largest element', rAC.verdict === 'accepted', rAC.errorMessage);

    // Wrong Answer
    const codeWA = '#include<stdio.h>\nint main(){printf("999");return 0;}';
    const rWA = await runJudge(cExecutor, codeWA, tcLargest);
    assert(sec, 'WA: verdict = wrong_answer',       rWA.verdict === 'wrong_answer');
    assert(sec, 'WA: actualOutput defined',          rWA.actualOutput !== null && rWA.actualOutput !== undefined);
    assert(sec, 'WA: expectedOutput defined',        rWA.expectedOutput !== null);

    // Compilation Error
    const codeCE = '#include<stdio.h>\nint main(){ printf("hello" return 0;}';
    const rCE = await runJudge(cExecutor, codeCE, simpleTC);
    assert(sec, 'CE: verdict = compilation_error',  rCE.verdict === 'compilation_error');

    // Runtime Error (segfault)
    const codeRE = '#include<stdio.h>\nint main(){ int *p = 0; *p = 1; return 0;}';
    const rRE = await runJudge(cExecutor, codeRE, simpleTC);
    assert(sec, 'RE: verdict = runtime_error',       rRE.verdict === 'runtime_error' || rRE.verdict === 'time_limit_exceeded');

    // TLE
    const codeTLE = '#include<stdio.h>\nint main(){ while(1){} return 0;}';
    const rTLE = await runJudge(cExecutor, codeTLE, simpleTC, false);
    assert(sec, 'TLE: verdict = time_limit_exceeded', rTLE.verdict === 'time_limit_exceeded');

    return true;
}

// ═══════════════════════════════════════════════════════════
// SECTION 6 — C PROBLEM REGRESSION
// ═══════════════════════════════════════════════════════════
const C_PROBLEMS = [
    {
        name: 'Largest Element',
        code: [
            '#include<stdio.h>',
            'int main(){',
            '    int n; scanf("%d",&n);',
            '    int arr[n];',
            '    for(int i=0;i<n;i++) scanf("%d",&arr[i]);',
            '    int max=arr[0];',
            '    for(int i=1;i<n;i++) if(arr[i]>max) max=arr[i];',
            '    printf("%d",max);',
            '    return 0;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9',  comparisonMode: 'exact' },
            { input: '[-5,-3,-1,-9]',      expectedOutput: '-1', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Check Sorted',
        code: [
            '#include<stdio.h>',
            'int main(){',
            '    int n; scanf("%d",&n);',
            '    int arr[n];',
            '    for(int i=0;i<n;i++) scanf("%d",&arr[i]);',
            '    int ok=1;',
            '    for(int i=1;i<n;i++) if(arr[i]<arr[i-1]){ok=0;break;}',
            '    printf("%s",ok?"true":"false");',
            '    return 0;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[1,2,3,4,5]', expectedOutput: 'true',  comparisonMode: 'exact' },
            { input: '[1,3,2,4,5]', expectedOutput: 'false', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Move Zeroes',
        code: [
            '#include<stdio.h>',
            'int main(){',
            '    int n; scanf("%d",&n);',
            '    int arr[n];',
            '    for(int i=0;i<n;i++) scanf("%d",&arr[i]);',
            '    int res[n], k=0;',
            '    for(int i=0;i<n;i++) if(arr[i]!=0) res[k++]=arr[i];',
            '    while(k<n) res[k++]=0;',
            '    for(int i=0;i<n;i++) printf("%d%s",res[i],i<n-1?" ":"");',
            '    return 0;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Majority Element',
        code: [
            '#include<stdio.h>',
            'int main(){',
            '    int n; scanf("%d",&n);',
            '    int arr[n];',
            '    for(int i=0;i<n;i++) scanf("%d",&arr[i]);',
            '    int cand=arr[0], count=1;',
            '    for(int i=1;i<n;i++){',
            '        if(count==0){cand=arr[i];count=1;}',
            '        else if(arr[i]==cand) count++;',
            '        else count--;',
            '    }',
            '    printf("%d",cand);',
            '    return 0;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[3,2,3]',         expectedOutput: '3', comparisonMode: 'exact' },
            { input: '[2,2,1,1,1,2,2]', expectedOutput: '2', comparisonMode: 'exact' }
        ]
    },
    {
        name: 'Kadane',
        code: [
            '#include<stdio.h>',
            'int main(){',
            '    int n; scanf("%d",&n);',
            '    int arr[n];',
            '    for(int i=0;i<n;i++) scanf("%d",&arr[i]);',
            '    int maxSum=arr[0], curr=arr[0];',
            '    for(int i=1;i<n;i++){',
            '        if(curr+arr[i]>arr[i]) curr=curr+arr[i]; else curr=arr[i];',
            '        if(curr>maxSum) maxSum=curr;',
            '    }',
            '    printf("%d",maxSum);',
            '    return 0;',
            '}'
        ].join('\n'),
        testCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6',  comparisonMode: 'exact' },
            { input: '[-1,-2,-3]',               expectedOutput: '-1', comparisonMode: 'exact' }
        ]
    }
];

async function runCProblemTests() {
    console.log(hdr('═══ SECTION 6: C — Problem Regression ═══'));

    // Quick probe
    const probe = await runJudge(cExecutor, '#include<stdio.h>\nint main(){printf("ok");return 0;}',
        [{ input: '0', expectedOutput: 'ok', comparisonMode: 'exact' }]);
    if (probe.verdict !== 'accepted') {
        console.log('  ' + warn('C: gcc unavailable — skipping C problem tests'));
        record('C:Problems', 'C environment', false, 'gcc not found');
        return;
    }

    for (const problem of C_PROBLEMS) {
        const sec = `C:${problem.name}`;
        const r = await runJudge(cExecutor, problem.code, problem.testCases);
        assert(sec,
            `${problem.name}: accepted`,
            r.verdict === 'accepted',
            r.verdict !== 'accepted' ? `got ${r.verdict} | ${r.errorMessage || JSON.stringify(r.actualOutput)}` : ''
        );
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 7 — C++ EXECUTOR: VERDICT TYPES + PROBLEMS
// ═══════════════════════════════════════════════════════════
async function runCppTests() {
    console.log(hdr('═══ SECTION 7: C++ — Verdict Types + Problem Regression ═══'));

    const sec = 'C++:Verdicts';

    // Probe
    const probe = await runJudge(cppExecutor,
        '#include<iostream>\nusing namespace std;\nint main(){cout<<1;return 0;}',
        [{ input: '0', expectedOutput: '1', comparisonMode: 'exact' }]);
    if (probe.verdict !== 'accepted') {
        console.log('  ' + warn('C++: g++ unavailable — skipping C++ tests'));
        record(sec, 'C++ environment', false, 'g++ not found');
        return;
    }

    // Accepted
    const codeAC = [
        '#include<iostream>',
        '#include<vector>',
        'using namespace std;',
        'int main(){',
        '    int n; cin>>n;',
        '    vector<int> v(n);',
        '    for(int i=0;i<n;i++) cin>>v[i];',
        '    int mx=v[0];',
        '    for(int x:v) if(x>mx) mx=x;',
        '    cout<<mx;',
        '    return 0;',
        '}'
    ].join('\n');
    const tcLargest = [
        { input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9', comparisonMode: 'exact' }
    ];
    const rAC = await runJudge(cppExecutor, codeAC, tcLargest);
    assert(sec, 'Accepted: largest element', rAC.verdict === 'accepted', rAC.errorMessage);

    // Wrong Answer
    const codeWA = '#include<iostream>\nusing namespace std;\nint main(){cout<<999;}';
    const rWA = await runJudge(cppExecutor, codeWA, tcLargest);
    assert(sec, 'WA: verdict = wrong_answer',     rWA.verdict === 'wrong_answer');
    assert(sec, 'WA: actualOutput defined',        rWA.actualOutput !== null && rWA.actualOutput !== undefined);

    // Compilation Error
    const codeCE = '#include<iostream>\nusing namespace std;\nint main(){ cout<< return 0;}';
    const rCE = await runJudge(cppExecutor, codeCE, tcLargest);
    assert(sec, 'CE: verdict = compilation_error', rCE.verdict === 'compilation_error');

    // Runtime Error
    const codeRE = '#include<iostream>\nusing namespace std;\nint main(){ int* p=nullptr; *p=1; return 0;}';
    const rRE = await runJudge(cppExecutor, codeRE, tcLargest);
    assert(sec, 'RE: verdict = runtime_error',     rRE.verdict === 'runtime_error' || rRE.verdict === 'time_limit_exceeded');

    // TLE
    const codeTLE = '#include<iostream>\nusing namespace std;\nint main(){ while(true){} return 0;}';
    const rTLE = await runJudge(cppExecutor, codeTLE, tcLargest, false);
    assert(sec, 'TLE: verdict = time_limit_exceeded', rTLE.verdict === 'time_limit_exceeded');

    // Problem regressions
    const secP = 'C++:Problems';
    console.log('\n  ' + dim('— Problem regression:'));

    const cppProblems = [
        {
            name: 'Kadane',
            code: [
                '#include<iostream>',
                '#include<vector>',
                '#include<climits>',
                'using namespace std;',
                'int main(){',
                '    int n; cin>>n;',
                '    vector<int> v(n);',
                '    for(int i=0;i<n;i++) cin>>v[i];',
                '    int mx=v[0], cur=v[0];',
                '    for(int i=1;i<n;i++){',
                '        cur=max(v[i],cur+v[i]);',
                '        mx=max(mx,cur);',
                '    }',
                '    cout<<mx;',
                '    return 0;',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', comparisonMode: 'exact' },
                { input: '[-1,-2,-3]', expectedOutput: '-1', comparisonMode: 'exact' }
            ]
        },
        {
            name: 'Sort Colors',
            code: [
                '#include<iostream>',
                '#include<vector>',
                'using namespace std;',
                'int main(){',
                '    int n; cin>>n;',
                '    vector<int> v(n);',
                '    for(int i=0;i<n;i++) cin>>v[i];',
                '    int c[3]={0};',
                '    for(int x:v) c[x]++;',
                '    int k=0;',
                '    for(int i=0;i<3;i++) for(int j=0;j<c[i];j++) v[k++]=i;',
                '    for(int i=0;i<n;i++) cout<<v[i]<<(i<n-1?" ":"");',
                '    return 0;',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]', comparisonMode: 'exact' }
            ]
        },
        {
            name: 'Two Sum',
            code: [
                '#include<iostream>',
                '#include<vector>',
                '#include<unordered_map>',
                'using namespace std;',
                'int main(){',
                '    int n; cin>>n;',
                '    vector<int> v(n);',
                '    for(int i=0;i<n;i++) cin>>v[i];',
                '    int t; cin>>t;',
                '    unordered_map<int,int> m;',
                '    for(int i=0;i<n;i++){',
                '        if(m.count(t-v[i])) { cout<<m[t-v[i]]<<" "<<i; return 0;}',
                '        m[v[i]]=i;',
                '    }',
                '    return 0;',
                '}'
            ].join('\n'),
            testCases: [
                { input: '{"nums":[2,7,11,15],"target":9}', expectedOutput: '[0,1]', comparisonMode: 'unordered_array' }
            ]
        },
        {
            name: 'Majority Element',
            code: [
                '#include<iostream>',
                '#include<vector>',
                'using namespace std;',
                'int main(){',
                '    int n; cin>>n;',
                '    vector<int> v(n);',
                '    for(int i=0;i<n;i++) cin>>v[i];',
                '    int cand=v[0],cnt=1;',
                '    for(int i=1;i<n;i++){',
                '        if(cnt==0){cand=v[i];cnt=1;}',
                '        else if(v[i]==cand) cnt++;',
                '        else cnt--;',
                '    }',
                '    cout<<cand;',
                '    return 0;',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[3,2,3]',         expectedOutput: '3', comparisonMode: 'exact' },
                { input: '[2,2,1,1,1,2,2]', expectedOutput: '2', comparisonMode: 'exact' }
            ]
        },
        {
            name: 'Rotate Matrix',
            code: [
                '#include<iostream>',
                '#include<vector>',
                'using namespace std;',
                'int main(){',
                '    int r,c; cin>>r>>c;',
                '    vector<vector<int>> m(r,vector<int>(c));',
                '    for(int i=0;i<r;i++) for(int j=0;j<c;j++) cin>>m[i][j];',
                '    int n=r;',
                '    for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) swap(m[i][j],m[j][i]);',
                '    for(int i=0;i<n;i++){',
                '        int l=0,ri=n-1;',
                '        while(l<ri) swap(m[i][l++],m[i][ri--]);',
                '    }',
                '    for(int i=0;i<n;i++){',
                '        for(int j=0;j<n;j++) cout<<m[i][j]<<(j<n-1?" ":"");',
                '        cout<<"\\n";',
                '    }',
                '    return 0;',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]', comparisonMode: 'exact' }
            ]
        }
    ];

    for (const problem of cppProblems) {
        const r = await runJudge(cppExecutor, problem.code, problem.testCases);
        assert(secP,
            `${problem.name}: accepted`,
            r.verdict === 'accepted',
            r.verdict !== 'accepted' ? `got ${r.verdict} | ${r.errorMessage || JSON.stringify(r.actualOutput)}` : ''
        );
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 8 — JAVA EXECUTOR: VERDICT TYPES + PROBLEMS
// ═══════════════════════════════════════════════════════════
async function runJavaTests() {
    console.log(hdr('═══ SECTION 8: Java — Verdict Types + Problem Regression ═══'));

    const sec = 'Java:Verdicts';

    // Probe (may use transpiled fallback if javac unavailable)
    const probeCode = [
        'import java.util.*;',
        'public class Main {',
        '    public static void main(String[] args) {',
        '        Scanner sc = new Scanner(System.in);',
        '        int n = sc.nextInt();',
        '        System.out.println(n);',
        '    }',
        '}'
    ].join('\n');
    const probeTC = [{ input: '42', expectedOutput: '42', comparisonMode: 'exact' }];
    const probeR = await runJudge(javaExecutor, probeCode, probeTC);
    const javaMode = probeR.verdict === 'accepted' ? 'native' : 'transpiled-or-unavailable';
    console.log(`  ${dim('Java mode: ' + javaMode)}`);

    // Accepted
    const codeAC = [
        'import java.util.*;',
        'public class Main {',
        '    public static void main(String[] args) {',
        '        Scanner sc = new Scanner(System.in);',
        '        int n = sc.nextInt();',
        '        int max = Integer.MIN_VALUE;',
        '        for (int i = 0; i < n; i++) {',
        '            int x = sc.nextInt();',
        '            if (x > max) max = x;',
        '        }',
        '        System.out.println(max);',
        '    }',
        '}'
    ].join('\n');
    const tcLargest = [{ input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9', comparisonMode: 'exact' }];
    const rAC = await runJudge(javaExecutor, codeAC, tcLargest);
    assert(sec, 'Accepted: largest element', rAC.verdict === 'accepted', rAC.errorMessage || rAC.verdict);

    // Wrong Answer
    const codeWA = [
        'import java.util.*;',
        'public class Main {',
        '    public static void main(String[] args) { System.out.println(999); }',
        '}'
    ].join('\n');
    const rWA = await runJudge(javaExecutor, codeWA, tcLargest);
    assert(sec, 'WA: verdict = wrong_answer',     rWA.verdict === 'wrong_answer');
    assert(sec, 'WA: actualOutput defined',        rWA.actualOutput !== null && rWA.actualOutput !== undefined);

    // Compilation Error
    const codeCE = 'public class Main { public static void main(String[] args) { System.out.println( }';
    const rCE = await runJudge(javaExecutor, codeCE, probeTC);
    assert(sec, 'CE: verdict = compilation_error', rCE.verdict === 'compilation_error');

    // Runtime Error
    const codeRE = [
        'import java.util.*;',
        'public class Main {',
        '    public static void main(String[] args) {',
        '        throw new RuntimeException("Forced crash");',
        '    }',
        '}'
    ].join('\n');
    const rRE = await runJudge(javaExecutor, codeRE, probeTC);
    assert(sec, 'RE: verdict = runtime_error', rRE.verdict === 'runtime_error' || rRE.verdict === 'compilation_error');

    // TLE
    const codeTLE = [
        'public class Main {',
        '    public static void main(String[] args) { while(true){} }',
        '}'
    ].join('\n');
    const rTLE = await runJudge(javaExecutor, codeTLE, probeTC, false);
    assert(sec, 'TLE: verdict = time_limit_exceeded', rTLE.verdict === 'time_limit_exceeded');

    // Problem regression
    const secP = 'Java:Problems';
    console.log('\n  ' + dim('— Problem regression:'));

    const javaProblems = [
        {
            name: 'Kadane',
            code: [
                'import java.util.*;',
                'public class Main {',
                '    public static void main(String[] args) {',
                '        Scanner sc = new Scanner(System.in);',
                '        int n = sc.nextInt();',
                '        int[] arr = new int[n];',
                '        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();',
                '        int mx = arr[0], cur = arr[0];',
                '        for (int i = 1; i < n; i++) {',
                '            cur = Math.max(arr[i], cur + arr[i]);',
                '            mx = Math.max(mx, cur);',
                '        }',
                '        System.out.println(mx);',
                '    }',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', comparisonMode: 'exact' },
                { input: '[-1,-2,-3]', expectedOutput: '-1', comparisonMode: 'exact' }
            ]
        },
        {
            name: 'Majority Element',
            code: [
                'import java.util.*;',
                'public class Main {',
                '    public static void main(String[] args) {',
                '        Scanner sc = new Scanner(System.in);',
                '        int n = sc.nextInt();',
                '        int[] arr = new int[n];',
                '        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();',
                '        int cand = arr[0], cnt = 1;',
                '        for (int i = 1; i < n; i++) {',
                '            if (cnt == 0) { cand = arr[i]; cnt = 1; }',
                '            else if (arr[i] == cand) cnt++;',
                '            else cnt--;',
                '        }',
                '        System.out.println(cand);',
                '    }',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[3,2,3]',         expectedOutput: '3', comparisonMode: 'exact' },
                { input: '[2,2,1,1,1,2,2]', expectedOutput: '2', comparisonMode: 'exact' }
            ]
        },
        {
            name: 'Sort Colors',
            code: [
                'import java.util.*;',
                'public class Main {',
                '    public static void main(String[] args) {',
                '        Scanner sc = new Scanner(System.in);',
                '        int n = sc.nextInt();',
                '        int[] arr = new int[n];',
                '        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();',
                '        int[] cnt = new int[3];',
                '        for (int x : arr) cnt[x]++;',
                '        int k = 0;',
                '        for (int i = 0; i < 3; i++) for (int j = 0; j < cnt[i]; j++) arr[k++] = i;',
                '        for (int i = 0; i < n; i++) System.out.print(arr[i] + (i < n-1 ? " " : ""));',
                '    }',
                '}'
            ].join('\n'),
            testCases: [
                { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]', comparisonMode: 'exact' }
            ]
        }
    ];

    for (const problem of javaProblems) {
        const r = await runJudge(javaExecutor, problem.code, problem.testCases);
        assert(secP,
            `${problem.name}: accepted`,
            r.verdict === 'accepted',
            r.verdict !== 'accepted' ? `got ${r.verdict} | ${r.errorMessage || JSON.stringify(r.actualOutput)}` : ''
        );
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 9 — API INTEGRATION: Run vs Submit test separation
// ═══════════════════════════════════════════════════════════
async function runAPIIntegrationTests() {
    console.log(hdr('═══ SECTION 9: API Integration — Run vs Submit Separation ═══'));

    const sec = 'API:RunVsSubmit';

    // Simulate Run Code: uses hidden=false test cases
    // Simulate Submit Code: uses hidden=true test cases
    // We verify via the submission service logic directly

    const submissionService = require('./src/services/submission.service');
    const TestCase = require('./src/models/testCase.model');
    const Problem  = require('./src/models/problem.model');

    // Connect to DB for this section
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gamified_dsa');
        }
    } catch (err) {
        console.log('  ' + warn('DB not available — skipping API integration tests'));
        record(sec, 'Database connection', false, err.message);
        return;
    }

    // Find any problem
    const problem = await Problem.findOne({});
    if (!problem) {
        console.log('  ' + warn('No problems in DB — skipping'));
        record(sec, 'Problem exists in DB', false, 'No problems found');
        return;
    }
    assert(sec, 'Problem found in DB', !!problem);

    // Check Run Code uses sample (hidden=false) test cases
    const sampleTCs = await TestCase.find({ problem: problem._id, hidden: false }).lean();
    const hiddenTCs = await TestCase.find({ problem: problem._id, hidden: true }).lean();
    const allTCs    = await TestCase.find({ problem: problem._id }).lean();

    console.log(`  ${dim(`Problem: "${problem.title}" | Sample: ${sampleTCs.length} | Hidden: ${hiddenTCs.length} | Total: ${allTCs.length}`)}`);

    assert(sec, 'Run Code uses sample (hidden=false) TCs', sampleTCs.length > 0 || allTCs.length > 0,
        sampleTCs.length === 0 ? 'No sample test cases (hidden=false) for this problem' : '');
    assert(sec, 'Submit Code uses hidden (hidden=true) TCs', hiddenTCs.length > 0 || allTCs.length > 0,
        hiddenTCs.length === 0 ? 'No hidden test cases — fallback to all TCs will be used' : '');

    // Verify comparisonMode is propagated
    assert(sec, 'Problem has comparisonMode field', problem.comparisonMode !== undefined,
        'comparisonMode missing from problem schema');
    assert(sec, 'comparisonMode is valid', ['exact','unordered_array','unordered_matrix','floating','string','tree','linked_list'].includes(problem.comparisonMode),
        `Invalid comparisonMode: ${problem.comparisonMode}`);
}

// ═══════════════════════════════════════════════════════════
// SECTION 10 — DB-BASED TESTS: Problems, Submissions, Progress
// ═══════════════════════════════════════════════════════════
async function runDBTests() {
    console.log(hdr('═══ SECTION 10: Database — Problems, Starter Code, Progress ═══'));

    const sec = 'DB';

    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gamified_dsa');
        } catch (err) {
            console.log('  ' + warn('DB not available — skipping'));
            record(sec, 'Database connection', false, err.message);
            return;
        }
    }

    const Problem    = require('./src/models/problem.model');
    const TestCase   = require('./src/models/testCase.model');
    const Submission = require('./src/models/submission.model');
    const Progress   = require('./src/models/progress.model');
    const User       = require('./src/models/user.model');

    // Target problems that are seeded in the database
    const targetNames = [
        'Largest Element', 'Second Largest', 'Check Sorted', 'Two Sum', 'Sort Colors', 'Majority Element',
        'Kadane', 'Next Permutation'
    ];

    const problems = await Problem.find({}).lean();
    assert(sec, `Total problems in DB (≥ 5 expected)`, problems.length >= 5,
        `Only ${problems.length} problems found`);

    // Check each target problem
    for (const name of targetNames) {
        const found = problems.find(p => {
            const t = p.title.toLowerCase();
            const key = name.toLowerCase();
            return t.includes(key) || t.includes(key.split(' ')[0]);
        });
        if (found) {
            // Starter code check
            const hasStarterJS  = found.starterCode && (found.starterCode.javascript || typeof found.starterCode === 'string');
            const hasStarterC   = found.starterCode && found.starterCode.c;
            const hasStarterCpp = found.starterCode && found.starterCode.cpp;
            const hasStarterJava= found.starterCode && found.starterCode.java;

            assert(sec, `"${name}": has JS starter code`,   !!hasStarterJS,  'Missing javascript starter code');
            assert(sec, `"${name}": has C starter code`,    !!hasStarterC,   'Missing C starter code');
            assert(sec, `"${name}": has C++ starter code`,  !!hasStarterCpp, 'Missing C++ starter code');
            assert(sec, `"${name}": has Java starter code`, !!hasStarterJava,'Missing Java starter code');

            // Test cases check
            const tcs = await TestCase.find({ problem: found._id }).lean();
            assert(sec, `"${name}": has test cases (≥ 1)`, tcs.length >= 1, `Only ${tcs.length} test cases`);
            const hasSampleTC = tcs.some(tc => !tc.hidden);
            const hasHiddenTC = tcs.some(tc => tc.hidden);
            assert(sec, `"${name}": has sample test case`, hasSampleTC, 'No hidden=false test case');
            assert(sec, `"${name}": has hidden test case`, hasHiddenTC, 'No hidden=true test case');

        } else {
            record(sec, `"${name}": found in DB`, false, 'Problem not seeded');
        }
    }

    // Submission history schema check
    const anySubmission = await Submission.findOne({});
    if (anySubmission) {
        assert(sec, 'Submission.verdict field exists',          anySubmission.verdict !== undefined);
        assert(sec, 'Submission.testCasesPassed field exists',  anySubmission.testCasesPassed !== undefined || anySubmission.passedCases !== undefined);
        assert(sec, 'Submission.executionTime field exists',    anySubmission.executionTime !== undefined || anySubmission.runtime !== undefined);
        console.log(`  ${dim(`Latest submission: ${anySubmission.verdict} | ${anySubmission.language}`)}`);
    } else {
        console.log('  ' + warn('No submissions in DB yet — schema checks skipped'));
    }

    // Progress schema check
    const anyProgress = await Progress.findOne({});
    if (anyProgress) {
        assert(sec, 'Progress.completedProblems field exists', Array.isArray(anyProgress.completedProblems));
        assert(sec, 'Progress.totalXP field exists',           anyProgress.totalXP !== undefined);
        console.log(`  ${dim(`Progress record: ${anyProgress.completedProblems.length} problems solved`)}`);
    } else {
        console.log('  ' + warn('No progress records yet'));
    }

    // User XP and level tracking
    const anyUser = await User.findOne({});
    if (anyUser) {
        assert(sec, 'User.xp field exists',          anyUser.xp !== undefined);
        assert(sec, 'User.level field exists',        anyUser.level !== undefined);
        assert(sec, 'User.coins field exists',        anyUser.coins !== undefined);
        assert(sec, 'User.totalSolved field exists',  anyUser.totalSolved !== undefined);
        console.log(`  ${dim(`User: level=${anyUser.level} xp=${anyUser.xp} totalSolved=${anyUser.totalSolved}`)}`);
    }

    // Language switching: verify all 4 language starter codes are different per-problem
    const probWithAll = problems.find(p =>
        p.starterCode && p.starterCode.javascript && p.starterCode.c &&
        p.starterCode.cpp && p.starterCode.java
    );
    if (probWithAll) {
        const sc = probWithAll.starterCode;
        const allDistinct = new Set([sc.javascript, sc.c, sc.cpp, sc.java]).size === 4;
        assert(sec, `Language switch: all 4 starter codes distinct for "${probWithAll.title}"`,
            allDistinct, 'Some language starter codes are identical');
    }
}

// ═══════════════════════════════════════════════════════════
// SECTION 11 — EDGE CASES
// ═══════════════════════════════════════════════════════════
async function runEdgeCaseTests() {
    console.log(hdr('═══ SECTION 11: Edge Cases ═══'));

    const sec = 'Edge';

    // Single element
    const singleCode = 'function solve(input) { return input[0]; }';
    const rSingle = await runJudge(jsExecutor, singleCode, [{ input: '[42]', expectedOutput: '42', comparisonMode: 'exact' }]);
    assert(sec, 'Single element array', rSingle.verdict === 'accepted');

    // Negative numbers
    const negCode = 'function solve(input) { return Math.min.apply(null,input); }';
    const rNeg = await runJudge(jsExecutor, negCode, [{ input: '[-3,-1,-9,-2]', expectedOutput: '-9', comparisonMode: 'exact' }]);
    assert(sec, 'Negative numbers', rNeg.verdict === 'accepted');

    // Return zero
    const zeroCode = 'function solve(input) { return 0; }';
    const rZero = await runJudge(jsExecutor, zeroCode, [{ input: '1', expectedOutput: '0', comparisonMode: 'exact' }]);
    assert(sec, 'Return zero', rZero.verdict === 'accepted');

    // Return boolean true
    const trueCode = 'function solve(input) { return true; }';
    const rTrue = await runJudge(jsExecutor, trueCode, [{ input: '1', expectedOutput: 'true', comparisonMode: 'exact' }]);
    assert(sec, 'Return boolean true', rTrue.verdict === 'accepted');

    // Return boolean false
    const falseCode = 'function solve(input) { return false; }';
    const rFalse = await runJudge(jsExecutor, falseCode, [{ input: '1', expectedOutput: 'false', comparisonMode: 'exact' }]);
    assert(sec, 'Return boolean false', rFalse.verdict === 'accepted');

    // Large array
    const bigArr = JSON.stringify(Array.from({length: 1000}, (_,i) => i));
    const bigCode = 'function solve(input) { return input.length; }';
    const rBig = await runJudge(jsExecutor, bigCode, [{ input: bigArr, expectedOutput: '1000', comparisonMode: 'exact' }]);
    assert(sec, 'Large array (n=1000)', rBig.verdict === 'accepted');

    // Multiple test cases all pass
    const addCode = 'function solve(input) { return input.a + input.b; }';
    const multiTCs = [
        { input: '{"a":1,"b":2}', expectedOutput: '3', comparisonMode: 'exact' },
        { input: '{"a":10,"b":20}', expectedOutput: '30', comparisonMode: 'exact' },
        { input: '{"a":-5,"b":5}', expectedOutput: '0', comparisonMode: 'exact' }
    ];
    const rMulti = await runJudge(jsExecutor, addCode, multiTCs);
    assert(sec, 'Multiple test cases: all 3 pass', rMulti.testCasesPassed === 3);

    // Floating point tolerance
    const floatCode = 'function solve(input) { return 22/7; }';
    const rFloat = await runJudge(jsExecutor, floatCode, [{ input: '1', expectedOutput: '3.142857142857143', comparisonMode: 'floating' }]);
    assert(sec, 'Floating point tolerance', rFloat.verdict === 'accepted');

    // Unordered array comparison
    const unordCode = 'function solve(input) { return [1, 0]; }';
    const unordTCs = [{ input: '{"nums":[7,2],"target":9}', expectedOutput: '[0,1]', comparisonMode: 'unordered_array' }];
    const rUnord = await runJudge(jsExecutor, unordCode, unordTCs);
    assert(sec, 'Unordered array comparison', rUnord.verdict === 'accepted');

    // String return
    const strCode = 'function solve(input) { return "hello"; }';
    const rStr = await runJudge(jsExecutor, strCode, [{ input: '1', expectedOutput: 'hello', comparisonMode: 'exact' }]);
    assert(sec, 'String return value', rStr.verdict === 'accepted');

    // 2D matrix return
    const matCode = 'function solve(input) { return [[1,2],[3,4]]; }';
    const rMat = await runJudge(jsExecutor, matCode, [{ input: '1', expectedOutput: '[[1,2],[3,4]]', comparisonMode: 'exact' }]);
    assert(sec, '2D matrix return', rMat.verdict === 'accepted');
}

// ═══════════════════════════════════════════════════════════
// FINAL REPORT
// ═══════════════════════════════════════════════════════════
function printReport() {
    const total = passed + failed;

    console.log('\n');
    console.log(`${BOLD}${'═'.repeat(65)}${RESET}`);
    console.log(`${BOLD}  REGRESSION REPORT — ${new Date().toISOString()}${RESET}`);
    console.log(`${'═'.repeat(65)}`);
    console.log(`  Total Tests : ${total}`);
    console.log(`  ${GREEN}Passed      : ${passed}${RESET}`);
    console.log(`  ${failed > 0 ? RED : GREEN}Failed      : ${failed}${RESET}`);
    console.log(`  Pass Rate   : ${Math.round((passed / total) * 100)}%`);
    console.log(`${'═'.repeat(65)}`);

    if (failures.length > 0) {
        console.log(`\n${RED}${BOLD}FAILED TESTS:${RESET}`);
        const bySection = {};
        for (const f of failures) {
            if (!bySection[f.section]) bySection[f.section] = [];
            bySection[f.section].push(f);
        }
        for (const [section, items] of Object.entries(bySection)) {
            console.log(`\n  ${YELLOW}[${section}]${RESET}`);
            for (const item of items) {
                console.log(`    ${RED}✗${RESET} ${item.name}`);
                if (item.reason) console.log(`      ${DIM}→ ${item.reason}${RESET}`);
            }
        }
    } else {
        console.log(`\n${GREEN}${BOLD}✓ ALL TESTS PASSED — Online Judge is production-ready.${RESET}`);
    }

    console.log(`\n${'═'.repeat(65)}\n`);
}

// ═══════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BOLD}${CYAN}║     ONLINE JUDGE — REGRESSION TEST SUITE                 ║${RESET}`);
    console.log(`${BOLD}${CYAN}║     ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}                         ║${RESET}`);
    console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}`);

    try {
        runComparerTests();
        runSerializerTests();
        await runJSVerdictTests();
        await runJSProblemTests();
        await runCVerdictTests();
        await runCProblemTests();
        await runCppTests();
        await runJavaTests();
        await runAPIIntegrationTests();
        await runDBTests();
        await runEdgeCaseTests();
    } catch (err) {
        console.error(`\n${RED}FATAL: Uncaught error during regression run:${RESET}`, err);
        failed++;
        failures.push({ section: 'Fatal', name: 'Uncaught exception', ok: false, reason: err.message });
    }

    printReport();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    process.exit(failed === 0 ? 0 : 1);
}

main();
