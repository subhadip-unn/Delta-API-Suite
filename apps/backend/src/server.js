// server.js - Main API server for CBZ API Delta
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getIndianTimestamp } = require('./utils');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage for reports (no disk persistence)
let currentReport = null;
const reportsStore = new Map(); // Map<reportId, reportData>

// Session metrics (in-memory, resets on server restart)
let sessionMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  startTime: Date.now(),
  rateLimitHits: 0
};

// Rate limiting (per IP address)
const rateLimit = new Map(); // IP -> {count: 0, resetTime: Date}

// Request timing middleware
const requestTimingMiddleware = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Check if IP exists in rate limit
  if (rateLimit.has(clientIP)) {
    const limit = rateLimit.get(clientIP);
    
    // Check if rate limit is exceeded
    if (now < limit.resetTime && limit.count >= 100) {
      sessionMetrics.rateLimitHits++;
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. You can make 100 requests per minute.",
        retryAfter: Math.ceil((limit.resetTime - now) / 1000),
        limit: {
          remaining: 0,
          resetTime: new Date(limit.resetTime).toISOString()
        }
      });
    }
    
    // Reset counter if time window has passed
    if (now >= limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + 60000; // 1 minute window
    }
    
    // Increment counter
    limit.count++;
  } else {
    // First request from this IP
    rateLimit.set(clientIP, {
      count: 1,
      resetTime: now + 60000
    });
  }
  
  next();
};

/**
 * GET /api/health
 * Health check endpoint with session metrics
 */
app.get('/api/health', (req, res) => {
  const uptime = Date.now() - sessionMetrics.startTime;
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    status: 'healthy',
    service: 'CBZ API Delta Backend',
    timestamp: new Date().toISOString(),
    uptime: {
      milliseconds: uptime,
      formatted: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
    },
    metrics: {
      totalRequests: sessionMetrics.totalRequests,
      successfulRequests: sessionMetrics.successfulRequests,
      failedRequests: sessionMetrics.failedRequests,
      rateLimitHits: sessionMetrics.rateLimitHits,
      successRate: sessionMetrics.totalRequests > 0 ? 
        Math.round((sessionMetrics.successfulRequests / sessionMetrics.totalRequests) * 100) : 0
    }
  });
});

/**
 * POST /api/proxy
 * Proxy endpoint for external API calls to avoid CORS issues
 * This is the core endpoint used by DeltaPro+ for API comparison
 */
app.post('/api/proxy', requestTimingMiddleware, rateLimitMiddleware, async (req, res) => {
  sessionMetrics.totalRequests++;
  
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    if (!url) {
      sessionMetrics.failedRequests++;
      return res.status(400).json({
        success: false,
        error: 'Missing URL parameter',
        details: 'Please provide a valid URL to test'
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
    
    sessionMetrics.successfulRequests++;
    
    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      metadata: {
        responseSize: responseText.length,
        processingTime: Date.now() - req.startTime
      }
    });
    
  } catch (error) {
    sessionMetrics.failedRequests++;
    
    // Professional error handling with user-friendly messages
    let userMessage = "An error occurred while processing your request.";
    let statusCode = 500;
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.code === 'ECONNREFUSED') {
      userMessage = "The external API is currently unavailable. Please check if the service is running.";
      errorCode = 'SERVICE_UNAVAILABLE';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      userMessage = "Request timed out. The API is responding slowly. Please try again.";
      errorCode = 'TIMEOUT';
      statusCode = 408;
    } else if (error.message.includes('fetch')) {
      userMessage = "Unable to reach the external API. Please check the URL and try again.";
      errorCode = 'NETWORK_ERROR';
      statusCode = 502;
    } else if (error.message.includes('ENOTFOUND')) {
      userMessage = "The API endpoint could not be found. Please verify the URL is correct.";
      errorCode = 'ENDPOINT_NOT_FOUND';
      statusCode = 404;
    }
    
    console.error(`[PROXY] Error (${errorCode}):`, error);
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      errorCode: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
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
 * GET /api/status
 * Health check endpoint
 */
app.get('/api/status', (req, res) => {
  res.json({ 
    success: true, 
    status: 'running',
    service: 'CBZ API Delta Backend',
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`CBZ API Delta backend server running on port ${PORT}`);
});

// Keep the server running
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
