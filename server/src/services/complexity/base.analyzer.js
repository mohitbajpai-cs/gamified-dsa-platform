/**
 * Common pattern detection and complexity estimation logic for all languages.
 */

function runAnalysis(language, maxLoopNesting, hasRecursion, recursionCallsCount, hasHalvingLoop, code) {
    const detectedPatterns = [];
    const lowercaseCode = code.toLowerCase().replace(/\s+/g, ' ');

    // 1. Loop Nesting Detection
    if (maxLoopNesting === 1) {
        detectedPatterns.push('Single Loop');
    } else if (maxLoopNesting === 2) {
        detectedPatterns.push('Nested Loops');
    } else if (maxLoopNesting >= 3) {
        detectedPatterns.push('Triple Nested Loops');
    }

    // 2. Binary Search Detection
    const hasBinarySearchKeywords = lowercaseCode.includes('mid') && 
        (lowercaseCode.includes('low') || lowercaseCode.includes('left') || lowercaseCode.includes('l =') || lowercaseCode.includes('low =')) &&
        (lowercaseCode.includes('high') || lowercaseCode.includes('right') || lowercaseCode.includes('r =') || lowercaseCode.includes('high =')) &&
        (lowercaseCode.includes('<=') || lowercaseCode.includes('<') || lowercaseCode.includes('>=') || lowercaseCode.includes('>'));
    if (hasHalvingLoop || (maxLoopNesting > 0 && hasBinarySearchKeywords)) {
        detectedPatterns.push('Binary Search');
    }

    // 3. Sorting Algorithms
    const hasMergeKeywords = lowercaseCode.includes('merge') && (lowercaseCode.includes('mid') || lowercaseCode.includes('divide'));
    if (hasRecursion && hasMergeKeywords) {
        detectedPatterns.push('Merge Sort');
    }
    const hasQuickKeywords = (lowercaseCode.includes('quick') || lowercaseCode.includes('partition') || lowercaseCode.includes('pivot')) && hasRecursion;
    if (hasQuickKeywords) {
        detectedPatterns.push('Quick Sort');
    }
    const hasHeapKeywords = (lowercaseCode.includes('heapify') || lowercaseCode.includes('heap') || lowercaseCode.includes('priority_queue') || lowercaseCode.includes('priorityqueue')) && (lowercaseCode.includes('sort') || lowercaseCode.includes('build'));
    if (hasHeapKeywords) {
        detectedPatterns.push('Heap Sort');
    }
    const hasCountingKeywords = lowercaseCode.includes('count') && (lowercaseCode.includes('frequency') || lowercaseCode.includes('freq') || lowercaseCode.includes('bucket')) && maxLoopNesting > 0;
    if (hasCountingKeywords && !hasRecursion) {
        detectedPatterns.push('Counting Sort');
    }

    // 4. Traversals
    const hasGraphKeywords = lowercaseCode.includes('visited') || lowercaseCode.includes('vis') || lowercaseCode.includes('adj') || lowercaseCode.includes('graph') || lowercaseCode.includes('neighbor') || lowercaseCode.includes('edge') || lowercaseCode.includes('vertex');
    const hasBfsKeywords = lowercaseCode.includes('bfs') || (lowercaseCode.includes('queue') && (lowercaseCode.includes('poll') || lowercaseCode.includes('shift') || lowercaseCode.includes('pop') || lowercaseCode.includes('add') || lowercaseCode.includes('offer')));
    const hasDfsKeywords = lowercaseCode.includes('dfs') || hasRecursion;

    if (hasGraphKeywords && hasBfsKeywords) {
        detectedPatterns.push('BFS');
        detectedPatterns.push('Graph Traversal');
    }
    if (hasGraphKeywords && hasDfsKeywords) {
        detectedPatterns.push('DFS');
        detectedPatterns.push('Graph Traversal');
    }
    const hasTreeKeywords = lowercaseCode.includes('root') && (lowercaseCode.includes('left') || lowercaseCode.includes('right')) && (lowercaseCode.includes('node') || lowercaseCode.includes('tree'));
    if (hasTreeKeywords) {
        detectedPatterns.push('Tree Traversal');
    }
    const hasMatrixKeywords = (lowercaseCode.includes('matrix') || lowercaseCode.includes('grid') || lowercaseCode.includes('board')) && maxLoopNesting >= 2;
    if (hasMatrixKeywords) {
        detectedPatterns.push('Matrix Traversal');
    }

    // 5. Advanced Structures / Patterns
    if (lowercaseCode.includes('indegree') || lowercaseCode.includes('topo')) {
        detectedPatterns.push('Topological Sort');
    }
    if (lowercaseCode.includes('parent') && (lowercaseCode.includes('find') || lowercaseCode.includes('union') || lowercaseCode.includes('dsu') || lowercaseCode.includes('disjoint'))) {
        detectedPatterns.push('Union Find');
    }
    if (lowercaseCode.includes('trie') || lowercaseCode.includes('insert') && lowercaseCode.includes('search') && lowercaseCode.includes('children')) {
        detectedPatterns.push('Trie');
    }
    if (lowercaseCode.includes('hashmap') || lowercaseCode.includes('unordered_map') || lowercaseCode.includes('map') || lowercaseCode.includes('dictionary') || lowercaseCode.includes('dict')) {
        detectedPatterns.push('HashMap');
    }
    if (lowercaseCode.includes('hashset') || lowercaseCode.includes('unordered_set') || lowercaseCode.includes('set') || lowercaseCode.includes('visited')) {
        detectedPatterns.push('HashSet');
    }
    if (lowercaseCode.includes('priorityqueue') || lowercaseCode.includes('priority_queue') || lowercaseCode.includes('minheap') || lowercaseCode.includes('maxheap') || lowercaseCode.includes('pq')) {
        detectedPatterns.push('Priority Queue');
    }
    if (lowercaseCode.includes('segment') && (lowercaseCode.includes('tree') || lowercaseCode.includes('query') || lowercaseCode.includes('update')) && (lowercaseCode.includes('mid') || lowercaseCode.includes('left'))) {
        detectedPatterns.push('Segment Tree');
    }
    if (lowercaseCode.includes('fenwick') || lowercaseCode.includes('indexed tree') || (lowercaseCode.includes('bit') && lowercaseCode.includes('i & -i'))) {
        detectedPatterns.push('Fenwick Tree');
    }

    // 6. Algorithm Paradigms
    const hasWindowKeywords = (lowercaseCode.includes('window') || lowercaseCode.includes('left') || lowercaseCode.includes('right')) && (lowercaseCode.includes('k') || lowercaseCode.includes('max_') || lowercaseCode.includes('min_')) && maxLoopNesting > 0;
    if (hasWindowKeywords && (lowercaseCode.includes('sum') || lowercaseCode.includes('len') || lowercaseCode.includes('window'))) {
        detectedPatterns.push('Sliding Window');
    }
    const hasTwoPointerKeywords = (lowercaseCode.includes('left') || lowercaseCode.includes('low') || lowercaseCode.includes('i =')) && (lowercaseCode.includes('right') || lowercaseCode.includes('high') || lowercaseCode.includes('j =')) && (lowercaseCode.includes('left < right') || lowercaseCode.includes('i < j'));
    if (hasTwoPointerKeywords) {
        detectedPatterns.push('Two Pointers');
    }
    if (lowercaseCode.includes('greedy') || (lowercaseCode.includes('sort') && (lowercaseCode.includes('profit') || lowercaseCode.includes('weight') || lowercaseCode.includes('cost')))) {
        detectedPatterns.push('Greedy');
    }
    if (lowercaseCode.includes('kadane') || (lowercaseCode.includes('subarray') && lowercaseCode.includes('sum') && (lowercaseCode.includes('max') || lowercaseCode.includes('curr')) && lowercaseCode.includes('math.max'))) {
        detectedPatterns.push('Kadane');
    }
    if (lowercaseCode.includes('prefix') || (lowercaseCode.includes('sum') && (lowercaseCode.includes('pref[i]') || lowercaseCode.includes('prefix[i]')))) {
        detectedPatterns.push('Prefix Sum');
    }
    if (lowercaseCode.includes('lifting') || lowercaseCode.includes('ancestor') || (lowercaseCode.includes('up[') && lowercaseCode.includes('][') && lowercaseCode.includes('2'))) {
        detectedPatterns.push('Binary Lifting');
    }
    if (lowercaseCode.includes('dp') || lowercaseCode.includes('memo') || lowercaseCode.includes('tab') || lowercaseCode.includes('cache')) {
        detectedPatterns.push('Dynamic Programming');
        if (lowercaseCode.includes('memo') || lowercaseCode.includes('cache') || (hasRecursion && lowercaseCode.includes('dp'))) {
            detectedPatterns.push('Memoization');
        }
    }
    if (lowercaseCode.includes('backtrack') || (hasRecursion && (lowercaseCode.includes('path') || lowercaseCode.includes('solve') || lowercaseCode.includes('permute') || lowercaseCode.includes('subset')) && (lowercaseCode.includes('push') || lowercaseCode.includes('add') || lowercaseCode.includes('pop') || lowercaseCode.includes('remove')))) {
        detectedPatterns.push('Backtracking');
    }
    if (hasRecursion && (recursionCallsCount >= 2 || lowercaseCode.includes('divide') || lowercaseCode.includes('conquer') || lowercaseCode.includes('split') || lowercaseCode.includes('mid'))) {
        detectedPatterns.push('Divide & Conquer');
    }
    if (hasRecursion) {
        detectedPatterns.push('Recursion');
        if (lowercaseCode.includes('return solve') || lowercaseCode.includes('return helper') || lowercaseCode.includes('return dfs')) {
            detectedPatterns.push('Tail Recursion');
        }
    }

    // --- TIME COMPLEXITY HEURISTICS ---
    let timeComplexity = 'O(1)';
    let confidence = 'Low';

    if (detectedPatterns.includes('BFS') || detectedPatterns.includes('DFS')) {
        timeComplexity = 'O(V + E)';
        confidence = 'High';
    } else if (detectedPatterns.includes('Binary Lifting')) {
        timeComplexity = 'O(n log n)';
        confidence = 'High';
    } else if (detectedPatterns.includes('Segment Tree') || detectedPatterns.includes('Fenwick Tree')) {
        timeComplexity = 'O(log n)';
        confidence = 'High';
    } else if (detectedPatterns.includes('Binary Search')) {
        timeComplexity = 'O(log n)';
        confidence = 'High';
    } else if (detectedPatterns.includes('Merge Sort') || detectedPatterns.includes('Quick Sort') || detectedPatterns.includes('Heap Sort')) {
        timeComplexity = 'O(n log n)';
        confidence = 'High';
    } else if (hasRecursion && recursionCallsCount >= 2 && !detectedPatterns.includes('Dynamic Programming')) {
        timeComplexity = 'O(2^n)';
        confidence = 'Medium';
    } else if (maxLoopNesting === 1) {
        if (lowercaseCode.includes('sort') || detectedPatterns.includes('Greedy')) {
            timeComplexity = 'O(n log n)';
            confidence = 'High';
        } else {
            timeComplexity = 'O(n)';
            confidence = 'High';
        }
    } else if (maxLoopNesting === 2) {
        timeComplexity = 'O(n²)';
        confidence = 'High';
    } else if (maxLoopNesting >= 3) {
        timeComplexity = 'O(n³)';
        confidence = 'High';
    } else if (hasRecursion) {
        timeComplexity = 'O(n)';
        confidence = 'Medium';
    } else {
        timeComplexity = 'O(1)';
        confidence = 'High';
    }

    // --- SPACE COMPLEXITY HEURISTICS ---
    let spaceComplexity = 'O(1)';
    
    // Check space allocations
    const has2DArray = lowercaseCode.includes('dp =') && (lowercaseCode.includes('new array') || lowercaseCode.includes('array.from') || lowercaseCode.includes('vector<vector')) ||
                       lowercaseCode.includes('int[][]') || lowercaseCode.includes('double[][]') || lowercaseCode.includes('new int[') && lowercaseCode.includes('][');
    const has1DArray = lowercaseCode.includes('dp[') || lowercaseCode.includes('vector<int>') || lowercaseCode.includes('new int[') || lowercaseCode.includes('new array') || lowercaseCode.includes('array.from') ||
                       lowercaseCode.includes('new map') || lowercaseCode.includes('new set') || lowercaseCode.includes('hashmap') || lowercaseCode.includes('hashset') || lowercaseCode.includes('unordered_map') || lowercaseCode.includes('unordered_set');
    
    if (has2DArray || detectedPatterns.includes('Matrix Traversal')) {
        spaceComplexity = 'O(n²)';
    } else if (detectedPatterns.includes('BFS') || detectedPatterns.includes('DFS')) {
        spaceComplexity = 'O(V)';
    } else if (has1DArray || detectedPatterns.includes('Recursion') || detectedPatterns.includes('Memoization')) {
        spaceComplexity = 'O(n)';
    } else {
        spaceComplexity = 'O(1)';
    }

    // Dynamic Programming special check
    if (detectedPatterns.includes('Dynamic Programming')) {
        if (has2DArray) {
            spaceComplexity = 'O(n²)';
        } else if (has1DArray) {
            spaceComplexity = 'O(n)';
        }
    }

    // Clean detected patterns to keep them unique and sorted
    const uniquePatterns = Array.from(new Set(detectedPatterns));

    return {
        language,
        timeComplexity,
        spaceComplexity,
        confidence,
        detectedPatterns: uniquePatterns,
        notes: uniquePatterns.length > 0 
            ? `Estimated based on detecting: ${uniquePatterns.join(', ')}.`
            : 'Constant complexity execution block.'
    };
}

module.exports = {
    runAnalysis
};
