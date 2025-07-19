import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LAST_VISITED_KEY = 'cbz-delta-last-visited';

// Routes that should not be persisted (login, error pages, etc.)
const EXCLUDED_ROUTES = ['/login', '/error', '/404'];

// Routes that require data validation before restoring
const DATA_DEPENDENT_ROUTES = ['/report/', '/json-diff'];

export const useNavigationPersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current location to localStorage (except excluded routes)
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Don't save excluded routes
    if (EXCLUDED_ROUTES.some(route => currentPath.startsWith(route))) {
      return;
    }
    
    // Save the current path
    localStorage.setItem(LAST_VISITED_KEY, currentPath);
  }, [location.pathname]);

  // Restore last visited page on app initialization
  const restoreLastVisitedPage = () => {
    const lastVisited = localStorage.getItem(LAST_VISITED_KEY);
    
    if (!lastVisited || lastVisited === location.pathname) {
      return; // Already on the right page or no saved page
    }

    // Check if it's a data-dependent route
    const isDataDependent = DATA_DEPENDENT_ROUTES.some(route => 
      lastVisited.startsWith(route)
    );

    if (isDataDependent) {
      // For data-dependent routes, validate if data exists
      if (lastVisited.startsWith('/report/')) {
        const reportId = lastVisited.split('/report/')[1];
        // Check if report data exists (you can expand this logic)
        const hasReportData = sessionStorage.getItem(`report-${reportId}`) !== null;
        
        if (!hasReportData) {
          // Data doesn't exist, redirect to reports list instead
          navigate('/reports', { replace: true });
          return;
        }
      }
      
      if (lastVisited.startsWith('/json-diff')) {
        // Check if there's any JSON diff data in memory
        const hasJsonDiffData = sessionStorage.getItem('json-diff-data') !== null;
        
        if (!hasJsonDiffData) {
          // No data, but JSON diff tool can work without initial data
          // So we can still restore this page
        }
      }
    }

    // Navigate to the last visited page
    navigate(lastVisited, { replace: true });
  };

  // Clear saved navigation (useful for logout)
  const clearNavigationHistory = () => {
    localStorage.removeItem(LAST_VISITED_KEY);
  };

  return {
    restoreLastVisitedPage,
    clearNavigationHistory,
    lastVisitedPath: localStorage.getItem(LAST_VISITED_KEY)
  };
};
