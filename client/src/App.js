import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import AppRoutes from './routes/AppRoutes';

// Debug component to show current route info (can be removed in production)
function RouteDebugger() {
  const location = useLocation();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Path: {location.pathname}</div>
      <div>Search: {location.search}</div>
      <div>Hash: {location.hash}</div>
    </div>
  );
}

// Fallback redirect handler for SPA routing
function FallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isFallback = params.get('spa-fallback');
    const originalPath = params.get('original-path');
    
    if (isFallback && originalPath) {
      // Decode the original path and navigate to it
      const decodedPath = decodeURIComponent(originalPath);
      console.log('SPA Fallback: Redirecting to', decodedPath);
      
      // Simple approach: just navigate with replace: true
      // This was working in the previous version
      navigate(decodedPath, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}

function App() {
  return (
    <Router>
      <RouteDebugger />
      <FallbackHandler />
      <AppRoutes />
    </Router>
  );
}

export default App;