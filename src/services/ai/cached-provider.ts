/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider, OptimizationRequest, OptimizationResponse, UsageMetrics } from './types.js';
import { enhancedCache } from '../cache/enhanced-cache.js';
import { AIResponse } from '../storage/types.js';

/**
 * Cached AI provider wrapper
 * Wraps any AI provider with enhanced caching functionality
 * Uses EnhancedCacheService with 24-hour TTL and fuzzy matching
 */
export class CachedAIProvider implements AIProvider {
  readonly name: string;
  readonly supportsStreaming: boolean;

  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.name = `${provider.name}-cached`;
    this.supportsStreaming = provider.supportsStreaming;

    // Prune expired entries periodically
    setInterval(() => enhancedCache.prune(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Generate optimization with enhanced caching
   * Checks for exact matches first, then fuzzy matches, then makes API call
   */
  async generateOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    const query = this.buildQueryString(request);

    // Check for exact cache match
    const exactMatch = await enhancedCache.get(query);
    if (exactMatch) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Exact cache hit',
          provider: this.provider.name,
        })
      );

      // Update metrics
      const metrics = this.provider.getUsageMetrics();
      if (metrics.cacheHits !== undefined) {
        metrics.cacheHits++;
      }

      return this.convertToOptimizationResponse(exactMatch, 'exact');
    }

    // Check for fuzzy match
    const fuzzyMatch = await enhancedCache.findSimilar(query);
    if (fuzzyMatch) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Fuzzy cache hit',
          provider: this.provider.name,
          similarity: fuzzyMatch.similarity,
        })
      );

      // Update metrics
      const metrics = this.provider.getUsageMetrics();
      if (metrics.cacheHits !== undefined) {
        metrics.cacheHits++;
      }

      return this.convertToOptimizationResponse(fuzzyMatch.response, 'fuzzy', fuzzyMatch.similarity);
    }

    // Cache miss - call provider
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Cache miss - calling API',
        provider: this.provider.name,
      })
    );

    await enhancedCache.recordMiss();

    const response = await this.provider.generateOptimization(request);

    // Update metrics
    const metrics = this.provider.getUsageMetrics();
    if (metrics.cacheMisses !== undefined) {
      metrics.cacheMisses++;
    }

    // Cache successful responses
    if (!response.error) {
      const aiResponse: AIResponse = {
        text: response.content,
        model: response.provider,
        timestamp: Date.now(),
        tokenCount: response.tokensUsed.input + response.tokensUsed.output,
      };
      await enhancedCache.set(query, aiResponse);
    }

    return response;
  }

  /**
   * Validate credentials (pass through to provider)
   */
  async validateCredentials(): Promise<boolean> {
    return this.provider.validateCredentials();
  }

  /**
   * Get usage metrics (pass through to provider, enhanced with cache stats)
   */
  getUsageMetrics(): UsageMetrics {
    const providerMetrics = this.provider.getUsageMetrics();
    const cacheStats = enhancedCache.getStats();

    return {
      ...providerMetrics,
      cacheHits: cacheStats.hits + cacheStats.fuzzyHits,
      cacheMisses: cacheStats.misses,
    };
  }

  /**
   * Build query string from request for caching
   */
  private buildQueryString(request: OptimizationRequest): string {
    // Combine prompt and context into a single query string
    const parts = [request.prompt];
    if (request.context && request.context.trim()) {
      parts.push(`Context: ${request.context}`);
    }
    return parts.join('\n');
  }

  /**
   * Convert AIResponse to OptimizationResponse
   */
  private convertToOptimizationResponse(
    aiResponse: AIResponse,
    cacheType: 'exact' | 'fuzzy',
    similarity?: number
  ): OptimizationResponse {
    return {
      content: aiResponse.text,
      tokensUsed: {
        input: 0, // Not tracked for cached responses
        output: aiResponse.tokenCount || 0,
      },
      provider: aiResponse.model || this.provider.name,
      latencyMs: 0, // Instant from cache
      cached: true,
      cacheType,
      similarity,
    };
  }
}
