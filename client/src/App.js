import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

// Debug component to show current route info
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

// Fallback redirect handler
function FallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isFallback = params.get('spa-fallback');
    const originalPath = params.get('original-path');
    
    if (isFallback && originalPath) {
      // Remove the fallback parameters and navigate to the original path
      navigate(originalPath, { replace: true });
    }
  }, [location, navigate]);
  
  return null;
}

// Simple test components
function HomePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFallback = params.get('spa-fallback');
  const originalPath = params.get('original-path');
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🏠 LUDUS Home - SPA Routing Test</h1>
      <p>✅ Home page loaded successfully!</p>
      
      {isFallback && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '10px', 
          margin: '20px 0',
          borderRadius: '5px'
        }}>
          <p><strong>🔄 SPA Fallback Detected!</strong></p>
          <p>Original path: <code>{originalPath}</code></p>
          <p>Redirecting to React Router...</p>
        </div>
      )}
      
      <nav style={{ marginTop: '20px' }}>
        <a href="/register" style={{ margin: '0 10px', color: 'blue' }}>Register</a>
        <a href="/login" style={{ margin: '0 10px', color: 'blue' }}>Login</a>
        <a href="/test" style={{ margin: '0 10px', color: 'green' }}>Test Route</a>
      </nav>
    </div>
  );
}

function RegisterPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>📝 LUDUS Register - SPA Routing Test</h1>
      <p>✅ Registration page loaded successfully!</p>
      <p>If you see this, SPA routing is working!</p>
      <a href="/" style={{ color: 'blue' }}>← Back to Home</a>
    </div>
  );
}

function LoginPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🔐 LUDUS Login - SPA Routing Test</h1>
      <p>✅ Login page loaded successfully!</p>
      <a href="/" style={{ color: 'blue' }}>← Back to Home</a>
    </div>
  );
}

function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🧪 Test Route - SPA Routing Test</h1>
      <p>✅ Test page loaded successfully!</p>
      <a href="/" style={{ color: 'blue' }}>← Back to Home</a>
    </div>
  );
}

function Custom404Page() {
  const location = useLocation();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>❌ Page Not Found - SPA Routing Test</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p><strong>Requested path:</strong> {location.pathname}</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'none' }}>
          🏠 Go to Home
        </a>
      </div>
      
      {/* Debug info */}
      <details style={{ marginTop: '20px', textAlign: 'left' }}>
        <summary>🔍 Debug Info (Click to expand)</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          {JSON.stringify({
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function App() {
  return (
    <Router>
      <RouteDebugger />
      <FallbackHandler />
      
      <Routes>
        {/* Test Route */}
        <Route path="/test" element={<TestPage />} />
        
        {/* Basic Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<Custom404Page />} />
      </Routes>
    </Router>
  );
}

export default App;