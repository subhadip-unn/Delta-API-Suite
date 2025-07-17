import { useState } from 'react';
import { ReportJob } from './types';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryCardProps {
  job: ReportJob;
}

const SummaryCard = ({ job }: SummaryCardProps) => {
  const [showHeaders, setShowHeaders] = useState(false);

  // Handle missing data gracefully
  if (!job) {
    return (
      <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-600">
        No job data available.
      </div>
    );
  }

  // Extract data safely with fallbacks
  const summary = job.summary || {};
  const meta = job.meta || {};
  
  // Format time helper with exact format to match legacy report
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return 'Unknown Time';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Extract key data with proper type safety matching old report structure
  const totalEndpoints = job.endpoints?.length || 0;
  const totalErrors = job.failures || 0;
  const totalWarnings = summary.endpointsWithDiffs || 0;
  const totalDiffs = job.diffsFound || summary.totalDiffs || 0;
  const qaEngineer = job.testEngineer || 'Unknown';
  const timestamp = formatTime(job.timestamp);
  const jobTitle = job.jobName || 'API Comparison';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6"
      style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderRadius: '8px',
      }}
    >
      {/* Schema Notice */}
      <div 
        className="flex items-center p-3 rounded mb-4" 
        style={{ 
          background: '#fff9e6', 
          padding: '12px', 
          borderLeft: '4px solid #f1c40f', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}
      >
        <AlertCircle className="mr-2 text-yellow-500" size={18} />
        <div>
          <strong>Note:</strong> This report does <em>not</em> perform JSON‐schema validation. It only compares raw structures. To add schema‐based checks, integrate a JSON Schema validator.
        </div>
      </div>

      {/* Job Title with Environment Badges */}
      <div className="border-b dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {jobTitle}
            </h2>
            <div className="flex gap-2 mt-2">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: '#e6f3ff',
                  color: '#0061c7',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                <span className="text-sm text-gray-600">Production</span>
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: '#e7f5ea',
                  color: '#27ae60',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                <span className="text-sm text-gray-600">Staging</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400" style={{ marginBottom: '6px' }}>
              <strong className="font-medium">QA Engineer:</strong> {qaEngineer}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong className="font-medium">Generated:</strong> {timestamp}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Left = Test Info, Right = Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Test Details</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">ID A:</span>{' '}
              <span 
                className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              >
                {meta?.idsUsed?.[0] || 'N/A'}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">ID B:</span>{' '}
              <span 
                className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              >
                {meta?.idsUsed?.[1] || 'N/A'}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400">Geo:</span>{' '}
              <span 
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                {meta?.geoUsed?.[0] || 'Unknown'}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Test Results</h3>
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="bg-gray-50 dark:bg-gray-700 p-2 rounded"
              style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '6px'
              }}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">Endpoints Tested</div>
              <div className="text-lg font-bold">{totalEndpoints}</div>
            </div>
            <div 
              className="bg-red-50 dark:bg-red-900/30 p-2 rounded"
              style={{
                backgroundColor: '#fdedee',
                padding: '10px',
                borderRadius: '6px'
              }}
            >
              <div className="text-xs text-red-600 dark:text-red-400" style={{ color: '#e74c3c' }}>Errors</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400" style={{ color: '#e74c3c' }}>{totalErrors}</div>
            </div>
            <div 
              className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded"
              style={{
                backgroundColor: '#fff8e6',
                padding: '10px',
                borderRadius: '6px'
              }}
            >
              <div className="text-xs text-yellow-600 dark:text-yellow-400" style={{ color: '#f39c12' }}>Warnings</div>
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400" style={{ color: '#f39c12' }}>{totalWarnings}</div>
            </div>
            <div 
              className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded"
              style={{
                backgroundColor: '#e8f4fd',
                padding: '10px',
                borderRadius: '6px'
              }}
            >
              <div className="text-xs text-blue-600 dark:text-blue-400" style={{ color: '#3498db' }}>Total Differences</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400" style={{ color: '#3498db' }}>{totalDiffs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Headers Section */}
      <div>
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="flex items-center w-full justify-between text-left text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2"
          style={{
            backgroundColor: '#f5f5f5',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #e0e0e0',
            transition: 'background-color 0.2s'
          }}
        >
          <span>Headers Used</span>
          {showHeaders ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {showHeaders && (
          <div 
            className="bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-x-auto"
            style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '0 0 4px 4px',
              border: '1px solid #e0e0e0',
              borderTop: 'none',
              maxHeight: '300px'
            }}
          >
            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {job.headersUsed ? JSON.stringify(job.headersUsed, null, 2) : 'No headers used'}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Note:</span> This report follows the CBZ API Delta Schema v1.0
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
