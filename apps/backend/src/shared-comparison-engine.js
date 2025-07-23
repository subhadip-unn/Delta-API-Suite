/**
 * Shared Comparison Engine - Advanced JSON Comparison Logic
 * Extracted from DeltaPro+ for use in both frontend and backend
 * 
 * This engine provides:
 * - 3-phase intelligent array matching
 * - Semantic similarity analysis (95%/70% thresholds)
 * - Type-aware comparison
 * - Severity classification
 * - Order-insensitive comparison with fallback to order-sensitive
 */

/**
 * Calculate similarity between two objects using multiple strategies
 * @param {any} obj1 - First object to compare
 * @param {any} obj2 - Second object to compare
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarity(obj1, obj2) {
  if (obj1 === obj2) return 1.0;
  
  // Handle null/undefined cases
  if (obj1 == null || obj2 == null) return 0;
  
  // Type mismatch
  if (typeof obj1 !== typeof obj2) return 0;
  
  // For primitives, exact match or no match
  if (typeof obj1 !== 'object') {
    return obj1 === obj2 ? 1.0 : 0;
  }
  
  // For arrays, compare based on content similarity
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length === 0 && obj2.length === 0) return 1.0;
    if (obj1.length === 0 || obj2.length === 0) return 0;
    
    // Simple array similarity based on common elements
    const set1 = new Set(obj1.map(item => JSON.stringify(item)));
    const set2 = new Set(obj2.map(item => JSON.stringify(item)));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
  
  // For objects, compare based on key-value similarity
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);
  
  if (allKeys.size === 0) return 1.0;
  
  let matchingKeys = 0;
  let totalWeight = 0;
  
  for (const key of allKeys) {
    totalWeight++;
    if (key in obj1 && key in obj2) {
      const similarity = calculateSimilarity(obj1[key], obj2[key]);
      matchingKeys += similarity;
    }
    // Keys that exist in only one object contribute 0 to similarity
  }
  
  return matchingKeys / totalWeight;
}

/**
 * Find the best match for an item in an array
 * @param {any} item - Item to find match for
 * @param {Array} array - Array to search in
 * @param {Set} usedIndices - Set of already used indices
 * @returns {Object|null} - Best match with similarity score and index
 */
function findBestMatch(item, array, usedIndices) {
  let bestMatch = null;
  let bestSimilarity = 0;
  let bestIndex = -1;
  
  for (let i = 0; i < array.length; i++) {
    if (usedIndices.has(i)) continue;
    
    const similarity = calculateSimilarity(item, array[i]);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = array[i];
      bestIndex = i;
    }
  }
  
  return bestMatch ? { match: bestMatch, similarity: bestSimilarity, index: bestIndex } : null;
}

/**
 * Get severity level based on path and change type
 * @param {string} path - JSON path of the change
 * @param {string} changeType - Type of change (missing, extra, changed, type-changed)
 * @returns {string} - Severity level (critical, high, medium, low)
 */
function getSeverity(path, changeType) {
  // Critical: Type changes and core data structure changes
  if (changeType === 'type-changed') {
    return 'critical';
  }
  
  // High: Core business data, IDs, status fields
  if (path.includes('id') || path.includes('status') || path.includes('state') || 
      path.includes('error') || path.includes('success') || path.includes('data.')) {
    return 'high';
  }
  
  // Medium: Metadata, timestamps, counts
  if (path.includes('timestamp') || path.includes('count') || path.includes('total') || 
      path.includes('meta') || path.includes('time') || path.includes('date')) {
    return 'medium';
  }
  
  // Low: Everything else
  return 'low';
}

/**
 * Advanced JSON comparison with 3-phase intelligent matching
 * @param {any} obj1 - First object (Live API)
 * @param {any} obj2 - Second object (New API)
 * @param {Object} options - Comparison options
 * @returns {Object} - Comparison result with differences and summary
 */
