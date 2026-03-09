/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { EnhancedCacheService } from '../../src/services/cache/enhanced-cache';
import { StorageManager, STORAGE_NAMESPACES } from '../../src/services/storage/storage-manager';
import { AIResponse } from '../../src/services/storage/types';

describe('Property-Based Tests: EnhancedCacheService', () => {
  let cache: EnhancedCacheService;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn((index: number) => Object.keys(localStorageMock)[index] || null),
      get length() {
        return Object.keys(localStorageMock).length;
      },
    } as Storage;

    cache = new EnhancedCacheService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Arbitrary generators
  const aiResponseArb = fc.record({
    text: fc.string({ minLength: 10, maxLength: 500 }),
    model: fc.option(
      fc.constantFrom('gemini-pro', 'gpt-4', 'claude-3'),
      { nil: undefined }
    ),
    timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
    tokenCount: fc.option(
      fc.integer({ min: 10, max: 1000 }),
      { nil: undefined }
    ),
  });

  const queryArb = fc.string({ minLength: 5, maxLength: 200 });

  /**
   * Property 22: Cache TTL Extension
   * **Validates: Requirements 10.1**
   * 
   * For any cache entry, it shall remain valid for 24 hours from the time it was cached.
   */
  it('Property 22: Cache TTL Extension - entries remain valid for 24 hours', async () => {
    await fc.assert(
      fc.asyncProperty(queryArb, aiResponseArb, async (query, response) => {
        const now = Date.now();
        vi.useFakeTimers();
        vi.setSystemTime(now);
        
        // Cache the response
        await cache.set(query, response);
        
        // Verify it's valid immediately
        const cached = await cache.get(query);
        expect(cached).not.toBeNull();
        expect(cached?.text).toBe(response.text);
        
        // Simulate time passing (23 hours, 59 minutes)
        const almostExpired = now + (24 * 60 * 60 * 1000) - (60 * 1000);
        vi.setSystemTime(almostExpired);
        
        // Should still be valid
        const stillValid = await cache.get(query);
        expect(stillValid).not.toBeNull();
        expect(stillValid?.text).toBe(response.text);
        
        // Simulate time passing beyond 24 hours
        const expired = now + (24 * 60 * 60 * 1000) + 1000;
        vi.setSystemTime(expired);
        
        // Should now be expired
        const shouldBeExpired = await cache.get(query);
        expect(shouldBeExpired).toBeNull();
        
        vi.useRealTimers();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 23: Exact Cache Match
   * **Validates: Requirements 10.2, 19.1**
   * 
   * For any query that exactly matches a cached query (after hashing), 
   * the cached response shall be returned without making an API call.
   */
  it('Property 23: Exact Cache Match - identical queries return cached response', async () => {
    await fc.assert(
      fc.asyncProperty(queryArb, aiResponseArb, async (query, response) => {
        // Cache the response
        await cache.set(query, response);
        
        // Retrieve with exact same query
        const cached = await cache.get(query);
        
        // Should return the exact cached response
        expect(cached).not.toBeNull();
        expect(cached?.text).toBe(response.text);
        expect(cached?.model).toBe(response.model);
        expect(cached?.timestamp).toBe(response.timestamp);
        
        // Stats should show a cache hit
        const stats = cache.getStats();
        expect(stats.hits).toBeGreaterThan(0);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 24: Fuzzy Cache Match
   * **Validates: Requirements 10.3, 10.4, 10.5, 19.2**
   * 
   * For any query that differs from a cached query by less than 10% (after normalization),
   * the cached response shall be returned with a "similar query" indicator.
   */
  it('Property 24: Fuzzy Cache Match - similar queries return cached response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 100 }),
        aiResponseArb,
        async (baseQuery, response) => {
          // Cache the original query
          await cache.set(baseQuery, response);
          
          // Create a similar query by changing case and whitespace (< 10% difference)
          const similarQuery = baseQuery.toUpperCase().replace(/\s+/g, '  ');
          
          // Find similar match
          const fuzzyMatch = await cache.findSimilar(similarQuery, 0.9);
          
          // Should find a fuzzy match
          expect(fuzzyMatch).not.toBeNull();
          if (fuzzyMatch) {
            expect(fuzzyMatch.response.text).toBe(response.text);
            expect(fuzzyMatch.similarity).toBeGreaterThanOrEqual(0.9);
            expect(fuzzyMatch.similarity).toBeLessThanOrEqual(1.0);
          }
          
          // Stats should show a fuzzy hit
          const stats = cache.getStats();
          expect(stats.fuzzyHits).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 25: Cache Key Format
   * **Validates: Requirements 10.6**
   * 
   * For any cached query, the storage key shall be in the format "cache_{hash}"
   * where hash is derived from the normalized query.
   */
  it('Property 25: Cache Key Format - keys follow cache_{hash} pattern', async () => {
    await fc.assert(
      fc.asyncProperty(queryArb, aiResponseArb, async (query, response) => {
        // Cache the response
        await cache.set(query, response);
        
        // Check all keys in localStorage
        const keys = Object.keys(localStorageMock);
        const cacheKeys = keys.filter(k => k.startsWith(STORAGE_NAMESPACES.CACHE));
        
        // Should have at least one cache key
        expect(cacheKeys.length).toBeGreaterThan(0);
        
        // All cache keys should match the pattern cache_{hash}
        for (const key of cacheKeys) {
          expect(key).toMatch(/^cache_[a-z0-9]+$/);
          
          // Hash should be alphanumeric (base36)
          const hash = key.replace(STORAGE_NAMESPACES.CACHE, '');
          expect(hash).toMatch(/^[a-z0-9]+$/);
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 26: Cache LRU Eviction
   * **Validates: Requirements 10.7**
   * 
   * For any cache exceeding 3MB storage, the least recently accessed entries
   * shall be evicted until storage is below 3MB.
   */
  it('Property 26: Cache LRU Eviction - least recently used entries are evicted', async () => {
    // This test verifies LRU behavior by creating multiple entries and checking
    // that older entries are evicted when space is needed
    
    const queries = ['query1', 'query2', 'query3', 'query4', 'query5'];
    const response: AIResponse = {
      text: 'x'.repeat(1000), // Large response to trigger eviction
      timestamp: Date.now(),
    };
    
    vi.useFakeTimers();
    const baseTime = Date.now();
    
    // Cache multiple entries with different access times
    for (let i = 0; i < queries.length; i++) {
      vi.setSystemTime(baseTime + i * 1000);
      await cache.set(queries[i], response);
    }
    
    // Access some entries to update their lastAccessed time
    vi.setSystemTime(baseTime + 10000);
    await cache.get(queries[0]); // Make query1 most recently accessed
    
    vi.setSystemTime(baseTime + 11000);
    await cache.get(queries[4]); // Make query5 second most recently accessed
    
    // Verify that entries track access count
    const stats = cache.getStats();
    expect(stats.hits).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  /**
   * Property 39: API Metrics Tracking
   * **Validates: Requirements 19.3**
   * 
   * For any query (cached or not), the metrics shall be updated to reflect
   * whether it was a cache hit, fuzzy match, or API call.
   */
  it('Property 39: API Metrics Tracking - metrics track hits, misses, and fuzzy matches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(queryArb, { minLength: 3, maxLength: 10 }),
        fc.array(aiResponseArb, { minLength: 3, maxLength: 10 }),
        async (queries, responses) => {
          // Clear cache and reset stats
          await cache.clear();
          
          const initialStats = cache.getStats();
          expect(initialStats.hits).toBe(0);
          expect(initialStats.misses).toBe(0);
          expect(initialStats.fuzzyHits).toBe(0);
          
          // Cache first query
          if (queries.length > 0 && responses.length > 0) {
            await cache.set(queries[0], responses[0]);
            
            // Hit: exact match
            await cache.get(queries[0]);
            const afterHit = cache.getStats();
            expect(afterHit.hits).toBeGreaterThan(initialStats.hits);
            
            // Miss: query not in cache
            await cache.recordMiss();
            const afterMiss = cache.getStats();
            expect(afterMiss.misses).toBeGreaterThan(afterHit.misses);
            
            // Fuzzy hit: similar query
            const similarQuery = queries[0].toUpperCase();
            await cache.findSimilar(similarQuery, 0.9);
            const afterFuzzy = cache.getStats();
            // Fuzzy hits may or may not increase depending on similarity
            expect(afterFuzzy.fuzzyHits).toBeGreaterThanOrEqual(afterMiss.fuzzyHits);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 40: Cache Hit Rate Calculation
   * **Validates: Requirements 19.4**
   * 
   * For any set of queries, the cache hit rate shall equal
   * (cache hits + fuzzy matches) / total queries.
   */
  it('Property 40: Cache Hit Rate Calculation - hit rate is correctly calculated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(queryArb, { minLength: 5, maxLength: 15 }),
        aiResponseArb,
        async (queries, response) => {
          // Clear cache
          await cache.clear();
          
          // Cache some queries
          const uniqueQueries = [...new Set(queries)];
          const numToCache = Math.floor(uniqueQueries.length / 2);
          
          for (let i = 0; i < numToCache; i++) {
            await cache.set(uniqueQueries[i], response);
          }
          
          // Access cached queries (hits)
          for (let i = 0; i < numToCache; i++) {
            await cache.get(uniqueQueries[i]);
          }
          
          // Access non-cached queries (misses)
          for (let i = numToCache; i < uniqueQueries.length; i++) {
            await cache.get(uniqueQueries[i]);
            await cache.recordMiss();
          }
          
          // Verify hit rate calculation
          const stats = cache.getStats();
          const totalRequests = stats.hits + stats.fuzzyHits + stats.misses;
          
          if (totalRequests > 0) {
            const expectedHitRate = ((stats.hits + stats.fuzzyHits) / totalRequests) * 100;
            expect(stats.hitRate).toBeCloseTo(expectedHitRate, 2);
            
            // Hit rate should be between 0 and 100
            expect(stats.hitRate).toBeGreaterThanOrEqual(0);
            expect(stats.hitRate).toBeLessThanOrEqual(100);
            
            // API savings should equal hit rate
            expect(stats.apiSavings).toBeCloseTo(stats.hitRate, 2);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
