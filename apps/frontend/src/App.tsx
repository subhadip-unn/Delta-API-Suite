import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import './global.css';

// Lazy load all page components for optimal bundle splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Config = lazy(() => import('./pages/Config'));
const Reports = lazy(() => import('./pages/Reports'));
const Report = lazy(() => import('./pages/ReportFixed'));
const JsonDiffTool = lazy(() => import('./pages/JsonDiffTool'));
const Login = lazy(() => import('./pages/Login'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);



function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/config" element={<Config />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/report/:reportId" element={<Report />} />
              <Route path="/upload" element={<div>Upload Report Page</div>} />
              <Route path="/json-diff" element={<JsonDiffTool />} />
            </Route>
          </Route>
          
          {/* Root redirect */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          
          {/* Catch all - redirect to dashboard or login */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
