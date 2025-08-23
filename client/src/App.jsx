import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AppRoutes from './routes/AppRoutes';
import './index.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
          <SpeedInsights />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;