function compareAdvanced(obj1, obj2, options = {}) {
  const { isOrderSensitive = false, ignorePaths = [] } = options;
  const differences = [];
  
  const compare = (a, b, path = '') => {
    // Type mismatch detection
    if (typeof a !== typeof b) {
      const severity = getSeverity(path, 'type-changed');
      differences.push({
        kind: 'E', // Changed
        path: path.split('.').filter(p => p),
        lhs: a,
        rhs: b,
        severity,
        changeType: 'type-changed',
        description: `Type changed from ${typeof a} to ${typeof b}`
      });
      return;
    }

    // Array comparison with 3-phase intelligent matching
    if (Array.isArray(a) && Array.isArray(b)) {
      if (isOrderSensitive) {
        // Order-sensitive comparison (strict positional matching)
        const maxLength = Math.max(a.length, b.length);
        for (let i = 0; i < maxLength; i++) {
          if (i >= a.length) {
            const severity = getSeverity(`${path}[${i}]`, 'extra');
            differences.push({
              kind: 'N', // New
              path: path.split('.').filter(p => p).concat([i]),
              rhs: b[i],
              severity,
              changeType: 'added',
              description: `Extra array item at position ${i} (order-sensitive)`
            });
          } else if (i >= b.length) {
            const severity = getSeverity(`${path}[${i}]`, 'missing');
            differences.push({
              kind: 'D', // Deleted
              path: path.split('.').filter(p => p).concat([i]),
              lhs: a[i],
              severity,
              changeType: 'removed',
              description: `Missing array item at position ${i} (order-sensitive)`
            });
          } else {
            compare(a[i], b[i], `${path}[${i}]`);
          }
        }
      } else {
        // ADVANCED ORDER-INSENSITIVE ARRAY COMPARISON (3-Phase Algorithm)
        const usedIndicesInB = new Set();
        const unmatchedFromA = [];
        
        // Phase 1: Find exact matches and high-similarity matches (95%+ threshold)
        for (let i = 0; i < a.length; i++) {
          const itemA = a[i];
          const bestMatch = findBestMatch(itemA, b, usedIndicesInB);
          
          if (bestMatch && bestMatch.similarity >= 0.95) {
            // Exact or near-exact match found
            usedIndicesInB.add(bestMatch.index);
            
            if (bestMatch.similarity < 1.0) {
              // Items are similar but not identical - compare for detailed differences
              compare(itemA, bestMatch.match, `${path}[${i}]`);
            }
            // If similarity is 1.0, items are identical - no differences to report
          } else if (bestMatch && bestMatch.similarity >= 0.7) {
            // Partial match (70%+ threshold) - likely same logical item with changes
            usedIndicesInB.add(bestMatch.index);
            compare(itemA, bestMatch.match, `${path}[${i}]`);
          } else {
            // No good match found - this item might be missing from B
            unmatchedFromA.push({ item: itemA, originalIndex: i });
          }
        }
        
        // Phase 2: Identify truly missing items (from A but not in B)
        for (const unmatched of unmatchedFromA) {
          const severity = getSeverity(`${path}[${unmatched.originalIndex}]`, 'missing');
          differences.push({
            kind: 'D', // Deleted
            path: path.split('.').filter(p => p).concat([unmatched.originalIndex]),
            lhs: unmatched.item,
            severity,
            changeType: 'removed',
            description: `Item from Live API not found in New API (no similar match found)`
          });
        }
        
        // Phase 3: Identify truly extra items (in B but not matched with A)
        for (let j = 0; j < b.length; j++) {
          if (!usedIndicesInB.has(j)) {
            const severity = getSeverity(`${path}[${j}]`, 'extra');
            differences.push({
              kind: 'N', // New
              path: path.split('.').filter(p => p).concat([j]),
              rhs: b[j],
              severity,
              changeType: 'added',
              description: `New item in New API not found in Live API`
            });
          }
        }
      }
      return;
    }

    // Object comparison
    if (typeof a === 'object' && a !== null && b !== null) {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in a)) {
          const severity = getSeverity(newPath, 'extra');
          differences.push({
            kind: 'N', // New
            path: newPath.split('.').filter(p => p),
            rhs: b[key],
            severity,
            changeType: 'added',
            description: `New key '${key}' added`
          });
        } else if (!(key in b)) {
          const severity = getSeverity(newPath, 'missing');
          differences.push({
            kind: 'D', // Deleted
            path: newPath.split('.').filter(p => p),
            lhs: a[key],
            severity,
            changeType: 'removed',
            description: `Key '${key}' removed`
          });
        } else {
          compare(a[key], b[key], newPath);
        }
      }
      return;
    }

    // Primitive value comparison
    if (a !== b) {
      const severity = getSeverity(path, 'changed');
      differences.push({
        kind: 'E', // Edited
        path: path.split('.').filter(p => p),
        lhs: a,
        rhs: b,
        severity,
        changeType: 'modified',
        description: `Value changed from '${a}' to '${b}'`
      });
    }
  };

  // Start comparison
  compare(obj1, obj2);

  // Filter out ignored paths
  const filteredDifferences = differences.filter(diff => {
    const pathStr = Array.isArray(diff.path) ? diff.path.join('.') : String(diff.path);
    return !ignorePaths.some(ignorePath => pathStr.includes(ignorePath));
  });

  // Calculate summary statistics
  const counts = { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

  filteredDifferences.forEach(diff => {
    // Count by kind
    switch (diff.kind) {
      case 'N': counts.added++; break;
      case 'D': counts.deleted++; break;
      case 'E': counts.changed++; break;
      case 'A': counts.array++; break;
    }
    
    // Count by severity
    if (severityCounts[diff.severity] !== undefined) {
      severityCounts[diff.severity]++;
    }
  });

  counts.total = counts.added + counts.deleted + counts.changed + counts.array;

  const summary = {
    totalDifferences: counts.total,
    byType: counts,
    bySeverity: severityCounts,
    identical: counts.total === 0
  };

  return {
    diffs: filteredDifferences,
    counts,
    summary,
    identical: counts.total === 0
  };
}

module.exports = {
  compareAdvanced,
  calculateSimilarity,
  findBestMatch,
  getSeverity
};
