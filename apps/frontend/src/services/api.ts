// Custom fetch wrapper with better error handling
const axios = {
  post: async (url: string, data?: any, config?: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      // Include credentials to handle auth cookies if they exist
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    // Handle non-JSON responses safely
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        // If JSON parsing fails, use text
        const text = await response.text();
        responseData = { error: text || 'Invalid response format' };
      }
    } else {
      // Not JSON, get as text
      const text = await response.text();
      responseData = { message: text };
    }
    
    return {
      data: responseData,
      status: response.status
    };
  },
  get: async (url: string, config?: any) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      // Include credentials to handle auth cookies if they exist
      credentials: 'include'
    });
    
    // Handle non-JSON responses safely
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        // If JSON parsing fails, use text
        const text = await response.text();
        responseData = { error: text || 'Invalid response format' };
      }
    } else {
      // Not JSON, get as text
      const text = await response.text();
      responseData = { message: text };
    }
    
    return {
      data: responseData,
      status: response.status
    };
  }
};


// Use relative URL for API calls - this works with the Vite proxy in development
// and will work properly in production with proper deployment configuration
const API_URL = '/api';  // Proxy will handle this in development

export interface ProxyResponse {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: any;
  data?: any;
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
  // Core proxy function for DeltaPro+ API comparison
  proxyFetch: async (url: string, method: string = 'GET', headers: any = {}, body?: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/proxy`, {
        url,
        method,
        headers,
        body
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Proxy request failed'
      };
    }
  },
  
  // Archive functions for DeltaPro+ comparison history
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
  
  uploadReport: async (reportFile: string, qaName?: string): Promise<ProxyResponse> => {
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
