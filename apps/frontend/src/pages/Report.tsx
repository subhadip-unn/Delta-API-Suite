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
        endpoint.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Search through diff paths for the query
        endpoint.diffs?.some(diff => 
          diff.path?.join('.').toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      if (!matchesSearch) return false;
      
      // Then apply status filter
      switch (activeFilter) {
        case 'errors':
          return endpoint.diffs?.some(diff => diff.severity === 'Error');
        case 'warnings':
          return endpoint.diffs?.some(diff => diff.severity === 'Warning');
        case 'failures':
          return !!endpoint.error;
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
        <Link to="/" className="inline-flex items-center mb-6 text-primary hover:underline">
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

  if (!report || !report.jobs || report.jobs.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Link to="/" className="inline-flex items-center mb-6 text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-300 text-yellow-700">
          <h2 className="text-lg font-semibold mb-2">Empty Report</h2>
          <p>This report does not contain any comparison jobs.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="mt-4 flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Download Raw JSON
        </Button>
      </div>
    );
  }

  return (
    <div className="report-container bg-gray-50 min-h-screen pb-10">
      {/* Back navigation and download button */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <Link to="/" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Config
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4 mr-1" />
          Download JSON
        </Button>
      </div>

      {/* Report content */}
      {report && report.jobs && report.jobs.length > 0 && (
        <div>
          {/* Job tabs section */}
          <JobTabs 
            jobs={report.jobs} 
            selectedJobIndex={selectedJobIndex} 
            onSelectJob={setSelectedJobIndex} 
          />
          
          {/* Report content container */}
          <div className="container mx-auto px-4 py-6">
            {/* Summary card */}
            {selectedJob && (
              <SummaryCard job={selectedJob} />
            )}
            
            {/* Search and filter section */}
            <SearchFilter 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            
            {/* Endpoints section */}
            <div className="endpoints-container">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Endpoints 
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredEndpoints.length} of {selectedJob?.endpoints?.length || 0} showing)
                  </span>
                </h2>
              </div>
              
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((endpoint, index) => (
                  <EndpointCard key={index} endpoint={endpoint} />
                ))
              ) : (
                <div className="bg-white p-6 rounded text-center text-gray-500">
                  No endpoints match the current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Debug view - remove in production */}
      {/* <pre className="bg-muted rounded p-4 overflow-x-auto text-xs max-h-[60vh]">{JSON.stringify(report, null, 2)}</pre> */}
    </div>
  );
};

export default Report;
