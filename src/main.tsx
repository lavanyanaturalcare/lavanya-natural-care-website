import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeConsentAwareAnalytics } from './utils/analytics';

// Initialize analytics only if previous user consent was recorded
initializeConsentAwareAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
