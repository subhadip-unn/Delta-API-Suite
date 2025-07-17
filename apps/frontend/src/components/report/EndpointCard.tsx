import { useState } from 'react';
import { ReportEndpoint } from './types';
import { ChevronDown, ChevronUp, Code, FileJson } from 'lucide-react';
import DiffViewer from './DiffViewer';

interface EndpointCardProps {
  endpoint: ReportEndpoint;
}

const EndpointCard = ({ endpoint }: EndpointCardProps) => {
  const [showDiffs, setShowDiffs] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  
  // Determine overall severity with priority order
  let overallSeverity = "ok";
  if (endpoint.error) overallSeverity = "failure";
  else if (endpoint.diffs && endpoint.diffs.length > 0) {
    // Check for different types of diffs
    const hasStructuralDiffs = endpoint.diffs.some(d => d.kind === 'D' || d.kind === 'N');
    const hasValueDiffs = endpoint.diffs.some(d => d.kind === 'E');
    
    if (hasStructuralDiffs) overallSeverity = "error";
    else if (hasValueDiffs) overallSeverity = "warning";
  }
  
  // Choose icon based on severity
  let icon = "✅";
  if (overallSeverity === "critical" || overallSeverity === "failure") icon = "🚨";
  else if (overallSeverity === "error") icon = "❌";
  else if (overallSeverity === "warning") icon = "⚠️";

  // Status badge color with exact styling to match original report
  const statusBadge = (status: number) => {
    if (status >= 500) return (
      <span 
        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        style={{ 
          background: '#e74c3c', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 500 
        }}
      >
        {status}
      </span>
    );
    if (status >= 400) return (
      <span 
        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
        style={{ 
          background: '#f39c12', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 500 
        }}
      >
        {status}
      </span>
    );
    if (status >= 200 && status < 300) return (
      <span 
        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        style={{ 
          background: '#2ecc71', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 500 
        }}
      >
        {status}
      </span>
    );
    return (
      <span 
        className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
        style={{ 
          background: '#95a5a6', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 500 
        }}
      >
        {status}
      </span>
    );
  };

  // Geo badge with exact styling to match original report
  const geoBadge = (geo: string) => (
    <span 
      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
      style={{ 
        background: '#3498db', 
        color: 'white', 
        padding: '4px 8px', 
        borderRadius: '4px', 
        fontSize: '12px',
        fontWeight: 500 
      }}
    >
      {geo}
    </span>
  );

  const borderColor = 
    overallSeverity === 'critical' || overallSeverity === 'failure' ? '#c0392b' :
    overallSeverity === 'error' ? '#e74c3c' :
    overallSeverity === 'warning' ? '#f39c12' : 
    '#27ae60';

  // Group diffs by change type based on kind
  const structuralDiffs = endpoint.diffs
    .filter(diff => diff.kind === 'D' || diff.kind === 'N') // Deleted or New
    .sort((a, b) => a.path.join('.').localeCompare(b.path.join('.')));
  
  const valueDiffs = endpoint.diffs
    .filter(diff => diff.kind === 'E') // Edited
    .sort((a, b) => a.path.join('.').localeCompare(b.path.join('.')));
  
  // Extract critical changes (structural changes)
  const criticalDiffs = structuralDiffs;

  const hasDiffs = endpoint.diffs && endpoint.diffs.length > 0;
  const fasterResp = endpoint.responseTimeA < endpoint.responseTimeB ? 'A' : (endpoint.responseTimeA > endpoint.responseTimeB ? 'B' : null);
  // Format timestamps in a consistent way
  const formatTime = (timestamp: string | number) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  const timeA = formatTime(endpoint.timestampA);
  const timeB = formatTime(endpoint.timestampB);

  return (
    <div 
      className="endpoint-card mb-4"
      data-severity={overallSeverity}
      data-path={endpoint.key || ""}
      data-endpoint={endpoint.key || ""}
      style={{
        background: '#fff',
        borderRadius: '6px',
        marginBottom: '1rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header with border color based on status */}
      <div 
        className="card-header flex items-center gap-3 px-4 py-3"
        style={{
          borderRadius: '6px 6px 0 0',
          borderTop: `5px solid ${borderColor}`,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 18px',
          fontSize: '1rem'
        }}
      >
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold text-lg">{endpoint.key}</span>
        <span className="text-gray-500">Params:</span>
        <span className="font-mono">
          {JSON.stringify(endpoint.params)}
        </span>
        <span className="ml-2">
          {geoBadge(endpoint.cbLoc)}
        </span>
        <span className="ml-auto">
          Prod: {statusBadge(endpoint.statusA)}
        </span>
        <span>
          Stg: {statusBadge(endpoint.statusB)}
        </span>
      </div>

      {/* Error message if present */}
      {endpoint.error && (
        <div 
          className="error-msg text-red-600 px-4 py-2"
          style={{
            color: '#b71c1c',
            margin: '0.5rem 0',
            padding: '0 18px'
          }}
        >
          Error: {endpoint.error}
        </div>
      )}

      {/* Request Details Section */}
      <div 
        className="px-4 py-3 bg-blue-50 border border-blue-100"
        style={{
          background: '#f8fafd',
          border: '1px solid #dde6f1',
          borderRadius: '0 0 8px 8px',
          marginBottom: '10px',
          padding: '14px 18px 10px 18px'
        }}
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <div>
            <div 
              className="text-sm text-gray-500 mb-1"
              style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '5px'
              }}
            >
              Prod (A)
            </div>
            <div 
              className="flex items-center gap-2"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span 
                className="text-blue-500 font-bold"
                style={{
                  fontSize: '15px',
                  color: '#3498db',
                  fontWeight: 'bold'
                }}
              >
                {endpoint.responseTimeA} ms
              </span>
              <span 
                className="text-xs text-gray-500"
                style={{
                  color: '#888',
                  fontSize: '12px'
                }}
              >
                at {timeA}
              </span>
              {fasterResp === 'A' && (
                <span 
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginLeft: '5px'
                  }}
                >
                  🚀 Faster
                </span>
              )}
            </div>
            <div 
              className="text-xs text-gray-600 mt-1"
              style={{
                fontSize: '12px',
                marginTop: '3px',
                color: '#666'
              }}
            >
              <span className="font-bold">URL:</span>
              <span className="break-all">
                {' '}{endpoint.urlA}
              </span>
            </div>
          </div>

          <div>
            <div 
              className="text-sm text-gray-500 mb-1"
              style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '5px'
              }}
            >
              Staging (B)
            </div>
            <div 
              className="flex items-center gap-2"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span 
                className="text-green-500 font-bold"
                style={{
                  fontSize: '15px',
                  color: '#2ecc71',
                  fontWeight: 'bold'
                }}
              >
                {endpoint.responseTimeB} ms
              </span>
              <span 
                className="text-xs text-gray-500"
                style={{
                  color: '#888',
                  fontSize: '12px'
                }}
              >
                at {timeB}
              </span>
              {fasterResp === 'B' && (
                <span 
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginLeft: '5px'
                  }}
                >
                  🚀 Faster
                </span>
              )}
            </div>
            <div 
              className="text-xs text-gray-600 mt-1"
              style={{
                fontSize: '12px',
                marginTop: '3px',
                color: '#666'
              }}
            >
              <span className="font-bold">URL:</span>
              <span className="break-all">
                {' '}{endpoint.urlB}
              </span>
            </div>
          </div>
        </div>
        
        <div 
          className="mt-2 text-xs text-gray-500"
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#888'
          }}
        >
          <span 
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            style={{
              background: '#2980b9',
              color: 'white',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Geo: {endpoint.cbLoc}
          </span>
        </div>
      </div>

      {/* Diff Section - Only show if there are diffs */}
      {hasDiffs && (
        <div className="px-4 py-2">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              className="show-diff-btn px-3 py-1 rounded text-white text-sm flex items-center gap-1"
              onClick={() => setShowDiffs(!showDiffs)}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Code size={16} />
              {showDiffs ? "Hide Diffs" : "Show Diffs"}
              {showDiffs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <button
              className="show-json-btn px-3 py-1 rounded text-white text-sm flex items-center gap-1"
              onClick={() => setShowRawJson(!showRawJson)}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FileJson size={16} />
              {showRawJson ? "Hide JSON" : "Show JSON"}
              {showRawJson ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Critical Changes Summary - Always visible */}
          {criticalDiffs.length > 0 && (
            <div 
              className="critical-diffs mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-sm"
              style={{
                background: '#ffebee',
                borderLeft: '4px solid #f44336',
                padding: '8px 12px',
                marginBottom: '12px',
                borderRadius: '0 4px 4px 0'
              }}
            >
              <div className="font-semibold mb-1">Critical Changes:</div>
              <ul className="list-disc pl-4 mt-1">
                {criticalDiffs.map((diff, idx) => (
                  <li key={idx} className="text-red-700">
                    {`Field ${diff.path?.join('.')} was ${diff.kind === 'D' ? 'deleted' : diff.kind === 'N' ? 'added' : 'changed'}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Full Diffs - Collapsible */}
          {showDiffs && (
            <div 
              className="diff-container"
              style={{
                marginTop: '15px'
              }}
            >
              {/* If there are structural diffs */}
              {structuralDiffs.length > 0 && (
                <div className="mb-3">
                  <div 
                    className="font-semibold mb-2 text-sm"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}
                  >
                    Structural Changes ({structuralDiffs.length})
                  </div>
                  <div 
                    className="bg-gray-50 p-3 rounded"
                    style={{
                      background: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '4px'
                    }}
                  >
                    <DiffViewer diffs={structuralDiffs} />
                  </div>
                </div>
              )}
              
              {/* If there are value diffs */}
              {valueDiffs.length > 0 && (
                <div className="mb-3">
                  <div 
                    className="font-semibold mb-2 text-sm"
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}
                  >
                    Value Changes ({valueDiffs.length})
                  </div>
                  <div 
                    className="bg-gray-50 p-3 rounded"
                    style={{
                      background: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '4px'
                    }}
                  >
                    <DiffViewer diffs={valueDiffs} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Raw JSON Comparison - Collapsible */}
          {showRawJson && (
            <div 
              className="json-side-by-side flex gap-4 mt-2 mb-3"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                marginTop: '0.5rem',
                marginBottom: '0.75rem'
              }}
            >
              <div 
                className="json-pane flex-1 bg-white border border-gray-200 p-2 overflow-auto max-h-[300px] text-xs"
                style={{
                  flex: 1,
                  background: '#fefefe',
                  border: '1px solid #ddd',
                  padding: '0.5rem',
                  overflow: 'auto',
                  maxHeight: '300px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              >
                <div className="font-semibold mb-1">Prod (A)</div>
                <pre className="text-xs">
                  {endpoint.rawJsonA ? JSON.stringify(endpoint.rawJsonA, null, 2) : "No response data available"}
                </pre>
              </div>
              <div 
                className="json-pane flex-1 bg-white border border-gray-200 p-2 overflow-auto max-h-[300px] text-xs"
                style={{
                  flex: 1,
                  background: '#fefefe',
                  border: '1px solid #ddd',
                  padding: '0.5rem',
                  overflow: 'auto',
                  maxHeight: '300px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              >
                <div className="font-semibold mb-1">Staging (B)</div>
                <pre className="text-xs">
                  {endpoint.rawJsonB ? JSON.stringify(endpoint.rawJsonB, null, 2) : "No response data available"}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EndpointCard;
