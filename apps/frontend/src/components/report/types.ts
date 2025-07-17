/**
 * Report UI Type Definitions - Matching Old Static Report Structure
 */

// Core data models matching the old static report structure
export interface ReportDiff {
  kind: 'E' | 'A' | 'D' | 'N';  // Edit, Array, Delete, New
  path: string[];
  lhs?: any;  // left-hand side (original value)
  rhs?: any;  // right-hand side (new value)
}

export interface ReportEndpoint {
  key: string;
  params: Record<string, string | number>;
  cbLoc: string; // geo location code
  urlA: string; // prod URL
  urlB: string; // staging URL
  statusA: number; // prod status code
  statusB: number; // staging status code
  responseTimeA: number; // prod response time in ms
  responseTimeB: number; // staging response time in ms
  timestampA: string; // ISO string
  timestampB: string; // ISO string
  headersUsedA: Record<string, any>;
  headersUsedB: Record<string, any>;
  rawJsonA: any; // Production API response data
  rawJsonB: any; // Staging API response data
  diffs: ReportDiff[];
  error?: string | null;
}

export interface ReportMeta {
  endpointsRun: string[];
  idsUsed: string[];
  geoUsed: string[];
}

export interface ReportSummary {
  totalComparisons: number;
  failures: number;
  endpointsWithDiffs: number;
  totalDiffs: number;
  successful: number;
}

// Main report structure matching old static report exactly
export interface ReportJob {
  jobName: string;
  platform: string;
  timestamp: string;
  testEngineer: string;
  totalTasks: number;
  failures: number;
  diffsFound: number;
  summary: ReportSummary;
  meta: ReportMeta;
  headersUsed: Record<string, any>;
  endpoints: ReportEndpoint[];
  jobs?: ReportJobDetail[]; // Sub-jobs if any
}

// Individual job detail (for nested jobs)
export interface ReportJobDetail {
  jobId?: string;
  jobName: string;
  timestamp?: string;
  testEngineer?: string;
  platform?: string;
  baseUrlA?: string;
  baseUrlB?: string;
  title?: string;
  meta?: ReportMeta;
  summary?: ReportSummary;
  endpoints?: ReportEndpoint[];
  records?: Array<any>;
  headersUsed?: Record<string, string>;
}

export interface Report {
  id: string;
  timestamp: string;
  testEngineer?: string;
  // Use the main report structure directly
  jobName: string;
  platform: string;
  totalTasks: number;
  failures: number;
  diffsFound: number;
  summary: ReportSummary;
  meta: ReportMeta;
  headersUsed: Record<string, any>;
  endpoints: ReportEndpoint[];
  jobs?: ReportJobDetail[];
}

// API Response type (used for API responses)  
export type ReportResponse = Report;

export type FilterType = 'all' | 'errors' | 'warnings' | 'failures';
