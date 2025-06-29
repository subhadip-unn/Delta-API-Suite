/**
 * Report UI Type Definitions
 */

// Core data models matching the backend data structure
export interface ReportDiff {
  path: string[];
  severity: 'Error' | 'Warning' | 'Info';
  kind: 'E' | 'A' | 'D' | 'N';  // Edit, Array, Delete, New
  changeType: 'structural' | 'value';
  priority: number;
  message: string;
  lhs?: any;  // left-hand side (original value)
  rhs?: any;  // right-hand side (new value)
}

export interface ReportEndpoint {
  key: string;
  endpoint: string;
  path: string;
  params: Record<string, string | number>;
  urlA: string; // prod URL
  urlB: string; // staging URL
  statusA: number; // prod status code
  statusB: number; // staging status code
  responseTimeA: number; // prod response time in ms
  responseTimeB: number; // staging response time in ms
  timestampA: string; // ISO string
  timestampB: string; // ISO string
  cbLoc: string; // geo location code
  diffs: ReportDiff[];
  error?: string;
  prodResponse?: any; // Production API response data
  stagingResponse?: any; // Staging API response data
}

export interface ReportMeta {
  endpointsRun: string[];
  idsUsed: string[];
  geoUsed: string[];
}

export interface ReportSummary {
  totalComparisons: number;
  successful: number;
  failures: number;
  endpointsWithDiffs: number;
}

export interface ReportJob {
  jobName: string;
  timestamp: string; // ISO string 
  testEngineer: string;
  meta: ReportMeta;
  summary: ReportSummary;
  endpoints: ReportEndpoint[];
  headersUsed?: Record<string, string>;
}

export interface Report {
  id: string;
  timestamp: string;
  jobs: ReportJob[];
}

// API Response type (used for API responses)  
export type ReportResponse = Report;

export type FilterType = 'all' | 'errors' | 'warnings' | 'failures';
