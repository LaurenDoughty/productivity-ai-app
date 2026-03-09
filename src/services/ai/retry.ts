/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RetryConfig, AuthenticationError, ValidationError } from './types.js';

/**
 * Retry handler with exponential backoff
 */
export class RetryHandler {
  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelayMs;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on non-retryable errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Last attempt, throw error
        if (attempt === config.maxRetries) {
          throw lastError;
        }

        // Log retry attempt
        console.warn(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'warn',
            message: `Retry attempt ${attempt + 1}/${config.maxRetries}`,
            delay: `${delay}ms`,
            error: lastError.message,
          })
        );

        // Wait before retry
        await this.sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
      }
    }

    throw lastError!;
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    return error instanceof AuthenticationError || error instanceof ValidationError;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
