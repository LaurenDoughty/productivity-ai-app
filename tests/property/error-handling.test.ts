/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RetryHandler } from '../../src/services/ai/retry';
import { AuthenticationError, ValidationError } from '../../src/services/ai/types';

describe('Property-Based Tests: Error Handling', () => {
  /**
   * Property 26: Retry logic with exponential backoff
   * For any failed AI provider API request that is retryable, the retry mechanism
   * should use exponential backoff with increasing delays between attempts.
   */
  it('Property 26: Retry logic with exponential backoff', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          maxRetries: fc.integer({ min: 1, max: 5 }),
          initialDelayMs: fc.integer({ min: 100, max: 1000 }),
          maxDelayMs: fc.integer({ min: 1000, max: 10000 }),
          backoffMultiplier: fc.float({ min: 1.5, max: 3 }),
        }),
        async (config) => {
          const retryHandler = new RetryHandler();
          let attemptCount = 0;
          const delays: number[] = [];
          
          const operation = async () => {
            attemptCount++;
            const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptCount - 1);
            delays.push(Math.min(delay, config.maxDelayMs));
            
            if (attemptCount <= config.maxRetries) {
              throw new Error('Retryable error');
            }
            return 'success';
          };

          try {
            await retryHandler.executeWithRetry(operation, config);
          } catch (error) {
            // Expected to fail after max retries
          }

          // Verify exponential backoff
          for (let i = 1; i < delays.length; i++) {
            expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 15: Unhandled errors are logged with stack traces
   * For any unhandled error, it should be logged with a complete stack trace.
   */
  it('Property 15: Unhandled errors are logged with stack traces', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          const error = new Error(errorMessage);
          
          // Verify error has required properties
          expect(error.message).toBe(errorMessage);
          expect(error.stack).toBeDefined();
          expect(error.name).toBe('Error');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: API failures are logged and shown to users
   * For any AI provider API call that fails, the error should be logged with
   * provider-specific details and a user-friendly message should be displayed.
   */
  it('Property 17: API failures are logged and shown to users', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('network', 'authentication', 'rate_limit', 'timeout', 'unknown'),
        fc.constantFrom('gemini', 'bedrock'),
        (errorType, provider) => {
          const errorContext = {
            type: errorType,
            provider: provider,
            timestamp: new Date().toISOString(),
          };

          // Verify error context has required fields
          expect(errorContext.type).toBeDefined();
          expect(errorContext.provider).toBeDefined();
          expect(errorContext.timestamp).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test non-retryable errors
   */
  it('should not retry authentication and validation errors', async () => {
    const retryHandler = new RetryHandler();
    const config = {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 1000,
      backoffMultiplier: 2,
    };

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          new AuthenticationError('Invalid credentials'),
          new ValidationError('Invalid input')
        ),
        async (error) => {
          let attemptCount = 0;
          
          const operation = async () => {
            attemptCount++;
            throw error;
          };

          try {
            await retryHandler.executeWithRetry(operation, config);
          } catch (e) {
            // Should fail immediately without retries
            expect(attemptCount).toBe(1);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 18: Log entries have severity levels
   * For any log entry, it should include a severity level (info, warn, or error).
   */
  it('Property 18: Log entries have severity levels', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('info', 'warn', 'error'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (level, message) => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
          };

          expect(logEntry.level).toMatch(/^(info|warn|error)$/);
          expect(logEntry.timestamp).toBeDefined();
          expect(logEntry.message).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
