/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIProvider, OptimizationRequest, OptimizationResponse } from '../services/ai/types';
import { AIProviderFactory } from '../services/ai/factory';
import { CachedAIProvider } from '../services/ai/cached-provider';
import { RetryHandler } from '../services/ai/retry';
import { AIProviderErrorHandler } from '../services/ai/error-handler';
import { globalRateLimiter } from '../services/rate-limiter';
import { performanceTracker } from '../services/monitoring/performance';
import { logger } from '../services/logging/logger';

interface UseAIProviderResult {
  generateOptimization: (request: OptimizationRequest) => Promise<OptimizationResponse>;
  loading: boolean;
  error: string | null;
  response: OptimizationResponse | null;
  cancel: () => void;
}

/**
 * Hook for using AI provider with loading states, error handling, and cancellation
 */
export function useAIProvider(): UseAIProviderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<OptimizationResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const providerRef = useRef<AIProvider | null>(null);
  const retryHandlerRef = useRef<RetryHandler | null>(null);
  const errorHandlerRef = useRef<AIProviderErrorHandler | null>(null);

  // Initialize provider on mount
  useEffect(() => {
    try {
      const baseProvider = AIProviderFactory.createFromEnvironment();
      providerRef.current = new CachedAIProvider(baseProvider);
      retryHandlerRef.current = new RetryHandler();
      errorHandlerRef.current = new AIProviderErrorHandler();
    } catch (err) {
      logger.error('Failed to initialize AI provider', err as Error);
      setError((err as Error).message);
    }
  }, []);

  const generateOptimization = useCallback(
    async (request: OptimizationRequest): Promise<OptimizationResponse> => {
      if (!providerRef.current || !retryHandlerRef.current || !errorHandlerRef.current) {
        throw new Error('AI provider not initialized');
      }

      // Check rate limit
      if (!globalRateLimiter.checkLimit('ai-requests')) {
        const errorMsg = 'Rate limit exceeded. Please try again in a moment.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setResponse(null);

      // const startTime = Date.now();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        // Set up timeout warning (5 seconds)
        timeoutId = setTimeout(() => {
          logger.warn('API request taking longer than 5 seconds', {
            provider: providerRef.current?.name,
          });
        }, 5000);

        // Execute with retry logic
        const result = await retryHandlerRef.current.executeWithRetry(
          () => providerRef.current!.generateOptimization(request),
          {
            maxRetries: 3,
            initialDelayMs: 1000,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
          }
        );

        // Track performance
        performanceTracker.trackAPIResponse(result.latencyMs);

        setResponse(result);
        setLoading(false);

        return result;
      } catch (err) {
        // Handle error
        const errorResponse = await errorHandlerRef.current.handleProviderError(
          err,
          providerRef.current.name
        );

        setError(errorResponse.content);
        setResponse(errorResponse);
        setLoading(false);

        throw err;
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      logger.info('AI request cancelled');
    }
  }, []);

  return {
    generateOptimization,
    loading,
    error,
    response,
    cancel,
  };
}
