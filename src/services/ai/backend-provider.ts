/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { 
  AIProvider, 
  OptimizationRequest, 
  OptimizationResponse,
  UsageMetrics 
} from './types';

/**
 * Backend AI Provider
 * Proxies requests through the backend server to keep API keys secure
 */
export class BackendAIProvider implements AIProvider {
  readonly name = 'backend-proxy';
  readonly supportsStreaming = false;
  
  private readonly apiEndpoint: string;
  private metrics: UsageMetrics = {
    totalRequests: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    estimatedCost: 0,
    errors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLatencyMs: 0,
  };

  constructor(apiEndpoint: string = '/api/generate') {
    this.apiEndpoint = apiEndpoint;
  }

  async generateOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${request.context}\n\n${request.prompt}`,
          model: 'llama-3.3-70b-versatile',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      // Estimate token usage (rough approximation)
      const inputTokens = Math.ceil((request.context.length + request.prompt.length) / 4);
      const outputTokens = Math.ceil(data.text.length / 4);

      this.metrics.totalTokensInput += inputTokens;
      this.metrics.totalTokensOutput += outputTokens;
      
      // Update average latency
      const totalLatency = (this.metrics.averageLatencyMs || 0) * (this.metrics.totalRequests - 1) + latencyMs;
      this.metrics.averageLatencyMs = totalLatency / this.metrics.totalRequests;

      return {
        content: data.text,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
        },
        provider: 'backend-proxy',
        latencyMs,
      };
    } catch (error) {
      this.metrics.errors++;
      const latencyMs = Date.now() - startTime;
      
      return {
        content: '',
        tokensUsed: { input: 0, output: 0 },
        provider: 'backend-proxy',
        latencyMs,
        error: true,
        errorType: 'network',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch('/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  getUsageMetrics(): UsageMetrics {
    return { ...this.metrics };
  }
}
