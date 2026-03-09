/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { webVitalsTracker } from './services/monitoring/web-vitals';
import { performanceTracker } from './services/monitoring/performance';
import { logger } from './services/logging/logger';
import './index.css';
import './styles/tokens.css';
import './styles/themes.css';

// Initialize monitoring
webVitalsTracker.init();
performanceTracker.init();

// Log application startup
logger.info('Application starting', {
  version: import.meta.env.APP_VERSION || '1.0.0',
  aiProvider: import.meta.env.VITE_AI_PROVIDER || 'gemini',
  environment: import.meta.env.MODE,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
