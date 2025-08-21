// utils.js - Clean version with only needed functions

/**
 * Get Indian timestamp in multiple formats
 * @returns {Object} Object containing folderTs and humanTs
 */
function getIndianTimestamp() {
  const now = new Date();
  
  // Convert to Indian timezone (IST - UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  
  // Format for folder names (YYYY-MM-DD_HH-MM-SS)
  const folderTs = istTime.toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');
  
  // Human readable format
  const humanTs = istTime.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return {
    folderTs,
    humanTs
  };
}

module.exports = {
  getIndianTimestamp
};
