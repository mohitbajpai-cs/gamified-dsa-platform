/**
 * Standard AST Parser for C, C++, and Java
 * Pure JavaScript implementation with zero external dependencies.
 */

function tokenize(code) {
    const tokens = [];
    let i = 0;
    const len = code.length;

    while (i < len) {
        const char = code[i];

        // Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Skip single line comments
        if (char === '/' && code[i + 1] === '/') {
            i += 2;
            while (i < len && code[i] !== '\n') i++;
            continue;
        }

        // Skip multi line comments
        if (char === '/' && code[i + 1] === '*') {
            i += 2;
            while (i < len && !(code[i] === '*' && code[i + 1] === '/')) i++;
            i += 2;
            continue;
        }

        // String literals
        if (char === '"') {
            let value = '"';
            i++;
            while (i < len && code[i] !== '"') {
                if (code[i] === '\\') {
                    value += '\\' + code[i + 1];
                    i += 2;
                } else {
                    value += code[i];
                    i++;
                }
            }
            value += '"';
            i++;
            tokens.push({ type: 'StringLiteral', value });
            continue;
        }

        // Numeric literals
        if (/\d/.test(char)) {
            let value = '';
            while (i < len && /[\d.]/.test(code[i])) {
                value += code[i];
                i++;
            }
            tokens.push({ type: 'NumericLiteral', value });
            continue;
        }

        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
            let value = '';
            while (i < len && /[a-zA-Z0-9_]/.test(code[i])) {
                value += code[i];
                i++;
            }
            tokens.push({ type: 'Identifier', value });
            continue;
        }

        // Double operators / punctuations
        const twoChar = code.substr(i, 2);
        const doubleOps = ['++', '--', '+=', '-=', '*=', '/=', '&&', '||', '<<', '>>', '==', '!=', '<=', '>='];
        if (doubleOps.includes(twoChar)) {
            tokens.push({ type: 'Operator', value: twoChar });
            i += 2;
            continue;
        }

        // Single operators / punctuations
        const singleOps = ['(', ')', '{', '}', '[', ']', ';', ',', '.', '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':', '#'];
        if (singleOps.includes(char)) {
            tokens.push({ type: 'Operator', value: char });
            i++;
            continue;
        }

        i++; // fallback
    }
    return tokens;
}

function parse(code) {
    const tokens = tokenize(code);
    let index = 0;

    function peek(offset = 0) {
        return tokens[index + offset];
    }

    function consume(expectedValue) {
        const token = tokens[index];
        if (!token) return null;
        if (expectedValue !== undefined && token.value !== expectedValue) {
            return null;
        }
        index++;
        return token;
    }

    function parseBlock() {
        const statements = [];
        consume('{');
        while (index < tokens.length && peek()?.value !== '}') {
            const stmt = parseStatement();
            if (stmt) statements.push(stmt);
            else index++; // prevent infinite loop
        }
        consume('}');
        return { type: 'BlockStatement', body: statements };
    }

    function parseStatement() {
        const token = peek();
        if (!token) return null;

        if (token.value === '{') {
            return parseBlock();
        }

        if (token.value === 'for') {
            consume('for');
            consume('(');
            const init = parseExpression();
            consume(';');
            const test = parseExpression();
            consume(';');
            const update = parseExpression();
            consume(')');
            const body = parseStatement();
            return { type: 'ForStatement', init, test, update, body };
        }

        if (token.value === 'while') {
            consume('while');
            consume('(');
            const test = parseExpression();
            consume(')');
            const body = parseStatement();
            return { type: 'WhileStatement', test, body };
        }

        if (token.value === 'if') {
            consume('if');
            consume('(');
            const test = parseExpression();
            consume(')');
            const consequent = parseStatement();
            let alternate = null;
            if (peek()?.value === 'else') {
                consume('else');
                alternate = parseStatement();
            }
            return { type: 'IfStatement', test, consequent, alternate };
        }

        // Generic declaration/assignment/expression
        const expr = parseExpression();
        if (!expr) {
            const t = consume();
            if (!t) return null;
            if (t.value === ';') return null;
            return { type: 'Punctuation', value: t.value };
        }
        consume(';');
        return expr;
    }

    function parseExpression() {
        const exprTokens = [];
        let parenDepth = 0;
        let braceDepth = 0;
        let bracketDepth = 0;

        while (index < tokens.length) {
            const t = peek();
            if (!t) break;

            if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
                if (t.value === ';' || t.value === ',' || t.value === '}' || t.value === ')' || t.value === '{') {
                    break;
                }
            }

            if (t.value === '(') parenDepth++;
            if (t.value === ')') {
                parenDepth--;
            }
            if (t.value === '{') braceDepth++;
            if (t.value === '}') {
                braceDepth--;
            }
            if (t.value === '[') bracketDepth++;
            if (t.value === ']') {
                bracketDepth--;
            }

            exprTokens.push(consume());
        }

        if (exprTokens.length === 0) return null;

        return {
            type: 'Expression',
            tokens: exprTokens,
            raw: exprTokens.map(t => t.value).join(' ')
        };
    }

    const ast = [];
    while (index < tokens.length) {
        const stmt = parseStatement();
        if (stmt) ast.push(stmt);
        else index++;
    }

    return { type: 'Program', body: ast };
}

function walk(node, callback) {
    if (!node || typeof node !== 'object') return;
    callback(node);

    if (node.body) {
        if (Array.isArray(node.body)) {
            node.body.forEach(child => walk(child, callback));
        } else {
            walk(node.body, callback);
        }
    }
    if (node.consequent) walk(node.consequent, callback);
    if (node.alternate) walk(node.alternate, callback);
}

module.exports = {
    tokenize,
    parse,
    walk
};
