// comparator.js - Core comparison logic with advanced DeltaPro+ engine
const pLimit = require('p-limit').default || require('p-limit');
const { buildUrl, retryFetch, filterDiffs } = require('./utils');
const { compareAdvanced } = require('./shared-comparison-engine');

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

  // Enhanced logging for multi-platform verification
  console.log(`\n🚀 [MULTI-PLATFORM] Processing job: ${jobConfig.name}`);
  console.log(`📱 [PLATFORM] Target platform: ${platform} (${platform === 'i' ? 'iOS' : platform === 'a' ? 'Android' : platform === 'm' ? 'Mobile Web' : platform === 'w' ? 'Desktop Web' : 'Unknown'})`);
  console.log(`🔗 [ENDPOINTS] Available endpoints: ${endpoints.length}`);
  console.log(`📋 [HEADERS] Platform-specific headers for '${platform}':`, JSON.stringify(headersTempl, null, 2));
  console.log(`🌍 [GEO-TESTING] Multi-location support: ${Array.isArray(headersTempl["cb-loc"]) ? headersTempl["cb-loc"].join(', ') : headersTempl["cb-loc"] || 'No geo specified'}`);
  console.log(`🚫 [IGNORE-PATHS] Configured ignore paths: ${ignorePaths.length > 0 ? ignorePaths.join(', ') : 'none'}`);
  console.log(`🔄 [RETRY-POLICY] Retries: ${retries}, Delay: ${delayMs}ms`);
  
  /**
   * Helper function to find an endpoint by key and platform
   * Handles both legacy format (endpoint.platform) and new format (endpoint.platforms array)
   * @param {string} endpointKey - The endpoint key to find
   * @returns {Object|null} - The matched endpoint or null if not found
   */
  function findEndpointForPlatform(endpointKey) {
    console.log(`\n🔍 [FIND-ENDPOINT] Looking for endpoint: ${endpointKey}`);
    console.log(`🔍 [FIND-ENDPOINT] Target platform: ${platform}`);
    console.log(`🔍 [FIND-ENDPOINT] Available endpoints:`, endpoints.map(e => ({ key: e.key, platform: e.platform, platforms: e.platforms })));
    
    if (!endpointKey) {
      console.error(`❌ [FIND-ENDPOINT] Missing endpoint key in job: ${jobConfig.name}`);
      return null;
    }
    
    // Find endpoint by key AND platform (critical fix for DeltaBulkPro)
    const endpoint = endpoints.find(e => 
      e.key === endpointKey && 
      (e.platform === platform || (Array.isArray(e.platforms) && e.platforms.includes(platform)))
    );
    
    if (!endpoint) {
      console.error(`❌ [FIND-ENDPOINT] Endpoint not found with key: ${endpointKey} for platform: ${platform}`);
      console.error(`❌ [FIND-ENDPOINT] Available endpoints:`, endpoints.map(e => ({ key: e.key, platform: e.platform, platforms: e.platforms })));
      return null;
    }
    
    console.log(`✅ [FIND-ENDPOINT] Found platform-specific endpoint:`, { key: endpoint.key, platform: endpoint.platform, platforms: endpoint.platforms });
    
    // Platform matching already done in find() above - no need for redundant checks
    
    // Create a normalized copy of the endpoint with consistent platform property
    const normalizedEndpoint = {
      ...endpoint,
      platform: platform // Ensure consistent platform property
    };
    
    console.log(`✅ [FIND-ENDPOINT] Returning normalized endpoint:`, { key: normalizedEndpoint.key, platform: normalizedEndpoint.platform });
    return normalizedEndpoint;
  }
  
  // Process endpoint pairs for comparison
  let endpointPairs = [];
  
  if (Array.isArray(jobConfig.endpointPairs) && jobConfig.endpointPairs.length > 0) {
    console.log(`📝 [ENDPOINT-PAIRS] Job has ${jobConfig.endpointPairs.length} endpoint pairs`);
    console.log(`📝 [ENDPOINT-PAIRS] Pair format:`, jobConfig.endpointPairs);
    
    for (const pair of jobConfig.endpointPairs) {
      // Handle different pair formats
      if (typeof pair === 'string') {
        // Simple string format: use same endpoint for both A and B
        console.log(`🔗 [PAIR-STRING] Processing endpoint: ${pair}`);
        console.log(`🔗 [PAIR-STRING] Current platform: ${platform}`);
        console.log(`🔗 [PAIR-STRING] Available endpoints for platform:`, endpoints.filter(e => e.platform === platform).map(e => ({ key: e.key, platform: e.platform })));
        
        const ep = findEndpointForPlatform(pair);
        if (ep) {
          endpointPairs.push({ epA: ep, epB: ep });
          console.log(`  ✅ Added self-comparison pair: ${pair}`);
        } else {
          console.error(`  ❌ Endpoint not found: ${pair}`);
          console.error(`  ❌ Available endpoints:`, endpoints.map(e => ({ key: e.key, platform: e.platform })));
          console.error(`  ❌ Target platform: ${platform}`);
        }
      } else if (pair && typeof pair === 'object' && pair.endpointA && pair.endpointB) {
        // Object format: {endpointA, endpointB}
        console.log(`🔗 [PAIR-OBJECT] Processing pair: ${pair.endpointA} <-> ${pair.endpointB}`);
        const epA = findEndpointForPlatform(pair.endpointA);
        const epB = findEndpointForPlatform(pair.endpointB);
        
        if (epA && epB) {
          endpointPairs.push({ epA, epB });
          console.log(`  ✅ Added comparison pair: ${pair.endpointA} <-> ${pair.endpointB}`);
        } else {
          console.warn(`  ⚠️ Skipping endpoint pair ${pair.endpointA} <-> ${pair.endpointB} (one or both not found)`);
        }
      } else {
        console.warn(`  ⚠️ Invalid pair format:`, pair);
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
            let pathA = epA.pathA || epA.path;
            let pathB = epB.pathB || epB.path;
            
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
              // First check for endpoint-specific baseUrlA/baseUrlB, then job-specific
              let baseUrlA = epA.baseUrlA || jobConfig.baseUrlA || jobConfig.baseA;
              let baseUrlB = epB.baseUrlB || jobConfig.baseUrlB || jobConfig.baseB;
              
              console.log(`Using base URLs: A=${baseUrlA}, B=${baseUrlB}`);
              
              // Validate baseUrls
              if (!baseUrlA) {
                console.error(`Missing base URL A for endpoint ${epA.key} in job ${jobConfig.name}`);
              }
              if (!baseUrlB) {
                console.error(`Missing base URL B for endpoint ${epB.key} in job ${jobConfig.name}`);
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
            
            // Enhanced logging for API calls with headers verification
            console.log(`\n🔍 [API-CALL] Endpoint: ${epA.key} | Geo: ${geo}`);
            console.log(`📡 [REQUEST-A] URL: ${urlA}`);
            console.log(`📡 [REQUEST-B] URL: ${urlB}`);
            console.log(`🏷️ [HEADERS-A] Applied headers:`, JSON.stringify(headersA, null, 2));
            console.log(`🏷️ [HEADERS-B] Applied headers:`, JSON.stringify(headersB, null, 2));
            
            // Fetch both endpoints
            const [responseA, responseB] = await Promise.all([
              cachedFetch(urlA, headersA, retries, delayMs),
              cachedFetch(urlB, headersB, retries, delayMs)
            ]);
            
            // Calculate differences
            let diffs = [];
            let diffCounts = { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
            
            // Use the advanced shared comparison engine with comprehensive logging
            if (responseA.success && responseB.success && responseA.data && responseB.data) {
              try {
                console.log(`\n🧠 [ADVANCED-DIFF] Using DeltaPro+ shared comparison engine for ${epA.key}`);
                console.log(`⚡ [ALGORITHM] 3-phase intelligent array matching with semantic similarity`);
                console.log(`🔒 [SECURITY] Real-time, in-memory only, no data storage`);
                console.log(`🔄 [ORDER-INSENSITIVE] Semantic matching across array positions`);
                
                const comparisonResult = compareAdvanced(responseA.data, responseB.data);
                
                diffs = comparisonResult.diffs || [];
                diffCounts = comparisonResult.summary || { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
                
                console.log(`\n📊 [DIFF-SUMMARY] Job: ${jobConfig.name} | Platform: ${platform} | Endpoint: ${epA.key} | Geo: ${geo}`);
                console.log(`📈 [DIFF-COUNTS] Total: ${diffCounts.total}, Added: ${diffCounts.added}, Deleted: ${diffCounts.deleted}, Changed: ${diffCounts.changed}, Array: ${diffCounts.array}`);
                console.log(`📏 [RESPONSE-SIZES] A: ${JSON.stringify(responseA.data).length} chars, B: ${JSON.stringify(responseB.data).length} chars`);
                console.log(`🎯 [SEVERITY-BREAKDOWN] Critical: ${diffs.filter(d => d.severity === 'critical').length}, High: ${diffs.filter(d => d.severity === 'high').length}, Medium: ${diffs.filter(d => d.severity === 'medium').length}, Low: ${diffs.filter(d => d.severity === 'low').length}`);
                
                // Log sample diffs for verification
                if (diffs.length > 0) {
                  console.log(`🔍 [SAMPLE-DIFFS] First 3 diffs:`);
                  diffs.slice(0, 3).forEach((diff, idx) => {
                    console.log(`  ${idx + 1}. [${diff.severity?.toUpperCase()}] ${diff.type} at '${diff.path}': ${diff.description}`);
                  });
                }
                
              } catch (compError) {
                console.error(`❌ [COMPARISON-ERROR] Failed to compare responses for ${epA.key}:`, compError.message);
                diffs = [];
                diffCounts = { added: 0, deleted: 0, changed: 0, array: 0, total: 0 };
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
              diffs: diffs, // Enhanced diffs with severity/priority
              diffCounts,
              diffSummary: diffCounts, // Advanced diff analysis summary
              rawDiffs: diffs, // Original diffs for debugging
              rawJsonA: responseA.success ? responseA.data : null, // Raw JSON data for Monaco Diff Viewer
              rawJsonB: responseB.success ? responseB.data : null, // Raw JSON data for Monaco Diff Viewer
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
      key: record.endpointA || 'unknown', // Add key field for frontend
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
      cbLoc: record.geo || 'IN', // Add cbLoc field
      idValue: record.id,
      idName: record.idName,
      params: {},
      rawJsonA: record.rawJsonA || null,
      rawJsonB: record.rawJsonB || null
    }));

  // Return all records for this job with proper structure
  return {
    jobId: jobConfig.id || 'job-1',
    jobName: jobConfig.name || 'Job 1',
    platform,
    testEngineer: jobConfig.testEngineer || 'QA Engineer',
    baseUrlA: jobConfig.baseUrlA || jobConfig.baseA || '',
    baseUrlB: jobConfig.baseUrlB || jobConfig.baseB || '',
    summary: {
      ...summary,
      totalDiffs: summary.totalDiffs || 0,
      endpointsWithDiffs: summary.endpointsWithDiffs || 0
    },
    endpoints: endpointMappings.map(endpoint => ({
      ...endpoint,
      params: endpoint.params || {},
      timestampA: new Date().toISOString(),
      timestampB: new Date().toISOString(),
      headersUsedA: headersTempl,
      headersUsedB: headersTempl
    })),
    records: allRecords
  };
}

/**
 * Run all jobs with given configuration
 */
async function runAllJobs(configState, qaName) {
  // Handle both old format (with jobs array) and new format (direct endpoints)
  let { jobs = [], headers = {}, ids = {}, endpoints = [] } = configState;
  
  console.log('🚀 [RUN-ALL-JOBS] Starting with config:', {
    jobCount: jobs.length,
    endpointCount: endpoints.length,
    qaName,
    platforms: Object.keys(headers)
  });
  
  // Use the jobs created by normalizeConfig (they should already exist)
  if (jobs.length === 0 && endpoints.length > 0) {
    console.error('❌ [RUN-ALL-JOBS] No jobs found after normalization! This should not happen.');
    console.error('Config state:', JSON.stringify(configState, null, 2));
    
    // Fallback: create basic jobs for each platform
    const platforms = Object.keys(headers).length > 0 ? Object.keys(headers) : ['i', 'a', 'm', 'w'];
    jobs = platforms.map(platform => {
      const platformName = {
        'i': 'iOS',
        'a': 'Android', 
        'm': 'Mobile Web',
        'w': 'Desktop Web'
      }[platform] || platform;
      
      return {
        name: `${platformName} API Comparison`,
        platform: platform,
        ignorePaths: [],
        retryPolicy: { retries: 3, delayMs: 1000 },
        endpointsToRun: endpoints.filter(ep => ep.platform === platform).map(ep => ep.key)
      };
    }).filter(job => job.endpointsToRun.length > 0);
    
    console.log(`🔧 [FALLBACK] Created ${jobs.length} fallback jobs`);
  }
  
  // Check if we have valid data
  if (jobs.length === 0) {
    console.error('No jobs to run. Config state:', configState);
    // Return empty report structure
    return {
      jobName: 'API Comparison',
      platform: 'i',
      timestamp: new Date().toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(', ', ' '),
      testEngineer: qaName || 'Anonymous User',
      totalTasks: 0,
      failures: 0,
      diffsFound: 0,
      summary: {
        totalComparisons: 0,
        failures: 0,
        endpointsWithDiffs: 0,
        totalDiffs: 0,
        successful: 0
      },
      meta: {
        endpointsRun: [],
        idsUsed: [],
        geoUsed: []
      },
      headersUsed: headers,
      endpoints: [],
      jobs: []
    };
  }

  // Ensure we have a valid QA name
  const testEngineer = qaName || 'QA Engineer';
  console.log(`🧑‍💼 [QA-ATTRIBUTION] Running comparison for: ${testEngineer} with ${jobs.length} jobs`);
  
  // Add testEngineer to each job before running
  const jobsWithQA = jobs.map(job => ({
    ...job,
    testEngineer: testEngineer
  }));
  
  // Run all jobs and collect results
  const jobPromises = jobsWithQA.map(job => runJob(job, headers, ids, endpoints));
  const jobResults = await Promise.all(jobPromises);
  
  // Calculate overall stats
  const allEndpoints = jobResults.reduce((acc, job) => acc + (job.endpoints?.length || 0), 0);
  
  // Calculate overall summary stats
  const totalTasks = jobResults.reduce((acc, job) => acc + (job.endpoints?.length || 0), 0);
  const totalFailures = jobResults.reduce((acc, job) => acc + (job.summary?.failures || 0), 0);
  const totalDiffs = jobResults.reduce((acc, job) => acc + (job.summary?.totalDiffs || 0), 0);
  const totalSuccessful = jobResults.reduce((acc, job) => acc + (job.summary?.successful || 0), 0);
  const endpointsWithDiffs = jobResults.reduce((acc, job) => acc + (job.summary?.endpointsWithDiffs || 0), 0);
  
  // Extract all unique endpoint keys, IDs, and geo locations
  const allEndpointKeys = new Set();
  const allIdsUsed = new Set();
  const allGeoUsed = new Set();
  
  jobResults.forEach(job => {
    if (job.endpoints) {
      job.endpoints.forEach(endpoint => {
        allEndpointKeys.add(endpoint.key);
        if (endpoint.geo) allGeoUsed.add(endpoint.geo);
        if (endpoint.idValue) allIdsUsed.add(endpoint.idValue.toString());
      });
    }
  });
  
  // Build and return the complete report with structure matching old static report
  return {
    jobName: jobResults[0]?.jobName || 'API Comparison',
    platform: jobResults[0]?.platform || 'i',
    timestamp: new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-').replace(', ', ' '),
    testEngineer: qaName || 'Anonymous User',
    totalTasks,
    failures: totalFailures,
    diffsFound: totalDiffs,
    summary: {
      totalComparisons: totalTasks,
      failures: totalFailures,
      endpointsWithDiffs,
      totalDiffs,
      successful: totalSuccessful
    },
    meta: {
      endpointsRun: Array.from(allEndpointKeys),
      idsUsed: Array.from(allIdsUsed),
      geoUsed: Array.from(allGeoUsed)
    },
    headersUsed: headers,
    endpoints: jobResults.reduce((acc, job) => {
      if (job.endpoints) {
        acc.push(...job.endpoints.map(endpoint => ({
          ...endpoint,
          cbLoc: endpoint.geo || 'IN',
          rawJsonA: endpoint.rawJsonA || null,
          rawJsonB: endpoint.rawJsonB || null
        })));
      }
      return acc;
    }, []),
    jobs: jobResults
  };
}

module.exports = { runJob, runAllJobs };
