/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core AI Provider Interface
 * Defines the contract that all AI provider implementations must follow
 */
export interface AIProvider {
  readonly name: string;
  readonly supportsStreaming: boolean;
  
  generateOptimization(request: OptimizationRequest): Promise<OptimizationResponse>;
  validateCredentials(): Promise<boolean>;
  getUsageMetrics(): UsageMetrics;
}

/**
 * Request format for optimization generation
 */
export interface OptimizationRequest {
  prompt: string;
  context: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Standardized response format from any AI provider
 */
export interface OptimizationResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  provider: string;
  latencyMs: number;
  cached?: boolean;
  cacheType?: 'exact' | 'fuzzy';  // Type of cache hit
  similarity?: number;             // Similarity score for fuzzy matches (0-1)
  cost?: number;
  error?: boolean;
  errorType?: ErrorType;
  errorMessage?: string;           // Detailed error message
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  type: 'gemini' | 'bedrock';
  apiKey?: string;
  region?: string;
  modelId?: string;
  retryConfig: RetryConfig;
  rateLimitConfig: RateLimitConfig;
}

/**
 * Retry configuration for failed requests
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
}

/**
 * Usage metrics for tracking and cost monitoring
 */
export interface UsageMetrics {
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  estimatedCost: number;
  errors: number;
  cacheHits?: number;
  cacheMisses?: number;
  averageLatencyMs?: number;
}

/**
 * Error types for classification
 */
export type ErrorType = 'network' | 'authentication' | 'rate_limit' | 'timeout' | 'unknown';

/**
 * Custom error classes
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
