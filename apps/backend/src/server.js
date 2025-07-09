// server.js - Main API server for CBZ API Delta
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { runAllJobs } = require('./comparator');
const { getIndianTimestamp, normalizeConfig } = require('./utils');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Store for current report
let currentReport = null;
const REPORTS_DIR = path.join(__dirname, '../reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

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
    
    // Store the report in memory
    currentReport = completeReport;
    
    // Save the report to disk
    const reportFolder = path.join(REPORTS_DIR, folderTs);
    if (!fs.existsSync(reportFolder)) {
      fs.mkdirSync(reportFolder, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportFolder, 'report.json'), 
      JSON.stringify(completeReport, null, 2),
      'utf8'
    );
    
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
    // Read all report folders
    const reports = fs.readdirSync(REPORTS_DIR)
      .filter(item => fs.statSync(path.join(REPORTS_DIR, item)).isDirectory())
      .map(folder => {
        try {
          const reportPath = path.join(REPORTS_DIR, folder, 'report.json');
          if (fs.existsSync(reportPath)) {
            const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            return {
              id: folder,
              timestamp: reportData.timestamp || folder,
              testEngineer: reportData.testEngineer,
              jobCount: reportData.jobs?.length || 0
            };
          }
          return { id: folder, timestamp: folder };
        } catch (e) {
          return { id: folder, timestamp: folder, error: e.message };
        }
      })
      .sort((a, b) => b.id.localeCompare(a.id)); // Sort newest first
      
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
    
    // Otherwise load from disk
    const reportPath = path.join(REPORTS_DIR, reportId, 'report.json');
    
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Report not found'
      });
    }
    
    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
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
    
    // Save to disk
    const reportFolder = path.join(REPORTS_DIR, folderTs);
    if (!fs.existsSync(reportFolder)) {
      fs.mkdirSync(reportFolder, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportFolder, 'report.json'),
      JSON.stringify(reportData, null, 2),
      'utf8'
    );
    
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

// Start the server
app.listen(PORT, () => {
  console.log(`CBZ API Delta backend server running on port ${PORT}`);
});
