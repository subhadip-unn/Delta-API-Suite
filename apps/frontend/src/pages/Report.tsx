import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { ChevronLeft, Download, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';

import SummaryCard from '../components/report/SummaryCard';
import SearchFilter from '../components/report/SearchFilter';
import EndpointCard from '../components/report/EndpointCard';
import type { Report as ReportType, ReportJob, ReportEndpoint, FilterType } from '../components/report/types';

const Report = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { toast } = useToast();
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<ReportJob | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (reportId) {
      setLoading(true);
      setError(null);

      const fetchReport = async () => {
        try {
          const response = await apiService.getReport(reportId);
          if (response.success && response.report) {
            setReport({
              id: reportId,
              timestamp: response.report.timestamp || new Date().toISOString(),
              testEngineer: response.report.testEngineer,
              jobName: response.report.jobName,
              platform: response.report.platform,
              totalTasks: response.report.totalTasks,
              failures: response.report.failures,
              diffsFound: response.report.diffsFound,
              summary: response.report.summary,
              meta: response.report.meta,
              headersUsed: response.report.headersUsed,
              endpoints: response.report.endpoints,
              jobs: response.report.jobs
            });
            setCurrentJob(response.report);
          } else {
            setError(response.error || 'Failed to load report');
          }
        } catch (err: any) {
          const errorMessage = err.message || 'Failed to load report';
          setError(errorMessage);
          toast({
            title: "Error Loading Report",
            description: errorMessage,
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [reportId]);

  // Function to filter endpoints based on search query and filter type
  const filteredEndpoints = useMemo(() => {
    const searchTerm = searchQuery;
    const filter = activeFilter;

    return currentJob?.endpoints?.filter((endpoint: ReportEndpoint) => {
      const matchesSearch = !searchTerm || 
        endpoint.key.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = (() => {
        switch (filter) {
          case 'errors':
            return endpoint.error !== null && endpoint.error !== undefined;
          case 'warnings':
            return endpoint.diffs && endpoint.diffs.length > 0;
          case 'failures':
            return endpoint.statusA !== 200 || endpoint.statusB !== 200;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesFilter;
    }) || [];
    
    // Count stats for filtered endpoints
    // const errorCount = filteredEndpoints.filter((endpoint: ReportEndpoint) => 
    //   endpoint.error !== null && endpoint.error !== undefined
    // ).length;
    // 
    // const warningCount = filteredEndpoints.filter((endpoint: ReportEndpoint) => 
    //   endpoint.diffs && endpoint.diffs.length > 0
    // ).length;
    // 
    // const failureCount = filteredEndpoints.filter((endpoint: ReportEndpoint) => 
    //   endpoint.statusA !== 200 || endpoint.statusB !== 200
    // ).length;
  }, [searchQuery, activeFilter, currentJob]);

  // Function to download report as JSON
  const handleDownload = () => {
    if (report) {
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Using a safe way to access document for SSR-safety
      if (typeof document !== 'undefined') {
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `report-${reportId}.json`);
        linkElement.click();
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[80vh] max-w-full overflow-x-hidden">
        <div className="text-center">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" /> 
          <p className="mt-4 text-lg">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-full overflow-x-hidden">
        <Link to="/config" className="inline-flex items-center mb-6 text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold mb-2">Error Loading Report</h2>
            <p>{error}</p>
            <Button
              variant="outline" 
              size="sm" 
              className="mt-4 bg-white dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => window.location.href = '/config'}
            >
              Return to Config
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no job data is available
  if (!report?.jobs || report.jobs.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-full overflow-x-hidden">
        <Link to="/config" className="inline-flex items-center mb-6 text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        
        <div className="bg-orange-50 p-4 rounded-md border border-orange-300 text-orange-800">
          <h2 className="text-lg font-semibold mb-2">Empty Report</h2>
          <p>This report does not contain any job data. This could be due to:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>An error during the API comparison process</li>
            <li>No endpoints were configured or available for comparison</li>
            <li>The comparison was initiated but didn't complete successfully</li>
          </ul>
          
          <div className="mt-4 p-2 bg-gray-100 rounded-md">
            <h3 className="text-sm font-semibold">Debug Info:</h3>
            <pre className="text-xs mt-1 whitespace-pre-wrap">
              Report ID: {reportId}\n
              Report Data: {JSON.stringify(report, null, 2).substring(0, 500)}...
            </pre>
          </div>
          
          <div className="mt-4">
            <p className="font-medium">Possible solutions:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Check your API endpoints and make sure they are accessible</li>
              <li>Verify your configuration includes valid jobs and endpoints</li>
              <li>Try running a new comparison with a simpler configuration first</li>
            </ul>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <Link to="/config">
              <Button size="sm" variant="secondary">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Config
              </Button>
            </Link>
            <Button size="sm" onClick={handleDownload} variant="outline">
              <Download className="mr-1 h-4 w-4" /> Download Report JSON
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-full overflow-x-hidden">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/config" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <Button size="sm" onClick={handleDownload} variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" /> Download JSON
        </Button>
      </div>
      
      {/* Job title with enhanced styling to match legacy report */}
      <div 
        className="border-b-0 p-4 rounded-t-lg"
        style={{
          background: 'linear-gradient(to right, #e8f4fd, #f1f9fe)',
          borderTop: '1px solid #c1e1fc',
          borderLeft: '1px solid #c1e1fc',
          borderRight: '1px solid #c1e1fc',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <h1 
          className="text-xl font-bold" 
          style={{ color: '#2c3e50' }}
        >
          {currentJob?.jobName || 'Prod v1 vs Stg v2'}
        </h1>
      </div>
      
      {currentJob && (
        <SummaryCard job={currentJob} />
      )}
      
      {/* Job tabs removed since we have single job structure now */}
      
      <div className="mt-6">
        <div 
          className="p-3 mb-4 border border-blue-100 rounded-lg bg-blue-50"
          style={{
            backgroundColor: '#f0f7ff',
            borderColor: '#cce3ff'
          }}
        >
          <SearchFilter 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 
          className="text-lg font-medium mb-3 pb-2 border-b"
          style={{
            color: '#34495e', 
            borderBottomColor: '#eaeaea',
            fontWeight: 600
          }}
        >
          <span>Endpoints </span>
          <span
            className="text-base font-normal"
            style={{ color: '#7f8c8d' }}
          >
            ({filteredEndpoints.length} of {currentJob?.endpoints?.length || 0} showing)
          </span>
        </h3>
        
        {filteredEndpoints.length === 0 ? (
          <div 
            className="p-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md text-center border border-gray-100 dark:border-gray-700"
            style={{
              color: '#7f8c8d',
              backgroundColor: '#f9f9f9',
              borderColor: '#eee'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mx-auto mb-3 text-gray-400"
              style={{ opacity: 0.5 }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>No endpoints match the current filters</p>
            <p className="text-sm mt-2" style={{ color: '#95a5a6' }}>
              Try changing your search query or filter selection
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint: ReportEndpoint, index: number) => (
              <EndpointCard key={index} endpoint={endpoint} />
            ))}
          </div>
        )}
      </div>
      
      {/* Success toast - shown only when report is loaded successfully and not showing error */}
      {report && !error && (
        <div 
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 text-sm border border-gray-200 dark:border-gray-700 flex items-center"
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'slideInUp 0.3s ease-out forwards'
          }}
        >
          <div 
            className="h-5 w-5 mr-2 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#27ae60' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <p className="font-medium dark:text-white">Comparison Complete</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Report generated for {report?.jobs?.[0]?.testEngineer || report?.testEngineer || "QA Engineer"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
