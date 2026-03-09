/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Token bucket for rate limiting
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class TokenBucketRateLimiter {
  private buckets: Map<string, TokenBucket>;
  private maxTokens: number;
  private refillRate: number; // tokens per interval
  private refillIntervalMs: number;

  constructor(config: RateLimiterConfig);
  constructor(maxTokens: number, refillRate: number);
  constructor(configOrMaxTokens: RateLimiterConfig | number, refillRate?: number) {
    this.buckets = new Map();
    
    if (typeof configOrMaxTokens === 'object') {
      // Config object
      this.maxTokens = configOrMaxTokens.maxTokens;
      this.refillRate = configOrMaxTokens.refillRate;
      this.refillIntervalMs = configOrMaxTokens.refillIntervalMs;
    } else {
      // Legacy parameters
      this.maxTokens = configOrMaxTokens;
      this.refillRate = refillRate || 1;
      this.refillIntervalMs = 1000; // Default to 1 second
    }
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(key: string): boolean {
    const bucket = this.getBucket(key);
    this.refillBucket(bucket);

    return bucket.tokens >= 1;
  }

  /**
   * Record a request
   */
  recordRequest(key: string): void {
    const bucket = this.getBucket(key);
    this.refillBucket(bucket);
    bucket.tokens = Math.max(0, bucket.tokens - 1);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.buckets.set(key, {
      tokens: this.maxTokens,
      lastRefill: Date.now(),
    });
  }

  /**
   * Get or create bucket for key
   */
  private getBucket(key: string): TokenBucket {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  /**
   * Refill bucket based on time elapsed
   */
  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const intervals = elapsed / this.refillIntervalMs;
    const tokensToAdd = intervals * this.refillRate;

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }
}

/**
 * Global rate limiter instance
 * 60 requests per minute = 1 request per second
 */
export const globalRateLimiter = new TokenBucketRateLimiter(60, 1);
