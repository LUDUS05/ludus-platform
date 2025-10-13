/**
 * @fileoverview Main React application component for LUDUS platform frontend.
 *
 * Purpose: Root component that initializes the React application with routing, authentication
 * context, and SPA (Single Page Application) fallback handling for the LUDUS social activity
 * platform serving the Saudi Arabian market.
 *
 * Business Context: This component serves as the entry point for the user-facing application,
 * providing seamless navigation between different platform features while maintaining
 * authentication state and handling deep linking for social sharing and referral systems.
 *
 * Implementation Notes:
 * - Uses React Router for client-side routing
 * - Implements AuthProvider for global authentication state
 * - Includes FallbackHandler for SPA routing compatibility with server-side rendering
 * - Handles URL parameter cleanup for better user experience
 *
 * Dependencies:
 * - React Router DOM for navigation
 * - AuthContext for authentication state management
 * - AppRoutes for route configuration
 *
 * Evolution: Originally simple routing setup, evolved to include SPA fallback handling
 * and authentication context integration for better user experience and SEO.
 *
 * @version 1.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added SPA fallback handling and authentication context
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import AppRoutes from './routes/AppRoutes';

// FallbackHandler removed - no more redirects

/**
 * Main App component that renders the LUDUS platform application.
 *
 * Purpose: Root component that wraps the entire application with necessary providers
 * and routing infrastructure, serving as the main entry point for the React application.
 *
 * Business Context: This component initializes the complete user interface for the
 * LUDUS platform, ensuring proper authentication context and routing are available
 * throughout the application for seamless user experience.
 *
 * Implementation Notes:
 * - Wraps application with AuthProvider for global authentication state
 * - Uses BrowserRouter for client-side routing
 * - Includes FallbackHandler for SPA routing compatibility
 * - Renders AppRoutes for route configuration
 *
 * Dependencies:
 * - AuthProvider for authentication context
 * - Router for navigation infrastructure
 * - FallbackHandler for SPA routing
 * - AppRoutes for route definitions
 *
 * Evolution: Started as simple component, evolved to include comprehensive
 * routing and authentication infrastructure.
 *
 * @function App
 * @returns {JSX.Element} The main application component
 *
 * @example
 * // Renders the complete LUDUS platform application
 * <App />
 *
 * @since 2024-01-01
 * @modified 2025-01-08 - Added authentication context and SPA routing support
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;// Trigger frontend redeployment
