import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { motion } from 'framer-motion';
import './global.css';

// Lazy load essential page components only
const DeltaMetrics = lazy(() => import('./pages/DeltaMetrics'));
const DeltaDB = lazy(() => import('./pages/DeltaDB'));
const JsonDiffTool = lazy(() => import('./pages/JsonDiffTool'));
const Login = lazy(() => import('./pages/Login'));

// Delta Line Spinner - Only the lines rotate to form the delta icon
const PageLoader = () => {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center`}>
      <div className="text-center space-y-8">
        {/* Delta Line Spinner - Lines rotate to form triangle */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Line 1 - Left side of triangle */}
          <motion.div
            className={`absolute top-0 left-1/2 w-0.5 h-16 origin-bottom ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}
            animate={{ 
              rotate: [0, 120, 240, 360],
              scaleY: [1, 0.8, 1, 0.8, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            style={{ transformOrigin: '50% 100%' }}
          />
          
          {/* Line 2 - Right side of triangle */}
          <motion.div
            className={`absolute top-0 left-1/2 w-0.5 h-16 origin-bottom ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}
            animate={{ 
              rotate: [0, 120, 240, 360],
              scaleY: [1, 0.8, 1, 0.8, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            style={{ transformOrigin: '50% 100%' }}
          />
          
          {/* Line 3 - Base of triangle */}
          <motion.div
            className={`absolute top-0 left-1/2 w-0.5 h-16 origin-bottom ${isDark ? 'bg-pink-400' : 'bg-pink-600'}`}
            animate={{ 
              rotate: [0, 120, 240, 360],
              scaleY: [1, 0.8, 1, 0.8, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            style={{ transformOrigin: '50% 100%' }}
          />
          
          {/* Center dot that pulses */}
          <motion.div
            className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full ${isDark ? 'bg-white' : 'bg-slate-800'}`}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Delta API Suite
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Loading API Testing Tools...
          </p>
        </motion.div>

        {/* Loading Dots */}
        <motion.div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className={`w-2 h-2 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          
          {/* Protected routes - Delta Suite */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DeltaMetrics />} />
              <Route path="/deltadb" element={<DeltaDB />} />
              <Route path="/deltapro" element={<JsonDiffTool />} />
            </Route>
          </Route>
          
          {/* Root redirect - Now goes to DeltaMetrics for landing page */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          
          {/* Catch all - redirect to DeltaMetrics or login */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
