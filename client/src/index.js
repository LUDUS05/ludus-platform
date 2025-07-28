import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

// Initialize Sentry for error tracking (only in production)
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  import('@sentry/react').then(({ init, Integrations }) => {
    init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [
        new Integrations.BrowserTracing(),
      ],
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);