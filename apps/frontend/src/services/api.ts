// Use dynamic import to avoid TypeScript errors with missing axios types
const axios = {
  post: async (url: string, data?: any, config?: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: JSON.stringify(data)
    });
    return {
      data: await response.json(),
      status: response.status
    };
  },
  get: async (url: string, config?: any) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    });
    return {
      data: await response.json(),
      status: response.status
    };
  }
};
import { ConfigState } from '../types/config';

const API_URL = 'http://localhost:3001/api';

export interface CompareResponse {
  success: boolean;
  reportId?: string;
  timestamp?: string;
  duration?: number;
  message?: string;
  error?: string;
}

export interface ReportListResponse {
  success: boolean;
  reports?: {
    id: string;
    timestamp: string;
    testEngineer?: string;
    jobCount?: number;
  }[];
  error?: string;
}

export interface ReportResponse {
  success: boolean;
  report?: any;
  error?: string;
}

export const apiService = {
  runComparison: async (config: ConfigState, qaName: string, options = {}): Promise<CompareResponse> => {
    try {
      const response = await axios.post(`${API_URL}/compare`, {
        config,
        qaName,
        options
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error'
      };
    }
  },
  getReports: async (): Promise<ReportListResponse> => {
    try {
      const response = await axios.get(`${API_URL}/reports`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error loading reports'
      };
    }
  },
  getReport: async (reportId: string): Promise<ReportResponse> => {
    try {
      const response = await axios.get(`${API_URL}/reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error loading report'
      };
    }
  },
  uploadReport: async (reportFile: string, qaName?: string): Promise<CompareResponse> => {
    try {
      const response = await axios.post(`${API_URL}/upload-report`, {
        reportFile,
        qaName
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error uploading report'
      };
    }
  }
};
