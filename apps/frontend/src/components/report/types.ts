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
  // Additional properties to match backend structure
  id?: string;
  name?: string;
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
  diffCounts?: { total: number; [key: string]: number };
  error?: string;
  prodResponse?: any; // Production API response data
  stagingResponse?: any; // Staging API response data
  responseA?: { success: boolean; error?: string; data?: any };
  responseB?: { success: boolean; error?: string; data?: any };
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
  jobId?: string;
  jobName: string;
  timestamp?: string; // ISO string 
  testEngineer?: string;
  platform?: string;
  baseUrlA?: string;
  baseUrlB?: string;
  meta?: ReportMeta;
  summary?: ReportSummary;
  endpoints?: ReportEndpoint[];
  records?: Array<any>; // For compatibility with backend structure
  headersUsed?: Record<string, string>;
}

export interface Report {
  id: string;
  timestamp: string;
  testEngineer?: string; // Added to match backend API response
  jobs: ReportJob[];
  meta?: Record<string, any>;
}

// API Response type (used for API responses)  
export type ReportResponse = Report;

export type FilterType = 'all' | 'errors' | 'warnings' | 'failures';
