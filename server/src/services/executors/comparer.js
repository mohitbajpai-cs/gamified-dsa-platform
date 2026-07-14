class Comparer {
    compare(actual, expected, mode = 'exact') {
        const actNormalized = this.normalize(actual);
        const expNormalized = this.normalize(expected);
        return this.deepCompare(actNormalized, expNormalized, mode);
    }

    normalize(val) {
        if (val === null || val === undefined) {
            return null;
        }

        if (typeof val === 'boolean') {
            return val;
        }

        if (typeof val === 'number') {
            return val;
        }

        if (typeof val === 'object') {
            // Already a structured array or object — deep clone to avoid mutation
            return JSON.parse(JSON.stringify(val));
        }

        const clean = String(val).trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 1. Try JSON parsing first (handles [1,2,3], {"key":val}, true, false, null, numbers)
        try {
            const parsed = JSON.parse(clean);
            return parsed;
        } catch (e) {}

        // 2. Detect explicit booleans
        if (clean.toLowerCase() === 'true') return true;
        if (clean.toLowerCase() === 'false') return false;

        // 3. Detect null
        if (clean.toLowerCase() === 'null') return null;

        // 4. Parse whitespace/newline-separated numbers as arrays/matrices
        const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
            let isAllNumeric = true;
            const parsedGrid = [];

            for (const line of lines) {
                if (!isAllNumeric) break;
                const tokens = line.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
                if (tokens.length === 0) continue;
                const rowNums = [];
                for (const token of tokens) {
                    const num = Number(token);
                    if (isNaN(num) && token !== 'NaN') {
                        isAllNumeric = false;
                        break;
                    }
                    rowNums.push(isNaN(num) ? NaN : num);
                }
                if (isAllNumeric) parsedGrid.push(rowNums);
            }

            if (isAllNumeric && parsedGrid.length > 0) {
                // All rows are single items → flat 1D array
                if (parsedGrid.every(row => row.length === 1)) {
                    const flat = parsedGrid.map(row => row[0]);
                    return flat.length === 1 ? flat[0] : flat;
                }
                // Single row → flat 1D array
                if (parsedGrid.length === 1) {
                    return parsedGrid[0].length === 1 ? parsedGrid[0][0] : parsedGrid[0];
                }
                // Multi-row → 2D matrix
                return parsedGrid;
            }
        }

        // 5. Detect single number
        const num = Number(clean);
        if (!isNaN(num) && clean !== '') {
            return num;
        }

        // 6. Return as plain string
        return clean;
    }

    flattenSingletons(arr) {
        if (!Array.isArray(arr)) return arr;
        if (arr.length > 0 && arr.every(row => Array.isArray(row) && row.length === 1)) {
            return arr.map(row => row[0]);
        }
        return arr;
    }

    deepCompare(act, exp, mode = 'exact') {
        // Handle null/undefined equivalence
        if (act === null && exp === null) return true;
        if (act === null || exp === null) return false;

        if (act === exp) return true;

        // Floating point epsilon comparison (always apply when both are numbers)
        if (typeof act === 'number' && typeof exp === 'number') {
            if (isNaN(act) && isNaN(exp)) return true;
            return Math.abs(act - exp) < 1e-6;
        }

        // Floating mode: attempt to coerce strings to numbers
        if (mode === 'floating') {
            const numAct = Number(act);
            const numExp = Number(exp);
            if (!isNaN(numAct) && !isNaN(numExp)) {
                return Math.abs(numAct - numExp) < 1e-6;
            }
        }

        // Type mismatch (after null checks and number checks)
        if (typeof act !== typeof exp) return false;

        if (act && exp && typeof act === 'object') {
            let flatAct = act;
            let flatExp = exp;

            if (Array.isArray(act) && Array.isArray(exp)) {
                // Flatten single-column matrix wrappers if comparing to 1D
                const actHasNested = act.some(el => Array.isArray(el));
                const expHasNested = exp.some(el => Array.isArray(el));
                if (actHasNested !== expHasNested) {
                    flatAct = this.flattenSingletons(act);
                    flatExp = this.flattenSingletons(exp);
                }

                if (flatAct.length !== flatExp.length) return false;

                if (mode === 'unordered_array') {
                    const visited = new Array(flatExp.length).fill(false);
                    for (let i = 0; i < flatAct.length; i++) {
                        let found = false;
                        for (let j = 0; j < flatExp.length; j++) {
                            if (!visited[j] && this.deepCompare(flatAct[i], flatExp[j], 'exact')) {
                                visited[j] = true;
                                found = true;
                                break;
                            }
                        }
                        if (!found) return false;
                    }
                    return true;
                }

                if (mode === 'unordered_matrix') {
                    const visited = new Array(flatExp.length).fill(false);
                    for (let i = 0; i < flatAct.length; i++) {
                        let found = false;
                        for (let j = 0; j < flatExp.length; j++) {
                            if (!visited[j] && this.deepCompare(flatAct[i], flatExp[j], 'unordered_array')) {
                                visited[j] = true;
                                found = true;
                                break;
                            }
                        }
                        if (!found) return false;
                    }
                    return true;
                }

                // Default: ordered element-by-element comparison
                for (let i = 0; i < flatAct.length; i++) {
                    if (!this.deepCompare(flatAct[i], flatExp[i], mode)) return false;
                }
                return true;

            } else if (!Array.isArray(act) && !Array.isArray(exp)) {
                // Plain object comparison
                const keysAct = Object.keys(act).sort();
                const keysExp = Object.keys(exp).sort();
                if (keysAct.length !== keysExp.length) return false;
                for (const key of keysAct) {
                    if (!Object.prototype.hasOwnProperty.call(exp, key)) return false;
                    if (!this.deepCompare(act[key], exp[key], mode)) return false;
                }
                return true;
            }

            // One is array, other is not
            return false;
        }

        // String comparison — case-sensitive by default
        if (typeof act === 'string' && typeof exp === 'string') {
            return act === exp;
        }

        return false;
    }
}

module.exports = new Comparer();
