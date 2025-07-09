// comparator.js - Core comparison logic 
const DeepDiff = require('deep-diff').diff;
const pLimit = require('p-limit').default || require('p-limit');
const { buildUrl, retryFetch, filterDiffs, classifyDiffs } = require('./utils');

/**
 * Run a job with the given configuration
 */
async function runJob(jobConfig, headers, ids, endpoints) {
  const platform = jobConfig.platform;            // "i" | "a" | "m" | "w"
  const headersTempl = headers[platform] || {};   // Platform-specific headers
  const ignorePaths = jobConfig.ignorePaths || [];
  const retries = jobConfig.retryPolicy?.retries || 3;
  const delayMs = jobConfig.retryPolicy?.delayMs || 1000;
  
  // Allow configurable concurrency limit (default 5)
  const concurrencyLimit = 5;
  const limit = pLimit(concurrencyLimit);        // max N parallel comparisons

  // Log the job configuration and available endpoints
  console.log(`Processing job: ${jobConfig.name} for platform: ${platform}`);
  console.log(`Available endpoints: ${endpoints.length}`);
  
  /**
   * Helper function to find an endpoint by key and platform
   * Handles both legacy format (endpoint.platform) and new format (endpoint.platforms array)
   * @param {string} endpointKey - The endpoint key to find
   * @returns {Object|null} - The matched endpoint or null if not found
   */
  function findEndpointForPlatform(endpointKey) {
    if (!endpointKey) {
      console.warn(`Missing endpoint key in job: ${jobConfig.name}`);
      return null;
    }
    
    // Find endpoint by key first
    const endpoint = endpoints.find(e => e.key === endpointKey);
    if (!endpoint) {
      console.warn(`Endpoint not found with key: ${endpointKey}`);
      return null;
    }
    
    // Now check if this endpoint supports the job's platform
    // Handle both formats: endpoint.platform (string) or endpoint.platforms (array)
    const platformMatches = 
      endpoint.platform === platform || 
      (Array.isArray(endpoint.platforms) && endpoint.platforms.includes(platform));
    
    if (!platformMatches) {
      console.warn(`Endpoint ${endpointKey} does not support platform ${platform}`);
      console.warn(`Available platforms: ${JSON.stringify(endpoint.platform || endpoint.platforms)}`);
      return null;
    }
    
    // Create a normalized copy of the endpoint with consistent platform property
    const normalizedEndpoint = {
      ...endpoint,
      platform: platform // Ensure consistent platform property
    };
    
    return normalizedEndpoint;
  }
  
  // Process endpoint pairs for comparison
  let endpointPairs = [];
  
  if (Array.isArray(jobConfig.endpointPairs) && jobConfig.endpointPairs.length > 0) {
    // Modern format: use explicit pairs: [{endpointA, endpointB}, ...]
    console.log(`Job uses ${jobConfig.endpointPairs.length} explicit endpoint pairs`);
    
    for (const pair of jobConfig.endpointPairs) {
      const epA = findEndpointForPlatform(pair.endpointA);
      const epB = findEndpointForPlatform(pair.endpointB);
      
      if (epA && epB) {
        endpointPairs.push({ epA, epB });
      } else {
        console.warn(`Skipping endpoint pair ${pair.endpointA} <-> ${pair.endpointB} (one or both not found)`);
      }
    }
  } else {
    // Legacy format: endpointsToRun (compare same endpoint on both sides)
    console.log('Job uses legacy endpointsToRun format');
    
    // Get all endpoints that match the platform (in either format)
    const platformEndpoints = endpoints.filter(e => 
      e.platform === platform || 
      (Array.isArray(e.platforms) && e.platforms.includes(platform))
    ).map(e => ({
      ...e,
      platform // Normalize to single platform format
    }));
    
    if (Array.isArray(jobConfig.endpointsToRun) && jobConfig.endpointsToRun.length > 0) {
      const filteredEndpoints = platformEndpoints.filter(e =>
        jobConfig.endpointsToRun.includes(e.key)
      );
      
      // Use the same endpoint for both sides
      endpointPairs = filteredEndpoints.map(e => ({ epA: e, epB: e }));
    } else {
      // Use all endpoints for this platform
      endpointPairs = platformEndpoints.map(e => ({ epA: e, epB: e }));
    }
  }
  
  console.log(`Final endpoint pairs for job: ${endpointPairs.length}`);
  if (endpointPairs.length === 0) {
    console.warn(`WARNING: No valid endpoint pairs found for job ${jobConfig.name}. Check platform and endpoint configuration.`);
  }

  // Check if we're in quick mode
  const isQuick = jobConfig.quickMode === true;
  
  // Determine list of geos - in quick mode, only use first geo
  const geoList = Array.isArray(headersTempl["cb-loc"])
    ? (isQuick ? [headersTempl["cb-loc"][0]] : headersTempl["cb-loc"])
    : [headersTempl["cb-loc"]];

  // Create a fresh response cache for this job only
  const responseCache = new Map();
  
  // Helper function to cache API responses
  async function cachedFetch(url, headers, retries, delayMs) {
    const cacheKey = `${url}|${JSON.stringify(headers)}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      return { 
        success: true, 
        data: cached.data, 
        status: cached.status, 
        error: null, 
        responseTimeMs: 0 
      };
    }
    
    const result = await retryFetch(url, headers, retries, delayMs);
    if (result.success) {
      responseCache.set(cacheKey, { data: result.data, status: result.status });
    }
    return result;
  }
  
  const allRecords = [];
  const tasks = [];
  
  // For each geo in our list
  for (const geo of geoList) {
    // Make a copy of headers for this geo
    const geoHeaders = { ...headersTempl };
    if (geoHeaders["cb-loc"]) {
      geoHeaders["cb-loc"] = geo;
    }
    
    // For each endpoint pair
    for (const pair of endpointPairs) {
      const { epA, epB } = pair;
      
      // For each ID category/value (or just once if no IDs needed)
      let idValues = [{category: null, value: null}]; // Default: no ID substitution
      
      // If endpoint specifies an ID category and we have values for it
      if (epA.idCategory && ids && ids[epA.idCategory]) {
        idValues = ids[epA.idCategory].map(id => ({
          category: epA.idCategory,
          value: id.value,
          name: id.name
        }));
        
        // In quick mode, only use first ID
        if (isQuick) {
          idValues = idValues.slice(0, 1);
        }
      }
      
      // For each ID value (or the one null value if no IDs needed)
      for (const idObj of idValues) {
        // Create the async comparison task
        tasks.push(limit(async () => {
          try {
            // Create copies of the headers for URL A and URL B
            const headersA = { ...geoHeaders };
            const headersB = { ...geoHeaders };
            
            // Substitute the ID into the path if needed
            let pathA = epA.path;
            let pathB = epB.path;
            
            if (idObj.value && idObj.category) {
              const idPattern = new RegExp(`{${idObj.category}}`, 'g');
              pathA = pathA.replace(idPattern, idObj.value);
              pathB = pathB.replace(idPattern, idObj.value);
            }
            
            // Build the full URLs
            // Check if we have valid base URLs and paths
            let urlA = '';
            let urlB = '';
            
            try {
              // Handle baseUrl vs baseA/baseB naming inconsistency
              // First check for job-specific baseUrlA/baseUrlB
              let baseUrlA = jobConfig.baseUrlA || jobConfig.baseA;
              let baseUrlB = jobConfig.baseUrlB || jobConfig.baseB;
              
              console.log(`Using base URLs: A=${baseUrlA}, B=${baseUrlB}`);
              
              // Validate baseUrls
              if (!baseUrlA) {
                console.error(`Missing base URL A for job ${jobConfig.name}`);
              }
              if (!baseUrlB) {
                console.error(`Missing base URL B for job ${jobConfig.name}`);
              }
              
              urlA = buildUrl(baseUrlA, pathA);
              urlB = buildUrl(baseUrlB, pathB);
              
              console.log(`Generated URLs for endpoint ${epA.key}: \nA: ${urlA}\nB: ${urlB}`);
            } catch (urlErr) {
              console.error(`Error building URLs: ${urlErr.message}`);
            }
            
            // Skip if URLs are invalid
            if (!urlA || !urlB) {
              console.error('Skipping comparison due to invalid URLs');
              const errorRecord = {
                jobId: jobConfig.id,
                jobName: jobConfig.name,
                platform,
                geo,
                id: idObj.value,
                idName: idObj.name,
                idCategory: idObj.category,
                endpointA: epA.key,
                endpointB: epB.key,
                urlA: urlA || '[INVALID]',
                urlB: urlB || '[INVALID]',
                responseA: {
                  success: false,
                  status: null,
                  error: 'Invalid URL',
                  timeMs: 0
                },
                responseB: {
                  success: false,
                  status: null,
                  error: 'Invalid URL',
                  timeMs: 0
                },
                diffs: [],
                diffCounts: { added: 0, deleted: 0, changed: 0, array: 0, total: 0 },
                ignorePaths
              };
              
              allRecords.push(errorRecord);
              return; // Skip this comparison task
            }
            
            // Fetch both endpoints
            const [responseA, responseB] = await Promise.all([
              cachedFetch(urlA, headersA, retries, delayMs),
              cachedFetch(urlB, headersB, retries, delayMs)
            ]);
            
            // Calculate differences
            let diffs = [];
            let diffCounts = { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
            
            // Only calculate diffs if both responses were successful
            if (responseA.success && responseB.success) {
              try {
                diffs = DeepDiff(responseA.data, responseB.data) || [];
                // Filter diffs using ignorePaths
                diffs = filterDiffs(diffs, ignorePaths);
                // Classify and count diffs by type
                diffCounts = classifyDiffs(diffs);
              } catch (diffErr) {
                console.error(`Error calculating diffs: ${diffErr.message}`);
              }
            }
            
            // Create a record for this comparison
            const record = {
              jobId: jobConfig.id,
              jobName: jobConfig.name,
              platform,
              geo,
              id: idObj.value,
              idName: idObj.name,
              idCategory: idObj.category,
              endpointA: epA.key,
              endpointB: epB.key,
              urlA,
              urlB,
              responseA: {
                success: responseA.success,
                status: responseA.status,
                error: responseA.error,
                timeMs: responseA.responseTimeMs
              },
              responseB: {
                success: responseB.success,
                status: responseB.status,
                error: responseB.error,
                timeMs: responseB.responseTimeMs
              },
              diffs,
              diffCounts,
              ignorePaths
            };
            
            allRecords.push(record);
          } catch (err) {
            console.error(`Error in comparison task: ${err.message}`);
            // Create an error record
            allRecords.push({
              jobId: jobConfig.id,
              jobName: jobConfig.name,
              platform,
              geo,
              error: err.message,
              errorStack: err.stack
            });
          }
        }));
      }
    }
  }
  
  // Wait for all tasks to complete
  await Promise.all(tasks.map(p => p.catch(err => {
    console.error(`Task failed: ${err.message}`);
  })));
  
  // Create a proper job summary
  const summary = {
    totalComparisons: allRecords.length,
    successful: allRecords.filter(r => !r.error && r.responseA?.success && r.responseB?.success).length,
    failures: allRecords.filter(r => r.error || !r.responseA?.success || !r.responseB?.success).length,
    endpointsWithDiffs: allRecords.filter(r => (r.diffs?.length || 0) > 0).length
  };
  
  // Map records to endpoints in the expected format
  const endpointMappings = allRecords.map(record => ({
    id: `${record.endpointA || ''}_VS_${record.endpointB || ''}`,
    name: `${record.endpointA || 'unknown'} vs ${record.endpointB || 'unknown'}`,
    urlA: record.urlA,
    urlB: record.urlB,
    responseA: record.responseA,
    responseB: record.responseB,
    diffs: record.diffs || [],
    diffCounts: record.diffCounts || { total: 0 },
    error: record.error,
    platform: record.platform,
    geo: record.geo,
    idValue: record.id,
    idName: record.idName,
    params: {}
  }));

  // Return all records for this job with proper structure
  return {
    jobId: jobConfig.id || 'job-1',
    jobName: jobConfig.name || 'Job 1',
    platform,
    baseUrlA: jobConfig.baseUrlA || jobConfig.baseA || '',
    baseUrlB: jobConfig.baseUrlB || jobConfig.baseB || '',
    summary: summary,
    endpoints: endpointMappings,
    records: allRecords
  };
}

/**
 * Run all jobs with given configuration
 */
async function runAllJobs(configState, qaName) {
  // Check if configState is valid
  if (!configState || !Array.isArray(configState.jobs) || configState.jobs.length === 0) {
    console.error('Invalid config state:', configState);
  }

  const { jobs = [], headers = {}, ids = {}, endpoints = [] } = configState;

  // Ensure we have a valid QA name
  const testEngineer = qaName || 'QA Engineer';
  console.log(`Running comparison for ${testEngineer} with ${jobs.length} jobs`);
  
  // Run all jobs and collect results
  const jobPromises = jobs.map(job => runJob(job, headers, ids, endpoints));
  const jobResults = await Promise.all(jobPromises);
  
  // Calculate overall stats
  const allEndpoints = jobResults.reduce((acc, job) => acc + (job.endpoints?.length || 0), 0);
  
  // Build and return the complete report with proper structure
  return {
    testEngineer: qaName || 'Anonymous User',
    timestamp: new Date().toISOString(),
    jobs: jobResults,
    meta: {
      endpointsRun: allEndpoints,
      idsUsed: ids ? Object.keys(ids).length : 0,
      geoUsed: headers ? Object.keys(headers).filter(h => h.includes('loc')).length : 0
    }
  };
}

module.exports = { runJob, runAllJobs };
