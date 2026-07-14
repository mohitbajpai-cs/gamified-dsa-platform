const acorn = require('acorn');
const baseAnalyzer = require('../base.analyzer');

function analyze(code) {
    let maxLoopNesting = 0;
    let hasRecursion = false;
    let recursionCallsCount = 0;
    let hasHalvingLoop = false;

    let currentLoopDepth = 0;
    const functionNames = new Set();

    let ast;
    try {
        ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });
    } catch (err) {
        try {
            ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
        } catch (e) {
            // If parser fails, return fallback estimation using baseAnalyzer directly
            return baseAnalyzer.runAnalysis('javascript', 0, false, 0, false, code);
        }
    }

    const walk = (node) => {
        if (!node || typeof node !== 'object') return;

        // Function definitions
        if (node.type === 'FunctionDeclaration' && node.id) {
            functionNames.add(node.id.name);
        } else if (node.type === 'VariableDeclarator' && node.init && 
                  (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) {
            if (node.id && node.id.name) {
                functionNames.add(node.id.name);
            }
        }

        // Loop depth
        const isLoop = ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForOfStatement', 'ForInStatement'].includes(node.type);
        if (isLoop) {
            currentLoopDepth++;
            maxLoopNesting = Math.max(maxLoopNesting, currentLoopDepth);

            // Halving loop indicator
            if (node.type === 'WhileStatement' || node.type === 'ForStatement') {
                const loopStr = JSON.stringify(node);
                if (loopStr.includes('>>') || loopStr.includes('/2') || loopStr.includes('/ 2') || loopStr.includes('Math.floor')) {
                    hasHalvingLoop = true;
                }
            }
        }

        // Call expression & recursion detection
        if (node.type === 'CallExpression') {
            const callee = node.callee;
            let calledName = '';
            if (callee.type === 'Identifier') {
                calledName = callee.name;
            } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
                calledName = callee.property.name;
            }

            if (calledName && functionNames.has(calledName)) {
                hasRecursion = true;
                recursionCallsCount++;
            }
        }

        // Walk children
        for (let key in node) {
            if (node.hasOwnProperty(key)) {
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(walk);
                } else if (child && typeof child === 'object') {
                    walk(child);
                }
            }
        }

        if (isLoop) {
            currentLoopDepth--;
        }
    };

    walk(ast);

    return baseAnalyzer.runAnalysis('javascript', maxLoopNesting, hasRecursion, recursionCallsCount, hasHalvingLoop, code);
}

module.exports = {
    analyze
};
