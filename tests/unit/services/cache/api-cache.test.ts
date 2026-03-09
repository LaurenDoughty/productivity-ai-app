/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { APICache } from '../../../../src/services/cache/api-cache';

describe('APICache', () => {
  let cache: APICache<string>;

  beforeEach(() => {
    cache = new APICache<string>({
      ttlMs: 3600000, // 1 hour
      maxEntries: 100,
      storageType: 'memory',
    });
  });

  describe('set and get', () => {
    it('should store and retrieve cached values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should remove cached entries', () => {
      cache.set('key1', 'value1');
      cache.invalidate('key1');
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all cached entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('LRU eviction', () => {
    it('should respect max entries limit', () => {
      const smallCache = new APICache<string>({
        ttlMs: 3600000,
        maxEntries: 2,
        storageType: 'memory',
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Oldest entry should be evicted
      expect(smallCache.has('key1')).toBe(false);
      expect(smallCache.has('key3')).toBe(true);
    });
  });

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      const shortTTLCache = new APICache<string>({
        ttlMs: 100, // 100ms
        maxEntries: 100,
        storageType: 'memory',
      });

      shortTTLCache.set('key1', 'value1');
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(shortTTLCache.get('key1')).toBeNull();
    });
  });

  describe('prune', () => {
    it('should remove expired entries', async () => {
      const shortTTLCache = new APICache<string>({
        ttlMs: 100,
        maxEntries: 100,
        storageType: 'memory',
      });

      shortTTLCache.set('key1', 'value1');
      shortTTLCache.set('key2', 'value2');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      shortTTLCache.prune();

      expect(shortTTLCache.has('key1')).toBe(false);
      expect(shortTTLCache.has('key2')).toBe(false);
    });
  });
});
