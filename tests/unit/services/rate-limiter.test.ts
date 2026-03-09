/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenBucketRateLimiter } from '../../../src/services/rate-limiter';

describe('TokenBucketRateLimiter', () => {
  let rateLimiter: TokenBucketRateLimiter;

  beforeEach(() => {
    rateLimiter = new TokenBucketRateLimiter({
      maxTokens: 5,
      refillRate: 1,
      refillIntervalMs: 1000,
    });
  });

  it('should allow requests within limit', () => {
    const key = 'user-1';

    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.checkLimit(key)).toBe(true);
      rateLimiter.recordRequest(key);
    }
  });

  it('should reject requests exceeding limit', () => {
    const key = 'user-1';

    // Use up all tokens
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkLimit(key);
      rateLimiter.recordRequest(key);
    }

    // Next request should be rejected
    expect(rateLimiter.checkLimit(key)).toBe(false);
  });

  it('should track different keys separately', () => {
    expect(rateLimiter.checkLimit('user-1')).toBe(true);
    rateLimiter.recordRequest('user-1');

    expect(rateLimiter.checkLimit('user-2')).toBe(true);
    rateLimiter.recordRequest('user-2');

    // Both users should have used 1 token each
    expect(rateLimiter.checkLimit('user-1')).toBe(true);
    expect(rateLimiter.checkLimit('user-2')).toBe(true);
  });

  it('should refill tokens over time', async () => {
    const key = 'user-1';

    // Use up all tokens
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkLimit(key);
      rateLimiter.recordRequest(key);
    }

    expect(rateLimiter.checkLimit(key)).toBe(false);

    // Wait for refill
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Should have 1 token refilled
    expect(rateLimiter.checkLimit(key)).toBe(true);
  });

  it('should reset bucket for a key', () => {
    const key = 'user-1';

    // Use up all tokens
    for (let i = 0; i < 5; i++) {
      rateLimiter.checkLimit(key);
      rateLimiter.recordRequest(key);
    }

    expect(rateLimiter.checkLimit(key)).toBe(false);

    // Reset
    rateLimiter.reset(key);

    // Should have full tokens again
    expect(rateLimiter.checkLimit(key)).toBe(true);
  });

  it('should not exceed max tokens', async () => {
    const key = 'user-1';

    // Wait for multiple refill intervals
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Should still only have max tokens
    let allowedRequests = 0;
    for (let i = 0; i < 10; i++) {
      if (rateLimiter.checkLimit(key)) {
        rateLimiter.recordRequest(key);
        allowedRequests++;
      }
    }

    expect(allowedRequests).toBeLessThanOrEqual(5);
  });

  it('should handle concurrent requests', () => {
    const key = 'user-1';
    const results: boolean[] = [];

    // Simulate concurrent requests
    for (let i = 0; i < 10; i++) {
      results.push(rateLimiter.checkLimit(key));
      if (results[i]) {
        rateLimiter.recordRequest(key);
      }
    }

    // Only first 5 should be allowed
    const allowedCount = results.filter((r) => r).length;
    expect(allowedCount).toBe(5);
  });
});
