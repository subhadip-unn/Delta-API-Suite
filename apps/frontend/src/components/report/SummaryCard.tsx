import { useState } from 'react';
import { ReportJob } from './types';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryCardProps {
  job: ReportJob;
}

const SummaryCard = ({ job }: SummaryCardProps) => {
  const [headersExpanded, setHeadersExpanded] = useState(false);
  
  const ts = new Date(job.timestamp).toLocaleString();
  const s = job.summary;
  const meta = job.meta;
  const qa = job.testEngineer;

  return (
    <div 
      className="summary-card bg-white rounded-lg p-4 mb-5 shadow-sm"
      style={{ 
        background: '#fff',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
      }}
    >
      {/* Schema Notice */}
      <div 
        className="schema-notice mb-4 flex items-center p-3 rounded"
        style={{
          background: '#fff9e6',
          padding: '12px',
          borderLeft: '4px solid #f1c40f',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <AlertCircle className="mr-2 text-yellow-500" size={18} />
        <div>
          <strong>Note:</strong> This report does <em>not</em> perform JSON‐schema validation. 
          It only compares raw structures. To add schema‐based checks, integrate a JSON Schema validator.
        </div>
      </div>
      
      {/* Job Title with Environment Badges */}
      <div 
        className="flex items-center pb-4 mb-4 border-b border-gray-100"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '15px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}
      >
        <h2 
          className="text-xl font-semibold m-0 flex-1"
          style={{
            margin: 0,
            flex: 1,
            fontSize: '22px'
          }}
        >
          {job.jobName}
        </h2>
        <div>
          <span 
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-1"
            style={{
              background: '#3498db',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              marginRight: '5px',
              fontSize: '12px'
            }}
          >
            PROD
          </span>
          <span 
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
            style={{
              background: '#2ecc71',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            STAGING
          </span>
        </div>
      </div>

      {/* Test metadata in a clean two-column layout */}
      <div 
        className="flex flex-wrap"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}
      >
        {/* Left column - test details */}
        <div 
          className="flex-1 min-w-[300px] pr-4"
          style={{
            flex: '1',
            minWidth: '300px',
            paddingRight: '15px'
          }}
        >
          <div className="mb-4">
            <div 
              className="text-base font-semibold text-gray-700 pb-1 mb-1 border-b border-dashed border-gray-100"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '5px',
                borderBottom: '1px dashed #eee',
                paddingBottom: '3px'
              }}
            >
              Test Information
            </div>
            <div 
              className="grid grid-cols-[140px_1fr] gap-y-1 text-sm"
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                rowGap: '5px',
                fontSize: '14px'
              }}
            >
              <div className="text-gray-500">Test Engineer:</div>
              <div className="font-medium">{qa}</div>
              
              <div className="text-gray-500">Generated On:</div>
              <div className="font-medium">{ts}</div>
              
              <div className="text-gray-500">Endpoints Tested:</div>
              <div className="font-medium">{meta.endpointsRun.join(", ")}</div>
              
              <div className="text-gray-500">IDs Used:</div>
              <div className="font-medium">{meta.idsUsed.join(", ")}</div>
              
              <div className="text-gray-500">Geo Locations:</div>
              <div className="font-medium">{meta.geoUsed.join(", ")}</div>
            </div>
          </div>
        </div>
        
        {/* Right column - test results */}
        <div 
          className="flex-1 min-w-[300px]"
          style={{
            flex: '1',
            minWidth: '300px'
          }}
        >
          <div>
            <div 
              className="text-base font-semibold text-gray-700 pb-1 mb-1 border-b border-dashed border-gray-100"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '5px',
                borderBottom: '1px dashed #eee',
                paddingBottom: '3px'
              }}
            >
              Test Results
            </div>
            <div 
              className="grid grid-cols-4 gap-2 mb-4"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '15px'
              }}
            >
              <div 
                className="bg-gray-50 p-2 rounded text-center"
                style={{
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                <div 
                  className="text-2xl font-semibold"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600
                  }}
                >
                  {s.totalComparisons}
                </div>
                <div 
                  className="text-xs text-gray-500 mt-1"
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '5px'
                  }}
                >
                  Total Tests
                </div>
              </div>
              <div 
                className="bg-green-50 p-2 rounded text-center"
                style={{
                  background: '#e7f5ea',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                <div 
                  className="text-2xl font-semibold text-green-600"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#27ae60'
                  }}
                >
                  {s.successful}
                </div>
                <div 
                  className="text-xs text-green-500 mt-1"
                  style={{
                    fontSize: '12px',
                    color: '#2ecc71',
                    marginTop: '5px'
                  }}
                >
                  Successful
                </div>
              </div>
              <div 
                className="bg-red-50 p-2 rounded text-center"
                style={{
                  background: '#fdedee',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                <div 
                  className="text-2xl font-semibold text-red-600"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#e74c3c'
                  }}
                >
                  {s.failures}
                </div>
                <div 
                  className="text-xs text-red-700 mt-1"
                  style={{
                    fontSize: '12px',
                    color: '#c0392b',
                    marginTop: '5px'
                  }}
                >
                  Failures
                </div>
              </div>
              <div 
                className="bg-yellow-50 p-2 rounded text-center"
                style={{
                  background: '#fff8e6',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}
              >
                <div 
                  className="text-2xl font-semibold text-yellow-600"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#f39c12'
                  }}
                >
                  {s.endpointsWithDiffs}
                </div>
                <div 
                  className="text-xs text-orange-700 mt-1"
                  style={{
                    fontSize: '12px',
                    color: '#d35400',
                    marginTop: '5px'
                  }}
                >
                  With Diffs
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div 
              className="legend flex text-xs gap-2"
              style={{
                marginTop: '10px',
                display: 'flex',
                fontSize: '13px',
                gap: '10px'
              }}
            >
              <div className="flex items-center">
                <span 
                  className="w-4 h-4 inline-flex items-center justify-center bg-green-50 rounded mr-1 text-green-600 text-xs"
                  style={{
                    width: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e7f5ea',
                    borderRadius: '3px',
                    color: '#27ae60',
                    fontSize: '11px',
                    marginRight: '3px'
                  }}
                >
                  ✅
                </span>
                <span>OK</span>
              </div>
              <div className="flex items-center">
                <span 
                  className="w-4 h-4 inline-flex items-center justify-center bg-yellow-50 rounded mr-1 text-yellow-600 text-xs"
                  style={{
                    width: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff8e6',
                    borderRadius: '3px',
                    color: '#f39c12',
                    fontSize: '11px',
                    marginRight: '3px'
                  }}
                >
                  ⚠️
                </span>
                <span>Warning</span>
              </div>
              <div className="flex items-center">
                <span 
                  className="w-4 h-4 inline-flex items-center justify-center bg-red-50 rounded mr-1 text-red-600 text-xs"
                  style={{
                    width: '18px',
                    height: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fdedee',
                    borderRadius: '3px',
                    color: '#e74c3c',
                    fontSize: '11px',
                    marginRight: '3px'
                  }}
                >
                  ❌
                </span>
                <span>Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Headers Section */}
      {job.headersUsed ? (
        <div 
          className="headers-section mt-4 pt-4 border-t border-gray-100"
          style={{
            marginTop: '15px',
            borderTop: '1px solid #eee',
            paddingTop: '15px'
          }}
        >
          <div 
            className="flex justify-between items-center cursor-pointer text-base font-semibold text-gray-700 mb-2"
            onClick={() => setHeadersExpanded(!headersExpanded)}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#444',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div>Headers Used (template for this job)</div>
            <div 
              className="toggle-btn text-gray-400 text-xl transition-transform"
              style={{
                fontSize: '22px',
                color: '#999',
                transform: headersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            >
              {headersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          <div 
            className="headers-content overflow-hidden transition-all"
            style={{
              height: headersExpanded ? '250px' : '120px',
              overflow: 'hidden',
              transition: 'height 0.3s ease'
            }}
          >
            <pre 
              className="text-sm bg-gray-50 p-3 rounded overflow-y-auto"
              style={{
                fontSize: '0.85rem',
                color: '#333',
                background: '#f9f9f9',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: 0,
                maxHeight: 'none',
                overflowY: 'auto'
              }}
            >
              {JSON.stringify(job.headersUsed, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div 
          className="mt-4 text-sm text-gray-500 italic"
          style={{
            marginTop: '15px',
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic'
          }}
        >
          Headers information not available in this report version
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
