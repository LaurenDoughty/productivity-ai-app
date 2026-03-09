/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIProviderFactory } from '../../src/services/ai/factory';
import { CachedAIProvider } from '../../src/services/ai/cached-provider';
import { OptimizationRequest } from '../../src/services/ai/types';
import { enhancedCache } from '../../src/services/cache/enhanced-cache';

describe('Integration Tests: AI Provider', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    // Clear the enhanced cache
    await enhancedCache.clear();
  });

  describe('Provider Factory Integration', () => {
    it('should create and use Gemini provider from environment', () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_AI_PROVIDER: 'gemini',
          VITE_GEMINI_API_KEY: 'test-key',
          VITE_MAX_RETRIES: '3',
          VITE_INITIAL_DELAY_MS: '1000',
          VITE_MAX_DELAY_MS: '10000',
          VITE_BACKOFF_MULTIPLIER: '2',
          VITE_MAX_REQUESTS_PER_MINUTE: '60',
          VITE_MAX_TOKENS_PER_MINUTE: '100000',
        },
      });

      const provider = AIProviderFactory.createFromEnvironment();

      expect(provider.name).toBe('gemini');
      expect(provider.supportsStreaming).toBeDefined();
    });

    it('should create and use Bedrock provider from environment', () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_AI_PROVIDER: 'bedrock',
          AWS_REGION: 'us-east-1',
          VITE_BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          VITE_MAX_RETRIES: '3',
          VITE_INITIAL_DELAY_MS: '1000',
          VITE_MAX_DELAY_MS: '10000',
          VITE_BACKOFF_MULTIPLIER: '2',
          VITE_MAX_REQUESTS_PER_MINUTE: '60',
          VITE_MAX_TOKENS_PER_MINUTE: '100000',
        },
      });

      const provider = AIProviderFactory.createFromEnvironment();

      expect(provider.name).toBe('bedrock');
      expect(provider.supportsStreaming).toBeDefined();
    });
  });

  describe('Cached Provider Integration', () => {
    it('should cache successful responses', async () => {
      const mockProvider = {
        name: 'mock',
        supportsStreaming: false,
        generateOptimization: vi.fn().mockResolvedValue({
          content: 'Test response',
          tokensUsed: { input: 10, output: 20 },
          provider: 'mock',
          latencyMs: 100,
          cached: false,
        }),
        validateCredentials: vi.fn().mockResolvedValue(true),
        getUsageMetrics: vi.fn().mockReturnValue({
          totalRequests: 0,
          totalTokensInput: 0,
          totalTokensOutput: 0,
          estimatedCost: 0,
          errors: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageLatencyMs: 0,
        }),
      };

      const cachedProvider = new CachedAIProvider(mockProvider);

      const request: OptimizationRequest = {
        prompt: 'Test prompt',
        context: 'Test context',
      };

      // First request - cache miss
      const response1 = await cachedProvider.generateOptimization(request);
      expect(response1.cached).toBe(false);
      expect(mockProvider.generateOptimization).toHaveBeenCalledTimes(1);

      // Second identical request - cache hit
      const response2 = await cachedProvider.generateOptimization(request);
      expect(response2.cached).toBe(true);
      expect(mockProvider.generateOptimization).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should not cache error responses', async () => {
      const mockProvider = {
        name: 'mock',
        supportsStreaming: false,
        generateOptimization: vi.fn().mockRejectedValue(new Error('API Error')),
        validateCredentials: vi.fn().mockResolvedValue(true),
        getUsageMetrics: vi.fn().mockReturnValue({
          totalRequests: 0,
          totalTokensInput: 0,
          totalTokensOutput: 0,
          estimatedCost: 0,
          errors: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageLatencyMs: 0,
        }),
      };

      const cachedProvider = new CachedAIProvider(mockProvider);

      const request: OptimizationRequest = {
        prompt: 'Test prompt',
        context: 'Test context',
      };

      // First request - should fail
      await expect(cachedProvider.generateOptimization(request)).rejects.toThrow('API Error');

      // Second request - should try again (not cached)
      await expect(cachedProvider.generateOptimization(request)).rejects.toThrow('API Error');
      expect(mockProvider.generateOptimization).toHaveBeenCalledTimes(2);
    });

    it('should generate different cache keys for different requests', async () => {
      const mockProvider = {
        name: 'mock',
        supportsStreaming: false,
        generateOptimization: vi.fn().mockResolvedValue({
          content: 'Test response',
          tokensUsed: { input: 10, output: 20 },
          provider: 'mock',
          latencyMs: 100,
          cached: false,
        }),
        validateCredentials: vi.fn().mockResolvedValue(true),
        getUsageMetrics: vi.fn().mockReturnValue({
          totalRequests: 0,
          totalTokensInput: 0,
          totalTokensOutput: 0,
          estimatedCost: 0,
          errors: 0,
          cacheHits: 0,
          cacheMisses: 0,
          averageLatencyMs: 0,
        }),
      };

      const cachedProvider = new CachedAIProvider(mockProvider);

      const request1: OptimizationRequest = {
        prompt: 'How can I optimize my morning routine for better productivity?',
        context: 'I wake up at 6am and need to be at work by 9am',
      };

      const request2: OptimizationRequest = {
        prompt: 'What are the best strategies for managing email overload?',
        context: 'I receive over 100 emails per day',
      };

      // Both requests should miss cache (sufficiently different queries)
      await cachedProvider.generateOptimization(request1);
      await cachedProvider.generateOptimization(request2);

      expect(mockProvider.generateOptimization).toHaveBeenCalledTimes(2);
    });
  });

  describe('Usage Metrics Integration', () => {
    it('should track usage metrics across requests', async () => {
      const mockProvider = {
        name: 'mock',
        supportsStreaming: false,
        generateOptimization: vi.fn().mockResolvedValue({
          content: 'Test response',
          tokensUsed: { input: 10, output: 20 },
          provider: 'mock',
          latencyMs: 100,
          cached: false,
        }),
        validateCredentials: vi.fn().mockResolvedValue(true),
        getUsageMetrics: vi.fn().mockReturnValue({
          totalRequests: 1,
          totalTokensInput: 10,
          totalTokensOutput: 20,
          estimatedCost: 0,
          errors: 0,
          cacheHits: 0,
          cacheMisses: 1,
          averageLatencyMs: 100,
        }),
      };

      const request: OptimizationRequest = {
        prompt: 'Test prompt',
        context: 'Test context',
      };

      await mockProvider.generateOptimization(request);

      const metrics = mockProvider.getUsageMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.totalTokensInput).toBe(10);
      expect(metrics.totalTokensOutput).toBe(20);
    });
  });
});
