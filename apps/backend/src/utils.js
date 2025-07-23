// utils.js - Helper functions for API comparisons

// Disable TLS certificate verification for staging/dev environments
// This allows connections to staging servers with self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require('axios');
const https = require('https');

/**
 * Builds a complete URL with base URL, path and query parameters
 * Handles undefined or null baseUrl and path values
 */
function buildUrl(baseUrl, path, queryParams = {}) {
  // Check if baseUrl is defined
  if (!baseUrl) {
    console.warn('Warning: baseUrl is undefined or null in buildUrl');
    return '';
  }
  
  // Check if path is defined
  if (!path) {
    console.warn('Warning: path is undefined or null in buildUrl');
    path = '';
  }
  
  // Ensure baseUrl has no trailing slash
  const baseUrlClean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure path starts with a slash
  const pathClean = path.startsWith('/') ? path : `/${path}`;
  
  // Build query string
  let queryString = '';
  const queryKeys = Object.keys(queryParams);
  if (queryKeys.length > 0) {
    queryString = '?' + queryKeys
      .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
      .map(key => {
        const value = queryParams[key];
        if (Array.isArray(value)) {
          return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
  
  return `${baseUrlClean}${pathClean}${queryString}`;
}

// Create axios instance with TLS certificate bypass for staging environments
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ 
    rejectUnauthorized: false // Allow self-signed certificates
  }),
  timeout: 30000, // 30 second timeout
  validateStatus: null // Don't throw on HTTP error status
});

/**
 * Retries a fetch request multiple times with delay
 */
