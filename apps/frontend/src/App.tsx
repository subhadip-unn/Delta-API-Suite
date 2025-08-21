import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import './global.css';

// Lazy load essential page components only
const Dashboard = lazy(() => import('./pages/Dashboard'));
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
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/deltapro" replace />} />
          
          {/* Protected routes - Focused on DeltaPro+ */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<div>Upload Report Page</div>} />
              <Route path="/deltapro" element={<JsonDiffTool />} />
            </Route>
          </Route>
          
          {/* Root redirect - Now goes to Dashboard for API management */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          
          {/* Catch all - redirect to Dashboard or login */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
