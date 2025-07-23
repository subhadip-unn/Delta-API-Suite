import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Download, Loader2, AlertCircle, BarChart, CheckCircle, AlertTriangle, XCircle, Search, Smartphone, Monitor, Tablet, Target } from 'lucide-react';
import { apiService } from '../services/api';
import UniversalMonacoDiffViewer from '../components/shared/UniversalMonacoDiffViewer';
import type { Report as ReportType, ReportJobDetail, ReportEndpoint, FilterType } from '../components/report/types';

// Platform helpers
const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'i': case 'ios': return <Smartphone className="h-4 w-4" />;
    case 'a': case 'android': return <Tablet className="h-4 w-4" />;
    case 'w': case 'web': case 'm': case 'mobile': return <Monitor className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

const getPlatformName = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'i': return 'iOS';
    case 'a': return 'Android';
    case 'w': return 'Website';
    case 'm': return 'Mobile Web';
    default: return platform?.toUpperCase() || 'Unknown';
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'i': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
    case 'a': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
    case 'w': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200';
    case 'm': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
  }
};

const Report = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');


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

  // Calculate enhanced summary statistics for multi-platform reporting
  const summary = useMemo(() => {
    if (!report || !report.jobs) return { 
      total: 0, passed: 0, warnings: 0, errors: 0, 
      platforms: [], totalPlatforms: 0, totalEndpoints: 0,
      avgResponseTime: 0, totalDiffs: 0, platformStats: {}
    };
    
    let total = 0;
    let passed = 0;
    let warnings = 0;
    let errors = 0;
    let totalDiffs = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    const platformStats: Record<string, any> = {};
    const platforms = new Set<string>();

    report.jobs.forEach((job: ReportJobDetail) => {
      const platform = job.platform || 'unknown';
      if (platform) platforms.add(platform);
      
      if (!platformStats[platform]) {
        platformStats[platform] = {
          name: getPlatformName(platform),
          total: 0,
          passed: 0,
          warnings: 0,
          errors: 0,
          endpoints: 0,
          avgResponseTime: 0
        };
      }
      
      if (job.endpoints) {
        job.endpoints.forEach((endpoint: ReportEndpoint) => {
          total++;
          platformStats[platform].total++;
          platformStats[platform].endpoints++;
          
          // Track response times (using available properties)
          if ((endpoint as any).responseA?.timeMs) {
            totalResponseTime += (endpoint as any).responseA.timeMs;
            responseTimeCount++;
          }
          if ((endpoint as any).responseB?.timeMs) {
            totalResponseTime += (endpoint as any).responseB.timeMs;
            responseTimeCount++;
          }
          
          if (endpoint.diffs && endpoint.diffs.length > 0) {
            totalDiffs += endpoint.diffs.length;
            const hasErrors = endpoint.diffs.some(diff => diff.kind === 'D' || diff.kind === 'N');
            if (hasErrors) {
              errors++;
              platformStats[platform].errors++;
            } else {
              warnings++;
              platformStats[platform].warnings++;
            }
          } else {
            passed++;
            platformStats[platform].passed++;
          }
        });
      }
    });

    const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return { 
      total, passed, warnings, errors, totalDiffs,
      platforms: Array.from(platforms), 
      totalPlatforms: platforms.size, 
      totalEndpoints: total,
      avgResponseTime,
      platformStats
    };
  }, [report]);

  // Group endpoints by platform for platform-specific sections
  const platformGroups = useMemo(() => {
    if (!report || !report.jobs) return {};
    
    const groups: Record<string, { job: ReportJobDetail; endpoints: ReportEndpoint[] }> = {};
    
    report.jobs.forEach((job: ReportJobDetail) => {
      if (job.endpoints && job.endpoints.length > 0) {
        const platform = job.platform || 'unknown';
        groups[platform] = {
          job,
          endpoints: job.endpoints.filter((endpoint: ReportEndpoint) => {
            // Search filter
            const matchesSearch = !searchQuery || 
              endpoint.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              endpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              endpoint.urlA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              endpoint.urlB?.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status filter
            const matchesFilter = activeFilter === 'all' || 
              (activeFilter === 'passed' && (!endpoint.diffs || endpoint.diffs.length === 0)) ||
              (activeFilter === 'warnings' && endpoint.diffs && endpoint.diffs.length > 0 && endpoint.diffs.length <= 5) ||
              (activeFilter === 'errors' && endpoint.diffs && endpoint.diffs.length > 5);
            
            // Platform filter
            const matchesPlatform = activePlatform === 'all' || platform === activePlatform;
            
            // Differences filter
            const matchesDifferences = !showOnlyDifferences || (endpoint.diffs && endpoint.diffs.length > 0);
            
            return matchesSearch && matchesFilter && matchesPlatform && matchesDifferences;
          })
        };
      }
    });
    
    return groups;
  }, [report, searchQuery, activeFilter, activePlatform, showOnlyDifferences]);

  // Get available platforms for filter
  const availablePlatforms = useMemo(() => {
    if (!report || !report.jobs) return [];
    return [...new Set(report.jobs.map(job => job.platform).filter(Boolean))];
  }, [report]);
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mt-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <BarChart className="h-8 w-8 mr-3 text-blue-600" />
                    DeltaBulkPro Report
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {reportId}
                  </span>
                  {summary.totalPlatforms > 1 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Multi-Platform
                    </span>
                  )}
                </div>
                
                {report && (
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Generated:</span>
                      <span>{new Date(report.timestamp).toLocaleString()}</span>
                    </div>
                    
                    {report.testEngineer && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Tested By:</span>
                        <span className="font-semibold text-gray-900">{report.testEngineer}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">Total Tests:</span>
                      <span className="font-semibold text-gray-900">{summary.total}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">Platforms:</span>
                      <span className="font-semibold text-gray-900">
                        {summary.totalPlatforms} ({summary.platforms.join(', ')})
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Endpoints:</span>
                      <span className="font-semibold text-gray-900">{summary.totalEndpoints}</span>
                    </div>
                    
                    {summary.avgResponseTime > 0 && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Avg Response:</span>
                        <span className="font-semibold text-gray-900">{Math.round(summary.avgResponseTime)}ms</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced DeltaBulkPro Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Endpoints</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
                <p className="text-xs text-gray-400 mt-1">Across {summary.totalPlatforms} platform{summary.totalPlatforms !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-shrink-0">
                <BarChart className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Passed</p>
                <p className="text-3xl font-bold text-green-600">{summary.passed}</p>
                <p className="text-xs text-gray-400 mt-1">{summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}% success rate</p>
              </div>
              <div className="flex-shrink-0">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Warnings</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.warnings}</p>
                <p className="text-xs text-gray-400 mt-1">Minor differences found</p>
              </div>
              <div className="flex-shrink-0">
                <AlertTriangle className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Errors</p>
                <p className="text-3xl font-bold text-red-600">{summary.errors}</p>
                <p className="text-xs text-gray-400 mt-1">Critical differences found</p>
              </div>
              <div className="flex-shrink-0">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Platform-Specific Statistics for DeltaBulkPro */}
        {summary.totalPlatforms > 1 && Object.keys(summary.platformStats).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Platform Analysis</h2>
              <span className="ml-2 text-sm text-gray-500">Detailed breakdown by platform</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(summary.platformStats).map(([platform, stats]: [string, any]) => (
                <div key={platform} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:border-blue-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getPlatformIcon(platform)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{stats.name}</h3>
                        <p className="text-sm text-gray-500">Platform: {platform.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Endpoints</span>
                      <span className="text-lg font-bold text-gray-900">{stats.endpoints}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Passed
                      </span>
                      <span className="text-lg font-bold text-green-600">{stats.passed}</span>
                    </div>
                    
                    {stats.warnings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                          Warnings
                        </span>
                        <span className="text-lg font-bold text-yellow-600">{stats.warnings}</span>
                      </div>
                    )}
                    
                    {stats.errors > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          Errors
                        </span>
                        <span className="text-lg font-bold text-red-600">{stats.errors}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Success Rate</span>
                        <span className={`text-lg font-bold ${
                          stats.endpoints > 0 && (stats.passed / stats.endpoints) >= 0.8 
                            ? 'text-green-600' 
                            : stats.endpoints > 0 && (stats.passed / stats.endpoints) >= 0.5 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {stats.endpoints > 0 ? Math.round((stats.passed / stats.endpoints) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    <UniversalMonacoDiffViewer
                      leftData={endpoint.rawJsonA}
                      rightData={endpoint.rawJsonB}
                      leftTitle="Production (A)"
                      rightTitle="Staging (B)"
                      modalMode={true}
                      platform={report?.jobs?.find(j => j.endpoints?.includes(endpoint))?.platform || 'Unknown'}
                      geo={endpoint.cbLoc || 'Unknown'}
                      endpoint={endpoint.key}
                      modalTrigger={
                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                          Professional Diff
                        </button>
                      }
                    />
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


    </div>
  );
};

export default Report;
