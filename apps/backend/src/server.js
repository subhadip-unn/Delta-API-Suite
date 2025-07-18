// server.js - Main API server for CBZ API Delta
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { runAllJobs } = require('./comparator');
const { getIndianTimestamp, normalizeConfig } = require('./utils');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage for reports (no disk persistence)
let currentReport = null;
const reportsStore = new Map(); // Map<reportId, reportData>

/**
 * POST /api/compare
 * Runs the API comparison with the provided config
 */
app.post('/api/compare', async (req, res) => {
  try {
    const { config, qaName, options = {} } = req.body;
    // Debug: Log what was received from frontend
    console.log('[DEBUG] Received at /api/compare:', { config, qaName, options });
    
    if (!config) {
      return res.status(400).json({ success: false, error: 'Missing config data' });
    }
    
    if (!qaName) {
      return res.status(400).json({ success: false, error: 'Missing QA name' });
    }
    
    // Log the start of comparison
    console.log(`Starting comparison for ${qaName}`);
    
    // Generate timestamp for this report
    const { folderTs, humanTs } = getIndianTimestamp();
    
    // Normalize the config to ensure compatibility between frontend and backend
    console.log('Normalizing config to ensure platform compatibility...');
    const normalizedConfig = normalizeConfig(config);
    console.log(`Normalized ${config.endpoints?.length || 0} endpoints into ${normalizedConfig.endpoints?.length || 0} platform-specific endpoints`);
    
    // Run the comparison with normalized config
    const startTime = Date.now();
    const reportData = await runAllJobs(normalizedConfig, qaName);
    const elapsedMs = Date.now() - startTime;
    
    // Add metadata to the report
    const completeReport = {
      ...reportData,
      timestamp: humanTs,
      duration: elapsedMs,
      options
    };
    
    // Store the report in memory only
    currentReport = completeReport;
    reportsStore.set(folderTs, completeReport);
    
    console.log(`Report ${folderTs} stored in memory. Total reports in memory: ${reportsStore.size}`);
    
    // Return success to client with report ID
    return res.json({ 
      success: true, 
      reportId: folderTs,
      timestamp: humanTs,
      duration: elapsedMs,
      message: 'Comparison completed successfully'
    });
  } catch (error) {
    console.error('Error running comparison:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An unknown error occurred'
    });
  }
});

/**
 * GET /api/reports
 * Lists all available reports
 */
app.get('/api/reports', (req, res) => {
  try {
    // Get reports from in-memory store
    const reports = Array.from(reportsStore.entries())
      .map(([reportId, reportData]) => {
        try {
          return {
            id: reportId,
            timestamp: reportData.timestamp,
            testEngineer: reportData.testEngineer || 'Unknown',
            jobCount: reportData.jobs ? reportData.jobs.length : 0
          };
        } catch (err) {
          console.error(`Error processing report ${reportId}:`, err);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error listing reports'
    });
  }
});

/**
 * GET /api/reports/:reportId
 * Gets a specific report
 */
app.get('/api/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    
    // If requesting the current report and we have it in memory
    if (reportId === 'current' && currentReport) {
      return res.json({ success: true, report: currentReport });
    }
    
    // Try to load from in-memory store
    const reportData = reportsStore.get(reportId);
    
    if (!reportData) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, report: reportData });
  } catch (error) {
    console.error(`Error retrieving report:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error retrieving report'
    });
  }
});

/**
 * POST /api/upload-report
 * Uploads a custom report file
 */
app.post('/api/upload-report', (req, res) => {
  try {
    const { reportFile, qaName } = req.body;
    
    if (!reportFile) {
      return res.status(400).json({
        success: false,
        error: 'Missing report file data'
      });
    }
    
    // Generate a timestamp for this upload
    const { folderTs, humanTs } = getIndianTimestamp();
    
    // Parse the uploaded report
    const reportData = JSON.parse(reportFile);
    
    // Add metadata if not present
    if (!reportData.testEngineer && qaName) {
      reportData.testEngineer = qaName;
    }
    if (!reportData.timestamp) {
      reportData.timestamp = humanTs;
    }
    
    // Store in memory only
    currentReport = reportData;
    reportsStore.set(folderTs, reportData);
    
    console.log(`Report ${folderTs} uploaded and stored in memory. Total reports: ${reportsStore.size}`);
    
    // Return success with the report ID
    res.json({
      success: true,
      reportId: folderTs,
      message: 'Report uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading report'
    });
  }
});

/**
 * POST /api/proxy-fetch
 * Proxy endpoint for external API calls to avoid CORS issues
 */
app.post('/api/proxy-fetch', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing URL parameter'
      });
    }
    
    console.log(`[PROXY] ${method} ${url}`);
    
    // Import fetch dynamically (for Node.js compatibility)
    const fetch = (await import('node-fetch')).default;
    
    const fetchOptions = {
      method,
      headers: {
        'User-Agent': 'CBZ-API-Delta-Tool/1.0',
        ...headers
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }
    
    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    });
    
  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Proxy request failed'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`CBZ API Delta backend server running on port ${PORT}`);
});
