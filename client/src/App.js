import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

// Fallback redirect handler for SPA routing
function FallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const spaRedirect = params.get('spa-redirect');
    
    if (spaRedirect) {
      // Decode the original path and navigate to it
      const decodedPath = decodeURIComponent(spaRedirect);
      
      // Navigate to the original path and replace the current history entry
      // This will clean up the URL parameters
      navigate(decodedPath, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <FallbackHandler />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;