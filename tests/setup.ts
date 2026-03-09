/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extend Vitest matchers
expect.extend({});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_AI_PROVIDER: 'gemini',
    VITE_GEMINI_API_KEY: 'test-key',
    AWS_REGION: 'us-east-1',
    VITE_MAX_RETRIES: '3',
    VITE_INITIAL_DELAY_MS: '100',
    VITE_MAX_DELAY_MS: '1000',
    VITE_BACKOFF_MULTIPLIER: '2',
    VITE_MAX_REQUESTS_PER_MINUTE: '60',
    VITE_MAX_TOKENS_PER_MINUTE: '100000',
  },
});
