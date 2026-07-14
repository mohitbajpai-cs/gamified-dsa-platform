const parser = require('../parser');
const baseAnalyzer = require('../base.analyzer');

function analyze(code) {
    let maxLoopNesting = 0;
    let hasRecursion = false;
    let recursionCallsCount = 0;
    let hasHalvingLoop = false;

    let ast;
    try {
        ast = parser.parse(code);
    } catch (e) {
        // Fallback to base analyzer in case of parser crash
        return baseAnalyzer.runAnalysis('c', 0, false, 0, false, code);
    }

    const functionNames = new Set();
    const signatureNodes = new Set();
    const body = ast.body || [];

    // Step 1: Detect C function signatures at the top level
    for (let i = 0; i < body.length; i++) {
        const node = body[i];
        const nextNode = body[i + 1];
        if (node.type === 'Expression' && nextNode && nextNode.type === 'BlockStatement') {
            const tokens = node.tokens || [];
            // Find '(' and get the token before it
            for (let j = 1; j < tokens.length; j++) {
                if (tokens[j].value === '(' && tokens[j - 1].type === 'Identifier') {
                    // Make sure it's not a control flow keyword
                    const name = tokens[j - 1].value;
                    if (!['if', 'for', 'while', 'switch', 'return'].includes(name)) {
                        functionNames.add(name);
                        signatureNodes.add(node);
                    }
                }
            }
        }
    }

    let currentLoopDepth = 0;

    // Step 2: Walk the AST to extract features
    const walkNode = (node) => {
        if (!node) return;

        const isLoop = node.type === 'ForStatement' || node.type === 'WhileStatement';
        if (isLoop) {
            currentLoopDepth++;
            maxLoopNesting = Math.max(maxLoopNesting, currentLoopDepth);

            // Check loop components or expression for halving indicators
            const rawText = JSON.stringify(node).toLowerCase();
            if (rawText.includes('>>') || rawText.includes('/2') || rawText.includes('/ 2') || rawText.includes('mid')) {
                hasHalvingLoop = true;
            }
        }

        // Check call expressions / recursion in generic expressions
        if (node.type === 'Expression' && node.tokens && !signatureNodes.has(node)) {
            const tokens = node.tokens;
            for (let j = 1; j < tokens.length; j++) {
                if (tokens[j].value === '(' && tokens[j - 1].type === 'Identifier') {
                    const calledName = tokens[j - 1].value;
                    if (functionNames.has(calledName)) {
                        hasRecursion = true;
                        recursionCallsCount++;
                    }
                }
            }
        }

        // Recurse children
        if (node.body) {
            if (Array.isArray(node.body)) {
                node.body.forEach(walkNode);
            } else {
                walkNode(node.body);
            }
        }
        if (node.consequent) walkNode(node.consequent);
        if (node.alternate) walkNode(node.alternate);

        if (isLoop) {
            currentLoopDepth--;
        }
    };

    body.forEach(walkNode);

    return baseAnalyzer.runAnalysis('c', maxLoopNesting, hasRecursion, recursionCallsCount, hasHalvingLoop, code);
}

module.exports = {
    analyze
};
