import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  Loader2, 
  AlertCircle, 
  BarChart, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Target,
  User,
  Calendar,
  Activity,
  Clock
} from 'lucide-react';
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

const ReportFixed = () => {
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
              endpoint.urlA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              endpoint.urlB?.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status filter
            const matchesFilter = activeFilter === 'all' || 
              (activeFilter === 'passed' && (!endpoint.diffs || endpoint.diffs.length === 0)) ||
              (activeFilter === 'warnings' && endpoint.diffs && endpoint.diffs.length > 0 && endpoint.diffs.length <= 10) ||
              (activeFilter === 'errors' && endpoint.diffs && endpoint.diffs.length > 10);
            
            // Platform filter
            const matchesPlatform = selectedPlatform === 'all' || platform === selectedPlatform;
            
            return matchesSearch && matchesFilter && matchesPlatform;
          })
        };
      }
    });
    
    return groups;
  }, [report, searchQuery, activeFilter, selectedPlatform]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!report || !report.jobs) return { 
      total: 0, passed: 0, warnings: 0, errors: 0, 
      platforms: [], totalPlatforms: 0
    };
    
    let total = 0;
    let passed = 0;
    let warnings = 0;
    let errors = 0;
    const platforms = new Set<string>();

    report.jobs.forEach((job: ReportJobDetail) => {
      const platform = job.platform || 'unknown';
      if (platform) platforms.add(platform);
      
      if (job.endpoints) {
        job.endpoints.forEach((endpoint: ReportEndpoint) => {
          total++;
          
          if (endpoint.diffs && endpoint.diffs.length > 0) {
            if (endpoint.diffs.length > 10) {
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

    return {
      total,
      passed,
      warnings,
      errors,
      platforms: Array.from(platforms),
      totalPlatforms: platforms.size
    };
  }, [report]);

  const handleDownload = () => {
    if (report) {
      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Report</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link 
            to="/reports" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Report Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested report could not be found.</p>
          <Link 
            to="/reports" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center">
              <Link 
                to="/reports" 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Reports
              </Link>
              <div className="ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  API Comparison Report
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown time'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Passed</p>
                <p className="text-lg font-semibold text-green-600">{summary.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Warnings</p>
                <p className="text-lg font-semibold text-yellow-600">{summary.warnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Errors</p>
                <p className="text-lg font-semibold text-red-600">{summary.errors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QA Engineer Info - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">QA Engineer</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {report.qaName || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Test Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {report.timestamp ? new Date(report.timestamp).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platforms</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {summary.totalPlatforms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'passed', 'warnings', 'errors'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Platform Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedPlatform === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Platforms
              </button>
              {summary.platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    selectedPlatform === platform
                      ? getPlatformColor(platform)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getPlatformIcon(platform)}
                  <span className="ml-2">{getPlatformName(platform)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Platform-Specific Sections - Responsive */}
        <div className="space-y-8">
          {Object.entries(platformGroups).map(([platform, { job, endpoints }]) => (
            <div key={platform} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* Platform Header - Responsive */}
              <div className={`px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${getPlatformColor(platform)} rounded-t-lg`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    {getPlatformIcon(platform)}
                    <h2 className="ml-3 text-lg sm:text-xl font-semibold">
                      {getPlatformName(platform)} Platform
                    </h2>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      <span>{endpoints.length} endpoints</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{job.timestamp ? new Date(job.timestamp).toLocaleTimeString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endpoints List - Responsive */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {endpoints.map((endpoint, index) => (
                  <div key={`${platform}-${endpoint.key}-${index}`} className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Endpoint Header - Responsive */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {endpoint.key}
                          </h3>
                          <div className="flex items-center">
                            {endpoint.diffs && endpoint.diffs.length > 0 ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                endpoint.diffs.length > 10 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {endpoint.diffs.length} differences
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Passed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* URLs - Responsive */}
                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Production (A)</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                              {endpoint.urlA}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Staging (B)</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                              {endpoint.urlB}
                            </p>
                          </div>
                        </div>

                        {/* Differences Preview - Responsive */}
                        {endpoint.diffs && endpoint.diffs.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Differences Found: {endpoint.diffs.length}
                            </p>
                            <div className="space-y-1">
                              {endpoint.diffs.slice(0, 3).map((diff, diffIndex) => (
                                <div key={diffIndex} className="text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    diff.kind === 'D' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    diff.kind === 'N' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    diff.kind === 'E' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {diff.kind === 'D' ? 'DELETED' :
                                     diff.kind === 'N' ? 'NEW' :
                                     diff.kind === 'E' ? 'EDITED' : 'ARRAY'}
                                  </span>
                                  <span className="ml-2 font-mono text-gray-600 dark:text-gray-400 break-all">
                                    {diff.path ? diff.path.join('.') : 'root'}
                                  </span>
                                </div>
                              ))}
                              {endpoint.diffs.length > 3 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ... and {endpoint.diffs.length - 3} more differences
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Monaco Diff Button - Responsive */}
                      <div className="flex-shrink-0 w-full lg:w-auto">
                        <UniversalMonacoDiffViewer
                          leftData={endpoint.rawJsonA}
                          rightData={endpoint.rawJsonB}
                          leftTitle="Production (A)"
                          rightTitle="Staging (B)"
                          modalMode={true}
                          platform={platform}
                          geo={endpoint.cbLoc || 'Unknown'}
                          endpoint={endpoint.key}
                          modalTrigger={
                            <button className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800">
                              Professional Diff
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {endpoints.length === 0 && (
                  <div className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No endpoints found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery || activeFilter !== 'all' || selectedPlatform !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No endpoint comparisons are available for this platform.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {Object.keys(platformGroups).length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No platforms found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No platform data is available for this report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFixed;
