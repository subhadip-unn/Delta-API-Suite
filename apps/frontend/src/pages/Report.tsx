import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Download, Loader2, AlertCircle, BarChart, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import { apiService } from '../services/api';
import DiffViewer from '../components/report/DiffViewer';
import type { Report as ReportType, ReportJobDetail, ReportEndpoint, FilterType } from '../components/report/types';

const Report = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ReportEndpoint | null>(null);
  const [showDiffViewer, setShowDiffViewer] = useState(false);

  useEffect(() => {
    if (reportId) {
      setLoading(true);
      setError(null);

      const fetchReport = async () => {
        try {
          const response = await apiService.getReport(reportId);
          if (response.success && response.report) {
            setReport(response.report);
          } else {
            setError(response.error || 'Failed to load report');
          }
        } catch (err: any) {
          const errorMessage = err.message || 'Failed to load report';
          setError(errorMessage);
          console.error('Error fetching report:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [reportId]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!report || !report.jobs) return { total: 0, passed: 0, warnings: 0, errors: 0 };
    
    let total = 0;
    let passed = 0;
    let warnings = 0;
    let errors = 0;

    report.jobs.forEach((job: ReportJobDetail) => {
      if (job.endpoints) {
        job.endpoints.forEach((endpoint: ReportEndpoint) => {
          total++;
          if (endpoint.diffs && endpoint.diffs.length > 0) {
            const hasErrors = endpoint.diffs.some(diff => diff.kind === 'D' || diff.kind === 'N');
            if (hasErrors) {
              errors++;
            } else {
              warnings++;
            }
          } else {
            passed++;
          }
        });
      }
    });

    return { total, passed, warnings, errors };
  }, [report]);

  // Filter endpoints based on search and filter
  const filteredEndpoints = useMemo(() => {
    if (!report || !report.jobs) return [];
    
    let allEndpoints: ReportEndpoint[] = [];
    report.jobs.forEach((job: ReportJobDetail) => {
      if (job.endpoints) {
        allEndpoints = [...allEndpoints, ...job.endpoints];
      }
    });

    return allEndpoints.filter((endpoint: ReportEndpoint) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!endpoint.key.toLowerCase().includes(searchLower) &&
            !endpoint.urlA.toLowerCase().includes(searchLower) &&
            !endpoint.urlB.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (activeFilter !== 'all') {
        const hasDiffs = endpoint.diffs && endpoint.diffs.length > 0;
        const hasErrors = hasDiffs && endpoint.diffs.some(diff => diff.kind === 'D' || diff.kind === 'N');
        
        if (activeFilter === 'errors' && !hasErrors) return false;
        if (activeFilter === 'warnings' && (!hasDiffs || hasErrors)) return false;
        if (activeFilter === 'failures' && !hasErrors) return false;
      }

      return true;
    });
  }, [report, searchQuery, activeFilter]);

  const handleDownload = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `report_${reportId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleViewDiff = (endpoint: ReportEndpoint) => {
    setSelectedEndpoint(endpoint);
    setShowDiffViewer(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/config" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Config
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The requested report could not be found.</p>
          <Link 
            to="/config" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Config
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link 
                  to="/config" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Config
                </Link>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download JSON
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">API Comparison Report</h1>
              <p className="text-sm text-gray-600">
                Generated on {new Date(report.timestamp || Date.now()).toLocaleString()}
                {report.testEngineer && (
                  <span className="ml-4">QA Engineer: <span className="font-medium">{report.testEngineer}</span></span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Endpoints</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Passed</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Warnings</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.warnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Errors</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.errors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by endpoint, key or diff path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('errors')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'errors'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Errors
                </button>
                <button
                  onClick={() => setActiveFilter('warnings')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'warnings'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Warnings
                </button>
                <button
                  onClick={() => setActiveFilter('failures')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeFilter === 'failures'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Failures
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoint Comparisons */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Endpoint Comparisons ({filteredEndpoints.length} of {summary.total} showing)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEndpoints.map((endpoint: ReportEndpoint, index: number) => (
              <div key={`${endpoint.key}-${index}`} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {endpoint.diffs && endpoint.diffs.length > 0 ? (
                          endpoint.diffs.some(diff => diff.kind === 'D' || diff.kind === 'N') ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">{endpoint.key}</h3>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {endpoint.cbLoc?.toUpperCase() || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Prod (A)</p>
                        <p className="text-sm text-gray-900 font-mono break-all">{endpoint.urlA}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Staging (B)</p>
                        <p className="text-sm text-gray-900 font-mono break-all">{endpoint.urlB}</p>
                      </div>
                    </div>

                    {endpoint.diffs && endpoint.diffs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Differences Found: {endpoint.diffs.length}
                        </p>
                        <div className="space-y-1">
                          {endpoint.diffs.slice(0, 3).map((diff, diffIndex) => (
                            <div key={diffIndex} className="text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                diff.kind === 'D' ? 'bg-red-100 text-red-800' :
                                diff.kind === 'N' ? 'bg-green-100 text-green-800' :
                                diff.kind === 'E' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {diff.kind === 'D' ? 'DELETED' :
                                 diff.kind === 'N' ? 'NEW' :
                                 diff.kind === 'E' ? 'EDITED' : 'ARRAY'}
                              </span>
                              <span className="ml-2 font-mono text-gray-600">
                                {diff.path ? diff.path.join('.') : 'root'}
                              </span>
                            </div>
                          ))}
                          {endpoint.diffs.length > 3 && (
                            <p className="text-sm text-gray-500">
                              ... and {endpoint.diffs.length - 3} more differences
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleViewDiff(endpoint)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      Professional Diff
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEndpoints.length === 0 && (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
                <p className="text-gray-600">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No endpoint comparisons are available for this report.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diff Viewer Modal */}
      {showDiffViewer && selectedEndpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Diff Viewer - {selectedEndpoint.key}</h3>
              <button
                onClick={() => {
                  setShowDiffViewer(false);
                  setSelectedEndpoint(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              <DiffViewer diffs={selectedEndpoint.diffs || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
