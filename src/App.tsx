/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navigation } from './components/Navigation';

// Lazy load route components
const Home = lazy(() => import('./views/Home'));
const Strategies = lazy(() => import('./views/Strategies'));
const Optimizer = lazy(() => import('./views/Optimizer'));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-container">
          <Navigation />

          <main className="app-main">
            <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="/optimizer" element={<Optimizer />} />
              </Routes>
            </Suspense>
          </main>

          <footer className="app-footer">
            <p>Productivity Copilot v{import.meta.env.APP_VERSION || '1.0.0'}</p>
            <p>AI Provider: {import.meta.env.VITE_AI_PROVIDER || 'gemini'}</p>
          </footer>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
