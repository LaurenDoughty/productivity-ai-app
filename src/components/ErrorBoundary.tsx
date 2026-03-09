/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/logging/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logger.error('React error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '1.25rem',
          margin: '1.25rem',
          border: '0.0625rem solid #f5c6cb',
          borderRadius: '0.25rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
        }}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: '0.625rem' }}>
              <summary>Error details (development only)</summary>
              <pre style={{
                marginTop: '0.625rem',
                padding: '0.625rem',
                backgroundColor: '#fff',
                border: '0.0625rem solid #ddd',
                borderRadius: '0.25rem',
                overflow: 'auto',
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.625rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#721c24',
              color: '#fff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
