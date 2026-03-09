/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  OptimizationRequest,
  OptimizationResponse,
  ProviderConfig,
  UsageMetrics,
  AuthenticationError,
  NetworkError,
  RateLimitError,
  TimeoutError,
} from './types.js';

/**
 * Google Gemini AI provider implementation
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  readonly supportsStreaming = true;

  private client: GoogleGenerativeAI;
  private apiKey: string;
  private metrics: UsageMetrics;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new AuthenticationError('Gemini API key is required');
    }

    this.apiKey = config.apiKey;
    this.client = new GoogleGenerativeAI(this.apiKey);
    this.metrics = {
      totalRequests: 0,
      totalTokensInput: 0,
      totalTokensOutput: 0,
      estimatedCost: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLatencyMs: 0,
    };
  }

  /**
   * Generate optimization using Gemini API
   */
  async generateOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Get the generative model
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Format the prompt
      const fullPrompt = `${request.context}\n\n${request.prompt}`;

      // Generate content
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000,
        },
      });

      const response = result.response;
      const text = response.text();

      // Estimate token usage (Gemini doesn't provide exact counts in free tier)
      const inputTokens = Math.ceil(fullPrompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      this.metrics.totalTokensInput += inputTokens;
      this.metrics.totalTokensOutput += outputTokens;

      const latencyMs = Date.now() - startTime;
      this.updateAverageLatency(latencyMs);

      return {
        content: text,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
        },
        provider: this.name,
        latencyMs,
        cached: false,
      };
    } catch (error) {
      this.metrics.errors++;
      // const latencyMs = Date.now() - startTime;

      // Classify and rethrow error
      const err = error as any;
      if (err.message?.includes('API key')) {
        throw new AuthenticationError(`Gemini authentication failed: ${err.message}`);
      } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
        throw new RateLimitError(`Gemini rate limit exceeded: ${err.message}`);
      } else if (err.message?.includes('timeout')) {
        throw new TimeoutError(`Gemini request timed out: ${err.message}`);
      } else if (err.message?.includes('network') || err.code === 'ENOTFOUND') {
        throw new NetworkError(`Gemini network error: ${err.message}`);
      }

      throw new Error(`Gemini API error: ${err.message}`);
    }
  }

  /**
   * Validate API credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      });
      return !!result.response.text();
    } catch (error) {
      console.error('Gemini credential validation failed:', error);
      return false;
    }
  }

  /**
   * Get usage metrics
   */
  getUsageMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  /**
   * Update average latency
   */
  private updateAverageLatency(latencyMs: number): void {
    const totalRequests = this.metrics.totalRequests;
    const currentAvg = this.metrics.averageLatencyMs || 0;
    this.metrics.averageLatencyMs = (currentAvg * (totalRequests - 1) + latencyMs) / totalRequests;
  }
}
