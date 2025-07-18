
import { ReportDiff } from './types';

interface DiffViewerProps {
  diffs: ReportDiff[];
}

const DiffViewer = ({ diffs }: DiffViewerProps) => {
  if (!diffs || diffs.length === 0) {
    return <div className="text-sm text-gray-500">No differences detected</div>;
  }

  // Helper to format JSON values safely and maintain readability
  const formatValue = (value: any): string => {
    if (value === undefined) return '<undefined>';
    if (value === null) return '<null>';
    if (typeof value === 'object') {
      try {
        // Use pretty formatting for small objects, compact for larger ones
        const json = JSON.stringify(value, null, 2);
        return json.length > 200 ? JSON.stringify(value) : json;
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  };

  // Get severity badge based on diff kind
  const getSeverityBadge = (kind: 'E' | 'A' | 'D' | 'N') => {
    let bgColor = '#e7f5ea';
    let textColor = '#27ae60';
    let icon = '✓';
    let label = 'Modified';

    if (kind === 'D') {
      bgColor = '#fdedee';
      textColor = '#e74c3c';
      icon = '❌';
      label = 'Deleted';
    } else if (kind === 'N') {
      bgColor = '#e7f5ea';
      textColor = '#27ae60';
      icon = '➕';
      label = 'Added';
    } else if (kind === 'E') {
      bgColor = '#fff8e6';
      textColor = '#f39c12';
      icon = '⚠️';
      label = 'Changed';
    } else if (kind === 'A') {
      bgColor = '#e3f2fd';
      textColor = '#1976d2';
      icon = '🔄';
      label = 'Array';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          backgroundColor: bgColor,
          color: textColor,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginRight: '8px'
        }}
      >
        {icon} {label}
      </span>
    );
  };

  // Get change type badge
  const getChangeTypeBadge = (kind: string) => {
    let bgColor = '#e3f2fd';
    let textColor = '#1976d2';
    let label = 'Changed';

    if (kind === 'N') {
      bgColor = '#e8f5e9';
      textColor = '#388e3c';
      label = 'Added';
    } else if (kind === 'D') {
      bgColor = '#ffebee';
      textColor = '#d32f2f';
      label = 'Removed';
    } else if (kind === 'A') {
      bgColor = '#e8eaf6';
      textColor = '#3f51b5';
      label = 'Array Change';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          backgroundColor: bgColor,
          color: textColor,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          marginRight: '8px'
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="diff-viewer">
      <table
        className="w-full text-sm"
        style={{
          width: '100%',
          fontSize: '0.875rem',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f8f9fa',
              textAlign: 'left'
            }}
          >
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                borderBottom: '1px solid #eee'
              }}
            >
              Path
            </th>
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                borderBottom: '1px solid #eee'
              }}
            >
              Change
            </th>
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                borderBottom: '1px solid #eee'
              }}
            >
              Production Value
            </th>
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                borderBottom: '1px solid #eee'
              }}
            >
              Staging Value
            </th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((diff, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #eee'
              }}
            >
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {getSeverityBadge(diff.kind)}
                  </div>
                  <div 
                    className="font-mono text-blue-700"
                    style={{
                      fontFamily: 'monospace',
                      color: '#0066cc'
                    }}
                  >
                    {diff.path?.join('.') || 'root'}
                  </div>
                  {/* Message removed as it's not in ReportDiff type */}
                </div>
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top'
                }}
              >
                {getChangeTypeBadge(diff.kind)}
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: diff.kind === 'D' ? 'rgba(255, 235, 238, 0.3)' : 'inherit',
                  color: diff.kind === 'D' ? '#d32f2f' : 'inherit'
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxWidth: '300px',
                    overflow: 'auto'
                  }}
                >
                  {formatValue(diff.lhs)}
                </pre>
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: diff.kind === 'N' ? 'rgba(232, 245, 233, 0.3)' : 'inherit',
                  color: diff.kind === 'N' ? '#388e3c' : 'inherit'
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxWidth: '300px',
                    overflow: 'auto'
                  }}
                >
                  {formatValue(diff.rhs)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiffViewer;
