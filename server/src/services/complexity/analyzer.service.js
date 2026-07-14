const jsAnalyzer = require('./analyzers/javascript.analyzer');
const cAnalyzer = require('./analyzers/c.analyzer');
const cppAnalyzer = require('./analyzers/cpp.analyzer');
const javaAnalyzer = require('./analyzers/java.analyzer');

class ComplexityAnalyzerService {
    /**
     * Entry point to analyze complexity of user-submitted code in JavaScript, C, C++, or Java.
     * @param {string} code - The source code to analyze.
     * @param {string} language - The programming language ('javascript', 'c', 'cpp', 'java').
     */
    analyze(code, language = 'javascript') {
        const startTime = process.hrtime();
        const fallback = {
            language,
            timeComplexity: 'Unknown',
            spaceComplexity: 'Unknown',
            confidence: 'Low',
            detectedPatterns: [],
            notes: 'Code could not be parsed successfully.',
            explanation: 'Code could not be parsed successfully.'
        };

        if (!code || code.trim() === '') {
            return fallback;
        }

        try {
            const lang = language.toLowerCase();
            let result;

            if (lang === 'javascript' || lang === 'js') {
                result = jsAnalyzer.analyze(code);
            } else if (lang === 'c') {
                result = cAnalyzer.analyze(code);
            } else if (lang === 'cpp' || lang === 'c++') {
                result = cppAnalyzer.analyze(code);
            } else if (lang === 'java') {
                result = javaAnalyzer.analyze(code);
            } else {
                return {
                    language,
                    timeComplexity: 'Unknown',
                    spaceComplexity: 'Unknown',
                    confidence: 'Low',
                    detectedPatterns: [],
                    notes: `Complexity analysis currently not supported for ${language}.`,
                    explanation: `Complexity analysis currently not supported for ${language}.`
                };
            }

            const diff = process.hrtime(startTime);
            const elapsedMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));

            return {
                language: result.language,
                timeComplexity: result.timeComplexity,
                spaceComplexity: result.spaceComplexity,
                confidence: result.confidence,
                detectedPatterns: result.detectedPatterns || [],
                notes: result.notes || '',
                explanation: result.notes || 'Heuristic analysis completed.',
                analysisTimeMs: elapsedMs
            };
        } catch (error) {
            console.error(`Complexity analysis failed for ${language}:`, error);
            return fallback;
        }
    }
}

module.exports = new ComplexityAnalyzerService();