async function retryFetch(url, headers, retries = 3, delayMs = 1000) {
  let lastError = null;
  let startTime = Date.now();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${retries} for ${url}`);
      
      const response = await axiosInstance.get(url, {
        headers
      });
      
      const responseTimeMs = Date.now() - startTime;
      
      // Handle success case
      return {
        success: true,
        data: response.data,
        status: response.status,
        error: null,
        responseTimeMs
      };
    } catch (err) {
      lastError = err;
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        startTime = Date.now(); // Reset timer for the retry
      }
    }
  }
  
  const responseTimeMs = Date.now() - startTime;
  return {
    success: false,
    data: null,
    status: null, 
    error: lastError?.message || 'Unknown error',
    responseTimeMs
  };
}

/**
 * Filter out diffs according to ignorePaths
 */
function filterDiffs(diffs, ignorePaths) {
  if (!diffs || !Array.isArray(diffs) || diffs.length === 0) return [];
  if (!ignorePaths || !Array.isArray(ignorePaths) || ignorePaths.length === 0) return diffs;
  
  return diffs.filter(diff => {
    if (!diff.path) return true;
    
    // Check if any ignore path matches the current diff path
    const pathStr = diff.path.join('.');
    return !ignorePaths.some(pattern => {
      if (typeof pattern === 'string') {
        return pathStr === pattern || pathStr.startsWith(`${pattern}.`);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(pathStr);
      }
      return false;
    });
  });
}

/**
 * Smart array-aware diff function that handles reordering intelligently
 * @param {*} obj1 - First object to compare
 * @param {*} obj2 - Second object to compare
 * @param {Array} path - Current path in the object tree
 * @returns {Array} - Array of smart diff objects
 */
function smartArrayDiff(obj1, obj2, path = []) {
  const diffs = [];
  
  // Handle arrays specially
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    // For arrays with objects that have unique IDs, compare by ID
    if (obj1.length > 0 && obj2.length > 0 && 
        typeof obj1[0] === 'object' && typeof obj2[0] === 'object') {
      
      // Try to find a unique identifier
      const getUniqueId = (item) => {
        // Common ID patterns in APIs
        if (item.match?.matchInfo?.matchId) return item.match.matchInfo.matchId;
        if (item.matchId) return item.matchId;
        if (item.id) return item.id;
        if (item.key) return item.key;
        if (item.name) return item.name;
        if (item.teamId) return item.teamId;
        if (item.seriesId) return item.seriesId;
        return JSON.stringify(item); // fallback to full object comparison
      };
      
      const obj1ById = new Map(obj1.map(item => [getUniqueId(item), item]));
      const obj2ById = new Map(obj2.map(item => [getUniqueId(item), item]));
      
      // Check for missing items (high priority)
      for (const [id, item] of obj1ById) {
        if (!obj2ById.has(id)) {
          diffs.push({
            kind: 'D',
            path: [...path],
            lhs: item,
            severity: 'Error',
            priority: 3,
            changeType: 'structural',
            message: `Item with ID ${id} was removed from array`
          });
        }
      }
      
      // Check for new items (high priority)
      for (const [id, item] of obj2ById) {
        if (!obj1ById.has(id)) {
          diffs.push({
            kind: 'N',
            path: [...path],
            rhs: item,
            severity: 'Error',
            priority: 3,
            changeType: 'structural',
            message: `Item with ID ${id} was added to array`
          });
        }
      }
      
      // Check for changes in existing items
      for (const [id, item1] of obj1ById) {
        const item2 = obj2ById.get(id);
        if (item2) {
          const itemDiffs = smartArrayDiff(item1, item2, [...path, `[${id}]`]);
          diffs.push(...itemDiffs);
        }
      }
      
      // Check for reordering (low priority) - only if same items exist
      const ids1 = Array.from(obj1ById.keys());
      const ids2 = Array.from(obj2ById.keys());
      const sameItems = ids1.length === ids2.length && ids1.every(id => obj2ById.has(id));
      
      if (sameItems) {
        const order1 = obj1.map(getUniqueId);
        const order2 = obj2.map(getUniqueId);
        if (JSON.stringify(order1) !== JSON.stringify(order2)) {
          diffs.push({
            kind: 'A',
            path: [...path],
            severity: 'Info',
            priority: 1,
            changeType: 'structural',
            message: 'Array items reordered (same content, different sequence)',
            reordering: true
          });
        }
      }
      
      return diffs;
    }
    
    // For primitive arrays or arrays without clear IDs, fall back to index comparison
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= obj1.length) {
        diffs.push({
          kind: 'N',
          path: [...path, i],
          rhs: obj2[i],
          severity: 'Warning',
          priority: 2,
          changeType: 'structural',
          message: `Array item added at index ${i}`
        });
      } else if (i >= obj2.length) {
        diffs.push({
          kind: 'D',
          path: [...path, i],
          lhs: obj1[i],
          severity: 'Warning',
          priority: 2,
          changeType: 'structural',
          message: `Array item removed at index ${i}`
        });
      } else {
        const itemDiffs = smartArrayDiff(obj1[i], obj2[i], [...path, i]);
        diffs.push(...itemDiffs);
      }
    }
    
    return diffs;
  }
  
  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 !== null && obj2 !== null) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Check for deleted keys (proto issue - missing keys)
    for (const key of keys1) {
      if (!(key in obj2)) {
        diffs.push({
          kind: 'D',
          path: [...path, key],
          lhs: obj1[key],
          severity: 'Error',
          priority: 3,
          changeType: 'structural',
          message: `Key '${key}' was removed (possible proto issue)`
        });
      }
    }
    
    // Check for new keys
    for (const key of keys2) {
      if (!(key in obj1)) {
        diffs.push({
          kind: 'N',
          path: [...path, key],
          rhs: obj2[key],
          severity: 'Warning',
          priority: 2,
          changeType: 'structural',
          message: `Key '${key}' was added`
        });
      }
    }
    
    // Check for changed values
    for (const key of keys1) {
      if (key in obj2) {
        if (typeof obj1[key] === 'object' || typeof obj2[key] === 'object') {
          const nestedDiffs = smartArrayDiff(obj1[key], obj2[key], [...path, key]);
          diffs.push(...nestedDiffs);
        } else if (obj1[key] !== obj2[key]) {
          // Classify the type of change
          const pathStr = [...path, key].join('.');
          let severity = 'Warning';
          let priority = 2;
          let message = `Value '${key}' changed from '${obj1[key]}' to '${obj2[key]}'`;
          
          // Check if it's a timestamp field (should be ignored or low priority)
          if (isTimestampField(pathStr)) {
            severity = 'Info';
            priority = 1;
            message = `Timestamp field '${key}' updated (expected)`;
          }
          // Check if it's a numeric change (less severe)
          else if (isNumericValueChange(obj1[key], obj2[key])) {
            severity = 'Warning';
            priority = 2;
            message = `Numeric value '${key}' changed from ${obj1[key]} to ${obj2[key]}`;
          }
          // Check for type changes (more severe)
          else if (typeof obj1[key] !== typeof obj2[key]) {
            severity = 'Error';
            priority = 3;
            message = `Type changed for '${key}': ${typeof obj1[key]} → ${typeof obj2[key]} (${obj1[key]} → ${obj2[key]})`;
          }
          
          diffs.push({
            kind: 'E',
            path: [...path, key],
            lhs: obj1[key],
            rhs: obj2[key],
            severity,
            priority,
            changeType: 'value',
            message
          });
        }
      }
    }
    
    return diffs;
  }
  
  // Handle primitive values
  if (obj1 !== obj2) {
    const pathStr = path.join('.');
    let severity = 'Warning';
    let priority = 2;
    let message = `Value changed from '${obj1}' to '${obj2}'`;
    
    if (isTimestampField(pathStr)) {
      severity = 'Info';
      priority = 1;
      message = `Timestamp value updated (expected)`;
    } else if (typeof obj1 !== typeof obj2) {
      severity = 'Error';
      priority = 3;
      message = `Type changed: ${typeof obj1} → ${typeof obj2} (${obj1} → ${obj2})`;
    }
    
    diffs.push({
      kind: 'E',
      path: [...path],
      lhs: obj1,
      rhs: obj2,
      severity,
      priority,
      changeType: 'value',
      message
    });
  }
  
  return diffs;
}

/**
 * Classify diffs with enhanced analysis using smart array comparison
 * @param {*} dataA - First object to compare
 * @param {*} dataB - Second object to compare
 * @returns {Object} - Enhanced diff analysis with counts and classifications
 */
function classifyDiffs(dataA, dataB) {
  if (!dataA || !dataB) {
    return {
      diffs: [],
      counts: { added: 0, deleted: 0, changed: 0, array: 0, total: 0 },
      summary: null
    };
  }
  
  // Use smart array diff instead of basic deep-diff
  const smartDiffs = smartArrayDiff(dataA, dataB);
  
  const counts = { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
  
  smartDiffs.forEach(diff => {
    // Count by kind
    switch (diff.kind) {
      case 'N': counts.added++; break;
      case 'D': counts.deleted++; break;
      case 'E': counts.changed++; break;
      case 'A': counts.array++; break;
    }
  });
  
  counts.total = counts.added + counts.deleted + counts.changed + counts.array;
  
  const summary = generateDiffSummary(counts, smartDiffs);
  
  return {
    diffs: smartDiffs,
    counts,
    summary
  };
}

/**
 * Classify individual diff with severity, priority, and changeType (legacy function)
 */
function classifyIndividualDiff(diff) {
  const path = Array.isArray(diff.path) ? diff.path.join('.') : String(diff.path || '');
  let severity = 'Info';
  let priority = 1;
  let changeType = 'value';
  let message = '';
  
  switch (diff.kind) {
    case 'N': // New property added
      severity = 'Error'; // New fields are structural changes
      priority = 3;
      changeType = 'structural';
      message = `New property '${path}' added`;
      break;
      
    case 'D': // Property deleted
      severity = 'Error'; // Deleted fields are structural changes
      priority = 3;
      changeType = 'structural';
      message = `Property '${path}' deleted`;
      break;
      
    case 'E': // Property edited
      // Check if it's a numeric change (less severe) or structural change
      const isNumericChange = isNumericValueChange(diff.lhs, diff.rhs);
      const isTimestampChange = isTimestampField(path);
      
      if (isTimestampChange) {
        severity = 'Info';
        priority = 1;
        message = `Timestamp field '${path}' changed`;
      } else if (isNumericChange) {
        severity = 'Warning';
        priority = 2;
        message = `Numeric value '${path}' changed from ${diff.lhs} to ${diff.rhs}`;
      } else {
        severity = 'Error';
        priority = 3;
        message = `Value '${path}' changed from '${diff.lhs}' to '${diff.rhs}'`;
      }
      changeType = 'value';
      break;
      
    case 'A': // Array change
      if (diff.item && diff.item.kind === 'N') {
        severity = 'Warning';
        priority = 2;
        changeType = 'structural';
        message = `Array item added at '${path}[${diff.index}]'`;
      } else if (diff.item && diff.item.kind === 'D') {
        severity = 'Warning';
        priority = 2;
        changeType = 'structural';
        message = `Array item deleted at '${path}[${diff.index}]'`;
      } else {
        severity = 'Warning';
        priority = 2;
        changeType = 'value';
        message = `Array item modified at '${path}[${diff.index}]'`;
      }
      break;
  }
  
  return {
    ...diff,
    severity,
    priority,
    changeType,
    message,
    path: path
  };
}

/**
 * Check if a value change is numeric (less severe)
 */
function isNumericValueChange(oldVal, newVal) {
  return (typeof oldVal === 'number' && typeof newVal === 'number') ||
         (!isNaN(parseFloat(oldVal)) && !isNaN(parseFloat(newVal)));
}

/**
 * Check if a field is a timestamp field (should be ignored or low priority)
 */
function isTimestampField(path) {
  const timestampFields = ['timestamp', 'lastModified', 'createdAt', 'updatedAt', 'time', 'date'];
  return timestampFields.some(field => path.toLowerCase().includes(field.toLowerCase()));
}

/**
 * Generate summary of diff analysis
 */
function generateDiffSummary(counts, classifiedDiffs) {
  const severityCounts = {
    Error: 0,
    Warning: 0,
    Info: 0
  };
  
  const changeTypeCounts = {
    structural: 0,
    value: 0
  };
  
  classifiedDiffs.forEach(diff => {
    severityCounts[diff.severity] = (severityCounts[diff.severity] || 0) + 1;
    changeTypeCounts[diff.changeType] = (changeTypeCounts[diff.changeType] || 0) + 1;
  });
  
  return {
    totalDiffs: counts.total,
    severityCounts,
    changeTypeCounts,
    hasStructuralChanges: changeTypeCounts.structural > 0,
    hasCriticalErrors: severityCounts.Error > 0
  };
}

/**
 * Gets Indian Standard Time timestamp
 */
function getIndianTimestamp() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  let day, month, year, hour, minute, second;
  for (const p of parts) {
    if (p.type === "day") day = p.value;
    if (p.type === "month") month = p.value;
    if (p.type === "year") year = p.value;
    if (p.type === "hour") hour = p.value;
    if (p.type === "minute") minute = p.value;
    if (p.type === "second") second = p.value;
  }
  
  // Folder-name friendly: "YYYY-MM-DD_HH-MM-SS"
  const folderTs = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
  // Human-readable: "YYYY-MM-DD HH:MM:SS"
  const humanTs = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  
  return { folderTs, humanTs };
}

/**
 * Normalizes the config data structure to ensure consistent format
 * between frontend and backend data models
 * 
 * @param {Object} config - The configuration object received from frontend
 * @returns {Object} - Normalized configuration object
 */
function normalizeConfig(config) {
  if (!config) return {};
  
  console.log('🔧 [CONFIG-NORMALIZE] Starting config normalization...');
  console.log('📥 [CONFIG-INPUT] Received config:', JSON.stringify(config, null, 2));
  
  const normalizedConfig = { ...config };
  
  // Get available platforms from jobs or headers
  const availablePlatforms = [];
  if (config.jobs && Array.isArray(config.jobs)) {
    config.jobs.forEach(job => {
      if (job.platform && !availablePlatforms.includes(job.platform)) {
        availablePlatforms.push(job.platform);
      }
    });
  }
  if (config.headers && typeof config.headers === 'object') {
    Object.keys(config.headers).forEach(platform => {
      if (!availablePlatforms.includes(platform)) {
        availablePlatforms.push(platform);
      }
    });
  }
  
  console.log('📱 [PLATFORMS] Available platforms:', availablePlatforms);
  
  // Normalize endpoints - expand each endpoint for each platform
  if (Array.isArray(normalizedConfig.endpoints)) {
    const expandedEndpoints = [];
    
    // Process each endpoint
    normalizedConfig.endpoints.forEach(endpoint => {
      console.log(`🔗 [ENDPOINT] Processing endpoint: ${endpoint.key}`);
      
      // If endpoint already has platforms array, use it
      if (Array.isArray(endpoint.platforms) && endpoint.platforms.length > 0) {
        endpoint.platforms.forEach(platform => {
          expandedEndpoints.push({
            ...endpoint,
            platform,
            _originalFormat: 'platforms_array'
          });
        });
        console.log(`  ✅ Expanded for platforms: ${endpoint.platforms.join(', ')}`);
      } 
      // If endpoint has single platform, use it
      else if (endpoint.platform) {
        expandedEndpoints.push({
          ...endpoint,
          _originalFormat: 'single_platform'
        });
        console.log(`  ✅ Single platform: ${endpoint.platform}`);
      }
      // If no platform specified, expand for all available platforms
      else if (availablePlatforms.length > 0) {
        availablePlatforms.forEach(platform => {
          expandedEndpoints.push({
            ...endpoint,
            platform,
            _originalFormat: 'auto_expanded'
          });
        });
        console.log(`  ✅ Auto-expanded for platforms: ${availablePlatforms.join(', ')}`);
      }
      // Fallback: create for default platform 'i'
      else {
        expandedEndpoints.push({
          ...endpoint,
          platform: 'i',
          _originalFormat: 'fallback_default'
        });
        console.log(`  ⚠️ Fallback to default platform: i`);
      }
    });
    
    // Replace with expanded endpoints
    normalizedConfig.endpoints = expandedEndpoints;
    console.log(`📊 [EXPANSION] Expanded ${config.endpoints.length} endpoints to ${expandedEndpoints.length} platform-specific endpoints`);
  }
  
  // Ensure headers exist
  if (!normalizedConfig.headers) {
    normalizedConfig.headers = {};
  }
  
  // Ensure ids exist
  if (!normalizedConfig.ids) {
    normalizedConfig.ids = {};
  }
  
  // If no jobs but we have endpoints, create platform-specific jobs
  if (!normalizedConfig.jobs && normalizedConfig.endpoints && normalizedConfig.endpoints.length > 0) {
    console.log('🚀 [JOB-CREATION] Creating default jobs for each platform...');
    
    // Group endpoints by platform
    const endpointsByPlatform = {};
    normalizedConfig.endpoints.forEach(endpoint => {
      const platform = endpoint.platform || 'i';
      if (!endpointsByPlatform[platform]) {
        endpointsByPlatform[platform] = [];
      }
      endpointsByPlatform[platform].push(endpoint.key);
    });
    
    // Create a job for each platform
    normalizedConfig.jobs = [];
    Object.keys(endpointsByPlatform).forEach(platform => {
      const platformName = {
        'i': 'iOS',
        'a': 'Android', 
        'm': 'Mobile Web',
        'w': 'Desktop Web'
      }[platform] || platform;
      
      normalizedConfig.jobs.push({
        id: `default-${platform}`,
        name: `${platformName} API Comparison`,
        platform: platform,
        ignorePaths: [],
        retryPolicy: { retries: 3, delayMs: 1000 },
        endpointPairs: endpointsByPlatform[platform],
        endpointsToRun: endpointsByPlatform[platform]
      });
      
      console.log(`  ✅ Created job for ${platformName} (${platform}) with ${endpointsByPlatform[platform].length} endpoints`);
    });
    
    console.log(`🎆 [JOB-SUMMARY] Created ${normalizedConfig.jobs.length} platform-specific jobs for ${normalizedConfig.endpoints.length} endpoints`);
  }
  
  return normalizedConfig;
}

module.exports = {
  buildUrl,
  retryFetch,
  filterDiffs,
  classifyDiffs,
  getIndianTimestamp,
  normalizeConfig
};
