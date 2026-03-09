/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ErrorType,
  NetworkError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  OptimizationResponse,
} from './types.js';

/**
 * AI Provider error handler
 */
export class AIProviderErrorHandler {
  /**
   * Handle provider error and return standardized response
   */
  async handleProviderError(error: unknown, provider: string): Promise<OptimizationResponse> {
    // Classify error type
    const errorType = this.classifyError(error);

    // Log with provider context
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `AI provider error: ${provider}`,
        provider,
        errorType,
        error: (error as Error).message,
        stack: (error as Error).stack,
      })
    );

    // Return standardized error response
    return {
      content: this.getUserFriendlyMessage(errorType),
      tokensUsed: { input: 0, output: 0 },
      provider,
      latencyMs: 0,
      cached: false,
      error: true,
      errorType,
    };
  }

  /**
   * Classify error type
   */
  private classifyError(error: unknown): ErrorType {
    if (error instanceof NetworkError) return 'network';
    if (error instanceof AuthenticationError) return 'authentication';
    if (error instanceof RateLimitError) return 'rate_limit';
    if (error instanceof TimeoutError) return 'timeout';
    return 'unknown';
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorType: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      network: 'Unable to connect to AI service. Please check your internet connection.',
      authentication: 'Authentication failed. Please check your API credentials.',
      rate_limit: 'Rate limit exceeded. Please try again in a few moments.',
      timeout: 'Request timed out. Please try again.',
      unknown: 'An unexpected error occurred. Please try again.',
    };
    return messages[errorType];
  }
}
