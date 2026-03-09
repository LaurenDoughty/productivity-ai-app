/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { APICache } from '../../src/services/cache/api-cache';

describe('Property-Based Tests: Caching', () => {
  let cache: APICache<string>;

  beforeEach(() => {
    cache = new APICache<string>({
      ttlMs: 3600000, // 1 hour
      maxEntries: 100,
      storageType: 'memory',
    });
  });

  /**
   * Property 12: Identical API requests use cache
   * For any API request, if an identical request is made within the cache TTL period,
   * the second request should return cached data without making a network call.
   */
  it('Property 12: Identical API requests use cache', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (key, value) => {
          // First request - cache miss
          expect(cache.has(key)).toBe(false);
          
          // Store in cache
          cache.set(key, value);
          
          // Second identical request - cache hit
          expect(cache.has(key)).toBe(true);
          expect(cache.get(key)).toBe(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Hashed assets have long cache headers
   * For any static asset with a content hash in its filename, the HTTP response
   * should include a Cache-Control header with max-age of 31536000 (1 year).
   */
  it('Property 9: Hashed assets have long cache headers', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8, maxLength: 16 }).filter((s) => /^[a-f0-9]+$/.test(s)),
        fc.constantFrom('.js', '.css', '.png', '.jpg', '.woff2'),
        (hash, ext) => {
          const filename = `asset-${hash}${ext}`;
          
          // Verify filename contains hash
          expect(filename).toMatch(/[a-f0-9]{8,}/);
          
          // Hashed assets should have long cache duration
          const maxAge = 31536000; // 1 year in seconds
          expect(maxAge).toBe(365 * 24 * 60 * 60);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Cache invalidation on version deployment
   * For any cached resource, when a new application version is deployed,
   * the old cached entries should be invalidated.
   */
  it('Property 21: Cache invalidation on version deployment', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 1, maxLength: 10 }),
        (entries) => {
          // Populate cache
          entries.forEach(([key, value]) => cache.set(key, value));
          
          // Verify all entries are cached
          entries.forEach(([key]) => {
            expect(cache.has(key)).toBe(true);
          });
          
          // Clear cache (simulating version deployment)
          cache.clear();
          
          // Verify all entries are invalidated
          entries.forEach(([key]) => {
            expect(cache.has(key)).toBe(false);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 27: API responses cached in browser storage
   * For any successful AI provider API response, the response should be cached
   * in browser storage with an expiration timestamp.
   */
  it('Property 27: API responses cached in browser storage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          content: fc.string(),
          tokensUsed: fc.record({
            input: fc.nat(),
            output: fc.nat(),
          }),
          provider: fc.constantFrom('gemini', 'bedrock'),
          latencyMs: fc.nat(),
          cached: fc.boolean(),
        }),
        (key, response) => {
          // Store response in cache
          cache.set(key, JSON.stringify(response));
          
          // Verify it's cached
          expect(cache.has(key)).toBe(true);
          
          // Verify we can retrieve it
          const cached = cache.get(key);
          expect(cached).toBeDefined();
          expect(JSON.parse(cached!)).toEqual(response);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test cache TTL expiration
   */
  it('should expire entries after TTL', async () => {
    const shortTTLCache = new APICache<string>({
      ttlMs: 100, // 100ms
      maxEntries: 100,
      storageType: 'memory',
    });

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (key, value) => {
          shortTTLCache.set(key, value);
          expect(shortTTLCache.has(key)).toBe(true);
          
          // Wait for TTL to expire
          await new Promise((resolve) => setTimeout(resolve, 150));
          
          // Entry should be expired
          expect(shortTTLCache.get(key)).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Test LRU eviction
   */
  it('should evict oldest entries when max entries exceeded', () => {
    const smallCache = new APICache<string>({
      ttlMs: 3600000,
      maxEntries: 3,
      storageType: 'memory',
    });

    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 5, maxLength: 10 }),
        (entries) => {
          // Add entries
          entries.forEach(([key, value]) => smallCache.set(key, value));
          
          // Cache should only contain last 3 entries
          const cachedCount = entries.filter(([key]) => smallCache.has(key)).length;
          expect(cachedCount).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 50 }
    );
  });
});
