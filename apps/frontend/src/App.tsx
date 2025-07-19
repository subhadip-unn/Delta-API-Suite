import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Config from './pages/Config';
import Reports from './pages/Reports';
import Report from './pages/Report';
import JsonDiffTool from './pages/JsonDiffTool.tsx';
import Login from './pages/Login';
import './global.css';



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
        
        {/* Root redirect */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
