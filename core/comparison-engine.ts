/**
 * 🎯 DELTA API SUITE - COMPARISON ENGINE
 * 
 * Advanced comparison engine for intelligent JSON diff analysis
 * Professional, maintainable, and world-class comparison logic
 */

import type { ComparisonResult, DiffItem } from '@/types';

// Advanced similarity matching for intelligent array comparison
const findBestMatch = (itemA: any, arrayB: any[], usedIndices: Set<number>): { match: any, index: number, similarity: number } | null => {
  let bestMatch: { match: any, index: number, similarity: number } | null = null;
  let bestSimilarity = 0;
  
  for (let i = 0; i < arrayB.length; i++) {
    if (usedIndices.has(i)) continue;
    
    const itemB = arrayB[i];
    const similarity = calculateSimilarity(itemA, itemB);
    
    if (similarity > bestSimilarity && similarity >= 0.5) {
      bestMatch = { match: itemB, index: i, similarity };
      bestSimilarity = similarity;
    }
  }
  
  return bestMatch;
};

// Calculate similarity between two objects (0-1 scale)
const calculateSimilarity = (a: any, b: any): number => {
  if (a === b) return 1.0;
  if (typeof a !== typeof b) return 0.0;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length === 0 && b.length === 0) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;
    
    // Calculate average similarity of array elements
    const similarities = a.map(itemA => {
      const bestMatch = findBestMatch(itemA, b, new Set());
      return bestMatch ? bestMatch.similarity : 0;
    });
    
    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }
  
  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    const allKeys = new Set([...keysA, ...keysB]);
    
    if (allKeys.size === 0) return 1.0;
    
    let matchingKeys = 0;
    let totalSimilarity = 0;
    
    for (const key of allKeys) {
      if (key in a && key in b) {
        matchingKeys++;
        totalSimilarity += calculateSimilarity(a[key], b[key]);
      }
    }
    
    const keySimilarity = matchingKeys / allKeys.size;
    const valueSimilarity = matchingKeys > 0 ? totalSimilarity / matchingKeys : 0;
    
    return (keySimilarity + valueSimilarity) / 2;
  }
  
  // For primitives, use string similarity
  const strA = String(a);
  const strB = String(b);
  
  if (strA === strB) return 1.0;
  if (strA.length === 0 && strB.length === 0) return 1.0;
  if (strA.length === 0 || strB.length === 0) return 0.0;
  
  // Simple Levenshtein distance-based similarity
  const distance = levenshteinDistance(strA, strB);
  const maxLength = Math.max(strA.length, strB.length);
  return 1 - (distance / maxLength);
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) {
    const row = matrix[0];
    if (row) row[i] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    const row = matrix[j];
    if (row) row[0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      const currentRow = matrix[j];
      const prevRow = matrix[j - 1];
      
      if (currentRow && prevRow) {
        currentRow[i] = Math.min(
          (currentRow[i - 1] ?? 0) + 1,     // deletion
          (prevRow[i] ?? 0) + 1,     // insertion
          (prevRow[i - 1] ?? 0) + indicator // substitution
        );
      }
    }
  }
  
  return matrix[str2.length]?.[str1.length] ?? 0;
};

// Count fields in an object for statistics
const countFields = (obj: any): number => {
  if (obj === null || obj === undefined) return 0;
  if (typeof obj !== 'object') return 1;
  if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countFields(item), 0);
  return Object.keys(obj).reduce((sum, key) => sum + countFields(obj[key]), 0);
};

/**
 * Main comparison function - the heart of our product
 * @param obj1 - Source object to compare
 * @param obj2 - Target object to compare
 * @param isOrderSensitive - Whether to use order-sensitive array comparison
 * @returns Detailed comparison result with differences and statistics
 */
