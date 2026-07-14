const cAnalyzer = require('./c.analyzer');

function analyze(code) {
    const res = cAnalyzer.analyze(code);
    res.language = 'cpp';
    return res;
}

module.exports = {
    analyze
};
