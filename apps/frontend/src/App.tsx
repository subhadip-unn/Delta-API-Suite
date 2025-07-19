import { Navigate, BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNavigationPersistence } from './hooks/useNavigationPersistence';
import Dashboard from './pages/Dashboard';
import Config from './pages/Config';
import Reports from './pages/Reports';
import Report from './pages/Report';
import JsonDiffTool from './pages/JsonDiffTool.tsx';
import Login from './pages/Login';
import './global.css';

// Smart redirect component
const SmartRedirect = () => {
  const { restoreLastVisitedPage, lastVisitedPath } = useNavigationPersistence();
  const location = useLocation();
  
  // If we're on root and have a last visited path, restore it
  if (location.pathname === '/' && lastVisitedPath && lastVisitedPath !== '/') {
    restoreLastVisitedPage();
    return null;
  }
  
  // Default redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
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
        
        {/* Smart redirect for root - restore last visited page or go to dashboard */}
        <Route path="/" element={isAuthenticated ? <SmartRedirect /> : <Navigate to="/login" replace />} />
        
        {/* Catch all - smart redirect for authenticated users */}
        <Route path="*" element={isAuthenticated ? <SmartRedirect /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
