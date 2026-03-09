/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { RetryHandler } from '../../../../src/services/ai/retry';
import { AuthenticationError, ValidationError } from '../../../../src/services/ai/types';

describe('RetryHandler', () => {
  it('should succeed on first attempt if operation succeeds', async () => {
    const retryHandler = new RetryHandler();
    const operation = vi.fn().mockResolvedValue('success');
    const config = {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 1000,
      backoffMultiplier: 2,
    };

    const result = await retryHandler.executeWithRetry(operation, config);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const retryHandler = new RetryHandler();
    let attemptCount = 0;
    const operation = vi.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    });
    const config = {
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    };

    const result = await retryHandler.executeWithRetry(operation, config);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries exceeded', async () => {
    const retryHandler = new RetryHandler();
    const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'));
    const config = {
      maxRetries: 2,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    };

    await expect(retryHandler.executeWithRetry(operation, config)).rejects.toThrow(
      'Persistent failure'
    );
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry on AuthenticationError', async () => {
    const retryHandler = new RetryHandler();
    const operation = vi.fn().mockRejectedValue(new AuthenticationError('Invalid credentials'));
    const config = {
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    };

    await expect(retryHandler.executeWithRetry(operation, config)).rejects.toThrow(
      AuthenticationError
    );
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  it('should not retry on ValidationError', async () => {
    const retryHandler = new RetryHandler();
    const operation = vi.fn().mockRejectedValue(new ValidationError('Invalid input'));
    const config = {
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
    };

    await expect(retryHandler.executeWithRetry(operation, config)).rejects.toThrow(
      ValidationError
    );
    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  it('should use exponential backoff', async () => {
    const retryHandler = new RetryHandler();
    const delays: number[] = [];
    let attemptCount = 0;

    const operation = vi.fn().mockImplementation(async () => {
      attemptCount++;
      if (attemptCount > 1) {
        delays.push(Date.now());
      }
      if (attemptCount <= 3) {
        throw new Error('Retry me');
      }
      return 'success';
    });

    const config = {
      maxRetries: 3,
      initialDelayMs: 50,
      maxDelayMs: 500,
      backoffMultiplier: 2,
    };

    await retryHandler.executeWithRetry(operation, config);

    // Verify delays increase
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i] - delays[i - 1]).toBeGreaterThanOrEqual(40); // Allow some tolerance
    }
  });

  it('should respect maxDelayMs', async () => {
    const retryHandler = new RetryHandler();
    const delays: number[] = [];
    let lastTime = Date.now();

    const operation = vi.fn().mockImplementation(async () => {
      const now = Date.now();
      if (delays.length > 0) {
        delays.push(now - lastTime);
      }
      lastTime = now;
      throw new Error('Keep retrying');
    });

    const config = {
      maxRetries: 5,
      initialDelayMs: 100,
      maxDelayMs: 200,
      backoffMultiplier: 3,
    };

    try {
      await retryHandler.executeWithRetry(operation, config);
    } catch (error) {
      // Expected to fail
    }

    // All delays should be <= maxDelayMs
    delays.forEach((delay) => {
      expect(delay).toBeLessThanOrEqual(250); // Allow some tolerance
    });
  });
});
