/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Optimizer from '../../../src/views/Optimizer';
import * as useAIProviderModule from '../../../src/hooks/useAIProvider';

// Mock the useAIProvider hook
vi.mock('../../../src/hooks/useAIProvider');

describe('Optimizer View - Cache Indicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "from cache" indicator for exact cache hits', () => {
    // Mock the hook to return a cached response
    vi.mocked(useAIProviderModule.useAIProvider).mockReturnValue({
      generateOptimization: vi.fn(),
      loading: false,
      error: null,
      response: {
        content: 'Test optimization response',
        tokensUsed: { input: 10, output: 50 },
        provider: 'gemini',
        latencyMs: 5,
        cached: true,
        cacheType: 'exact',
      },
      cancel: vi.fn(),
    });

    render(<Optimizer />);

    // Check for exact cache indicator
    expect(screen.getByText(/✓ from cache/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ from cache/i)).toHaveStyle({ color: '#28a745' });
  });

  it('should display "similar query" indicator for fuzzy cache hits', () => {
    // Mock the hook to return a fuzzy cached response
    vi.mocked(useAIProviderModule.useAIProvider).mockReturnValue({
      generateOptimization: vi.fn(),
      loading: false,
      error: null,
      response: {
        content: 'Test optimization response',
        tokensUsed: { input: 10, output: 50 },
        provider: 'gemini',
        latencyMs: 5,
        cached: true,
        cacheType: 'fuzzy',
        similarity: 0.92,
      },
      cancel: vi.fn(),
    });

    render(<Optimizer />);

    // Check for fuzzy cache indicator
    expect(screen.getByText(/≈ similar query/i)).toBeInTheDocument();
    expect(screen.getByText(/92% match/i)).toBeInTheDocument();
    expect(screen.getByText(/≈ similar query/i)).toHaveStyle({ color: '#17a2b8' });
  });

  it('should not display cache indicators for non-cached responses', () => {
    // Mock the hook to return a non-cached response
    vi.mocked(useAIProviderModule.useAIProvider).mockReturnValue({
      generateOptimization: vi.fn(),
      loading: false,
      error: null,
      response: {
        content: 'Test optimization response',
        tokensUsed: { input: 10, output: 50 },
        provider: 'gemini',
        latencyMs: 250,
        cached: false,
      },
      cancel: vi.fn(),
    });

    render(<Optimizer />);

    // Check that cache indicators are not present
    expect(screen.queryByText(/from cache/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/similar query/i)).not.toBeInTheDocument();
  });

  it('should display provider and metrics information', () => {
    // Mock the hook to return a response
    vi.mocked(useAIProviderModule.useAIProvider).mockReturnValue({
      generateOptimization: vi.fn(),
      loading: false,
      error: null,
      response: {
        content: 'Test optimization response',
        tokensUsed: { input: 15, output: 75 },
        provider: 'gemini-cached',
        latencyMs: 10,
        cached: true,
        cacheType: 'exact',
      },
      cancel: vi.fn(),
    });

    render(<Optimizer />);

    // Check for provider and metrics
    expect(screen.getByText(/Provider:/i)).toBeInTheDocument();
    expect(screen.getByText(/gemini-cached/i)).toBeInTheDocument();
    expect(screen.getByText(/Latency:/i)).toBeInTheDocument();
    expect(screen.getByText(/10ms/i)).toBeInTheDocument();
    expect(screen.getByText(/Tokens:/i)).toBeInTheDocument();
    expect(screen.getByText(/15 in \/ 75 out/i)).toBeInTheDocument();
  });
});
