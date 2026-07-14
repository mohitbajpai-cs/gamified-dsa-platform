class InputSerializer {
    /**
     * Main entry point.
     * Accepts either a raw JSON string (from MongoDB) or a native JS value.
     */
    serialize(val) {
        if (val === null || val === undefined) {
            return 'null';
        }

        // If stored as a JSON string in MongoDB, parse it first
        if (typeof val === 'string') {
            const trimmed = val.trim();
            // Detect JSON structures and numbers
            if (
                (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
                (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                trimmed === 'true' ||
                trimmed === 'false' ||
                trimmed === 'null' ||
                (!isNaN(trimmed) && trimmed !== '')
            ) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return this.serializeValue(parsed);
                } catch (e) {
                    // Fall through to treat as raw string
                }
            }
            // Bare string (e.g. "hello")
            return trimmed;
        }

        return this.serializeValue(val);
    }

    serializeValue(val) {
        if (val === null || val === undefined) {
            return 'null';
        }

        if (typeof val === 'boolean') {
            return val ? 'true' : 'false';
        }

        if (typeof val === 'number') {
            return String(val);
        }

        if (typeof val === 'string') {
            return val;
        }

        if (Array.isArray(val)) {
            // 2D Matrix — must all rows be arrays
            if (val.length > 0 && val.every(el => Array.isArray(el))) {
                const rows = val.length;
                const cols = val[0].length;
                const header = `${rows} ${cols}`;
                const body = val.map(row => row.map(el => this.serializeValue(el)).join(' ')).join('\n');
                return `${header}\n${body}`;
            }
            // Empty array
            if (val.length === 0) {
                return '0\n';
            }
            // 1D Array
            const n = val.length;
            const elements = val.map(el => this.serializeValue(el)).join(' ');
            return `${n}\n${elements}`;
        }

        if (typeof val === 'object') {
            // Graph: { v: number, edges: array }
            if (val.v !== undefined && val.edges !== undefined && Array.isArray(val.edges)) {
                const parts = [String(val.v), String(val.edges.length)];
                for (const edge of val.edges) {
                    if (Array.isArray(edge)) {
                        parts.push(edge.join(' '));
                    } else {
                        parts.push(`${edge.u} ${edge.v}`);
                    }
                }
                return parts.join('\n');
            }

            // Multi-parameter object: serialize each field on its own block
            // E.g. { nums: [2,7,11,15], target: 9 } →
            //   4
            //   2 7 11 15
            //   9
            const keys = Object.keys(val);
            const parts = [];
            for (const key of keys) {
                parts.push(this.serializeValue(val[key]));
            }
            return parts.join('\n');
        }

        return String(val);
    }
}

module.exports = new InputSerializer();
