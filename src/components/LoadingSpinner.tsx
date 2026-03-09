/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import '../styles/LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading spinner component with theme-aware colors and smooth animations
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  return (
    <div
      className={`loading-spinner loading-spinner--${size}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="loading-spinner__icon" aria-hidden="true" />
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
};
