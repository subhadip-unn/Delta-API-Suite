import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Config from './pages/Config';
import Reports from './pages/Reports';
import Report from './pages/Report';
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
          </Route>
        </Route>
        
        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
