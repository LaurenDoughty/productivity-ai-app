/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
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
 * AWS Bedrock AI provider implementation (Claude 3.5 Sonnet)
 */
export class BedrockProvider implements AIProvider {
  readonly name = 'bedrock';
  readonly supportsStreaming = true;

  private client: BedrockRuntimeClient;
  private modelId: string;
  private metrics: UsageMetrics;

  // Bedrock pricing for Claude 3.5 Sonnet
  private readonly INPUT_TOKEN_COST = 3.0 / 1_000_000; // $3 per million input tokens
  private readonly OUTPUT_TOKEN_COST = 15.0 / 1_000_000; // $15 per million output tokens

  constructor(config: ProviderConfig) {
    if (!config.region) {
      throw new AuthenticationError('AWS region is required for Bedrock');
    }

    this.client = new BedrockRuntimeClient({ region: config.region });
    this.modelId = config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
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
   * Generate optimization using Bedrock API
   */
  async generateOptimization(request: OptimizationRequest): Promise<OptimizationResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Format request in Claude format
      const claudeRequest = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: `${request.context}\n\n${request.prompt}`,
          },
        ],
      };

      const input: InvokeModelCommandInput = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(claudeRequest),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      // Parse response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const content = responseBody.content[0].text;
      const inputTokens = responseBody.usage.input_tokens;
      const outputTokens = responseBody.usage.output_tokens;

      // Update metrics
      this.metrics.totalTokensInput += inputTokens;
      this.metrics.totalTokensOutput += outputTokens;

      // Calculate cost
      const cost = inputTokens * this.INPUT_TOKEN_COST + outputTokens * this.OUTPUT_TOKEN_COST;
      this.metrics.estimatedCost += cost;

      const latencyMs = Date.now() - startTime;
      this.updateAverageLatency(latencyMs);

      // Log token usage for cost monitoring
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Bedrock API call',
          provider: this.name,
          inputTokens,
          outputTokens,
          cost: cost.toFixed(6),
          latencyMs,
        })
      );

      return {
        content,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
        },
        provider: this.name,
        latencyMs,
        cached: false,
        cost,
      };
    } catch (error) {
      this.metrics.errors++;
      // const latencyMs = Date.now() - startTime;

      // Classify and rethrow error
      const err = error as any;
      if (err.name === 'UnrecognizedClientException' || err.name === 'InvalidSignatureException') {
        throw new AuthenticationError(`Bedrock authentication failed: ${err.message}`);
      } else if (err.name === 'ThrottlingException' || err.message?.includes('rate limit')) {
        throw new RateLimitError(`Bedrock rate limit exceeded: ${err.message}`);
      } else if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        throw new TimeoutError(`Bedrock request timed out: ${err.message}`);
      } else if (err.code === 'ENOTFOUND' || err.message?.includes('network')) {
        throw new NetworkError(`Bedrock network error: ${err.message}`);
      }

      throw new Error(`Bedrock API error: ${err.message}`);
    }
  }

  /**
   * Validate AWS credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Try a minimal request to validate credentials
      const testRequest = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const input: InvokeModelCommandInput = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(testRequest),
      };

      const command = new InvokeModelCommand(input);
      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Bedrock credential validation failed:', error);
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
