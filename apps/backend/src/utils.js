// utils.js - Helper functions for API comparisons
const axios = require('axios');

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

/**
 * Retries a fetch request multiple times with delay
 */
async function retryFetch(url, headers, retries = 3, delayMs = 1000) {
  let attempt = 0;
  let lastError = null;
  let startTime = Date.now();
  
  while (attempt < retries) {
    attempt++;
    try {
      const response = await axios({
        url,
        headers,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
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
 * Classify differences by type and count
 */
function classifyDiffs(diffs) {
  const counts = { added: 0, deleted: 0, changed: 0, array: 0, total: diffs.length };
  
  diffs.forEach(diff => {
    switch (diff.kind) {
      case 'N': // New
        counts.added++;
        break;
      case 'D': // Deleted
        counts.deleted++;
        break;
      case 'E': // Edited
        counts.changed++;
        break;
      case 'A': // Array change
        counts.array++;
        break;
    }
  });
  
  return counts;
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
  
  const normalizedConfig = { ...config };
  
  // Normalize endpoints
  if (Array.isArray(normalizedConfig.endpoints)) {
    const expandedEndpoints = [];
    
    // Process each endpoint
    normalizedConfig.endpoints.forEach(endpoint => {
      // Handle endpoints with platforms array by expanding them
      if (Array.isArray(endpoint.platforms) && endpoint.platforms.length > 0) {
        // Create one endpoint per platform
        endpoint.platforms.forEach(platform => {
          expandedEndpoints.push({
            ...endpoint,
            platform,          // Single platform string
            _originalFormat: 'platforms_array' // For debugging
          });
        });
      } 
      // Handle endpoints with single platform
      else if (endpoint.platform) {
        expandedEndpoints.push({
          ...endpoint,
          _originalFormat: 'single_platform' // For debugging
        });
      }
      // Handle invalid endpoints that somehow got here
      else {
        console.warn(`Skipping invalid endpoint without platform: ${endpoint.key}`);
      }
    });
    
    // Replace with expanded endpoints
    normalizedConfig.endpoints = expandedEndpoints;
  }
  
  // Ensure headers exist
  if (!normalizedConfig.headers) {
    normalizedConfig.headers = {};
  }
  
  // Ensure ids exist
  if (!normalizedConfig.ids) {
    normalizedConfig.ids = {};
  }
  
  // If no jobs but we have endpoints, create a default job structure
  if (!normalizedConfig.jobs && normalizedConfig.endpoints && normalizedConfig.endpoints.length > 0) {
    const endpointKeys = normalizedConfig.endpoints.map(ep => ep.key);
    normalizedConfig.jobs = [{
      name: 'API Comparison',
      platform: 'i', // Default platform
      ignorePaths: [],
      retryPolicy: { retries: 3, delayMs: 1000 },
      endpointsToRun: endpointKeys
    }];
    console.log(`Created default job in normalizeConfig for ${normalizedConfig.endpoints.length} endpoints`);
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
