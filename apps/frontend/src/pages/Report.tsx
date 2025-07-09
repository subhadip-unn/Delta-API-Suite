import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

import JobTabs from '../components/report/JobTabs';
import SummaryCard from '../components/report/SummaryCard';
import SearchFilter from '../components/report/SearchFilter';
import EndpointCard from '../components/report/EndpointCard';
import type { Report, FilterType } from '../components/report/types';

const Report = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);
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
            setReport(response.report as Report);
            console.log('Loaded report:', response.report);
          } else {
            setError(response.error || 'Failed to load report');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load report');
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [reportId]);

  // Get currently selected job
  const selectedJob = useMemo(() => {
    if (!report || !report.jobs || report.jobs.length === 0) return null;
    return report.jobs[selectedJobIndex] || report.jobs[0];
  }, [report, selectedJobIndex]);

  // Function to filter endpoints based on search query and filter type
  const filteredEndpoints = useMemo(() => {
    if (!selectedJob || !selectedJob.endpoints) return [];
    
    return selectedJob.endpoints.filter(endpoint => {
      // First apply search filter if provided
      const matchesSearch = searchQuery === '' || 
        endpoint.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.urlA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.urlB?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Search through diff paths for the query
        endpoint.diffs?.some(diff => 
          diff.path?.join('.').toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      if (!matchesSearch) return false;
      
      // Then apply status filter
      switch (activeFilter) {
        case 'errors':
          return (endpoint.diffCounts?.total ?? 0) > 0 || endpoint.responseA?.error || endpoint.responseB?.error;
        case 'warnings':
          return endpoint.diffs?.some(diff => diff.kind === 'E' || diff.kind === 'D');
        case 'failures':
          return (endpoint.diffCounts?.total ?? 0) > 0;
        case 'all':
        default:
          return true;
      }
    });
  }, [selectedJob, searchQuery, activeFilter]);

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
      <div className="container mx-auto p-6 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" /> 
          <p className="mt-4 text-lg">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Link to="/config" className="inline-flex items-center mb-6 text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <div className="bg-red-50 p-4 rounded-md border border-red-300 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error Loading Report</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If no job data is available
  if (!report?.jobs || report.jobs.length === 0) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/config" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <Button size="sm" onClick={handleDownload} variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" /> Download JSON
        </Button>
      </div>
      
      {/* Job title - matches old UI more closely, but now theme-aware */}
      <div className="bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900 border p-3 rounded-t-lg">
        <h1 className="text-lg font-bold dark:text-white">{selectedJob?.jobName || 'Prod v1 vs Stg v2'}</h1>
      </div>
      
      {selectedJob && (
        <SummaryCard job={selectedJob} />
      )}
      
      {report && report.jobs && report.jobs.length > 1 && (
        <JobTabs 
          jobs={report.jobs} 
          selectedJobIndex={selectedJobIndex} 
          onSelectJob={setSelectedJobIndex} 
        />
      )}
      
      <div className="mt-6">
        <SearchFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Endpoints ({filteredEndpoints.length} of {selectedJob?.endpoints?.length || 0} showing)</h3>
        
        {filteredEndpoints.length === 0 ? (
          <div className="p-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
            No endpoints match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, index) => (
              <EndpointCard key={index} endpoint={endpoint} />
            ))}
          </div>
        )}
      </div>
      
      {/* Success toast that matches old UI - now dark mode compatible */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-3 text-sm border border-gray-200 dark:border-gray-700 flex items-center">
        <Loader2 className="h-4 w-4 text-green-500 mr-2 animate-spin" />
        <div>
          <p className="font-medium dark:text-white">Comparison Complete</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Report generated for {report?.testEngineer || "QA Engineer"}</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