export const compareJsonData = (obj1: any, obj2: any, isOrderSensitive: boolean = false): ComparisonResult => {
  const differences: DiffItem[] = [];
  
  const compare = (a: any, b: any, path: string = '') => {
    if (typeof a !== typeof b) {
      differences.push({
        path,
        type: 'type-changed',
        oldValue: a,
        newValue: b,
        description: `Type changed from ${typeof a} to ${typeof b}`
      });
      return;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (isOrderSensitive) {
        // Order-sensitive array comparison (strict positional matching)
        const maxLength = Math.max(a.length, b.length);
        for (let i = 0; i < maxLength; i++) {
          if (i >= a.length) {
            differences.push({
              path: `${path}[${i}]`,
              type: 'extra',
              oldValue: undefined,
              newValue: b[i],
              description: `Extra array item at position ${i} (order-sensitive)`
            });
          } else if (i >= b.length) {
            differences.push({
              path: `${path}[${i}]`,
              type: 'missing',
              oldValue: a[i],
              newValue: undefined,
              description: `Missing array item at position ${i} (order-sensitive)`
            });
          } else {
            compare(a[i], b[i], `${path}[${i}]`);
          }
        }
      } else {
        // TRULY INTELLIGENT ORDER-INSENSITIVE ARRAY COMPARISON
        // This is the core algorithm that makes our product world-class
        
        const usedIndicesInB = new Set<number>();
        const unmatchedFromA: Array<{item: any, originalIndex: number}> = [];
        
        // Phase 1: Find exact matches and high-similarity matches
        for (let i = 0; i < a.length; i++) {
          const itemA = a[i];
          const bestMatch = findBestMatch(itemA, b, usedIndicesInB);
          
          if (bestMatch && bestMatch.similarity >= 0.95) {
            // Exact or near-exact match found
            usedIndicesInB.add(bestMatch.index);
            
            if (bestMatch.similarity < 1.0) {
              // Items are similar but not identical - compare them for detailed differences
              compare(itemA, bestMatch.match, `${path}[${i}]`);
            }
            // If similarity is 1.0, items are identical - no differences to report
          } else if (bestMatch && bestMatch.similarity >= 0.7) {
            // Partial match - these are likely the same logical item with some changes
            usedIndicesInB.add(bestMatch.index);
            compare(itemA, bestMatch.match, `${path}[${i}]`);
          } else {
            // No good match found - this item might be missing from B
            unmatchedFromA.push({ item: itemA, originalIndex: i });
          }
        }
        
        // Phase 2: Identify truly missing items (from A but not in B)
        for (const unmatched of unmatchedFromA) {
          differences.push({
            path: `${path}[${unmatched.originalIndex}]`,
            type: 'missing',
            oldValue: unmatched.item,
            newValue: undefined,
            description: `Item from Source not found in Target (no similar match found)`
          });
        }
        
        // Phase 3: Identify truly extra items (in B but not matched with A)
        for (let j = 0; j < b.length; j++) {
          if (!usedIndicesInB.has(j)) {
          differences.push({
              path: `${path}[${j}]`,
              type: 'extra',
              oldValue: undefined,
              newValue: b[j],
            description: `Item in Target not found in Source`
            });
          }
        }
      }
      return;
    }

    if (typeof a === 'object' && a !== null && b !== null) {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in a)) {
          differences.push({
            path: newPath,
            type: 'extra',
            oldValue: undefined,
            newValue: b[key],
            description: `Property '${key}' exists only in Target`
          });
        } else if (!(key in b)) {
          differences.push({
            path: newPath,
            type: 'missing',
            oldValue: a[key],
            newValue: undefined,
            description: `Property '${key}' exists only in Source`
          });
        } else {
          compare(a[key], b[key], newPath);
        }
      }
      return;
    }

    if (a !== b) {
      differences.push({
        path,
        type: 'changed',
        oldValue: a,
        newValue: b,
        description: `Value changed from '${a}' to '${b}'`
      });
    }
  };

  compare(obj1, obj2);

  // Calculate summary statistics
  const totalFields = countFields(obj1) + countFields(obj2);
  const differentFields = differences.filter(d => d.type === 'changed' || d.type === 'type-changed').length;
  const missingFields = differences.filter(d => d.type === 'missing').length;
  const extraFields = differences.filter(d => d.type === 'extra').length;
  const identicalFields = Math.max(0, totalFields - differences.length);

  return {
    isMatch: differences.length === 0,
    identical: differences.length === 0,
    differences,
    summary: {
      totalDifferences: differences.length,
      totalFields,
      identicalFields,
      differentFields,
      missingFields,
      extraFields,
      added: extraFields,
      removed: missingFields,
      modified: differentFields
    }
  };
};
