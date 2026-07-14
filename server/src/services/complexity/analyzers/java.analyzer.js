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
        return baseAnalyzer.runAnalysis('java', 0, false, 0, false, code);
    }

    const functionNames = new Set();
    const signatureNodes = new Set();

    // Step 1: Recursively walk sibling lists to extract Java method signatures
    const walkSiblings = (nodes) => {
        if (!Array.isArray(nodes)) return;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const nextNode = nodes[i + 1];
            if (node.type === 'Expression' && nextNode && nextNode.type === 'BlockStatement') {
                const tokens = node.tokens || [];
                for (let j = 1; j < tokens.length; j++) {
                    if (tokens[j].value === '(' && tokens[j - 1].type === 'Identifier') {
                        const name = tokens[j - 1].value;
                        if (!['if', 'for', 'while', 'switch', 'return', 'catch'].includes(name)) {
                            functionNames.add(name);
                            signatureNodes.add(node);
                        }
                    }
                }
            }
            
            // Recurse into children structures to find nested sibling lists
            if (node.body) {
                if (Array.isArray(node.body)) {
                    walkSiblings(node.body);
                } else if (node.body.body) {
                    walkSiblings(node.body.body);
                }
            }
            if (node.consequent && node.consequent.body) walkSiblings(node.consequent.body);
            if (node.alternate && node.alternate.body) walkSiblings(node.alternate.body);
        }
    };

    walkSiblings(ast.body);

    let currentLoopDepth = 0;

    // Step 2: Walk AST to extract loop nesting and recursion calls
    const walkNode = (node) => {
        if (!node) return;

        const isLoop = node.type === 'ForStatement' || node.type === 'WhileStatement';
        if (isLoop) {
            currentLoopDepth++;
            maxLoopNesting = Math.max(maxLoopNesting, currentLoopDepth);

            const rawText = JSON.stringify(node).toLowerCase();
            if (rawText.includes('>>') || rawText.includes('/2') || rawText.includes('/ 2') || rawText.includes('mid')) {
                hasHalvingLoop = true;
            }
        }

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

    walkNode(ast);

    return baseAnalyzer.runAnalysis('java', maxLoopNesting, hasRecursion, recursionCallsCount, hasHalvingLoop, code);
}

module.exports = {
    analyze
};
