/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager, STORAGE_NAMESPACES } from '../../../../src/services/storage/storage-manager';

describe('StorageManager', () => {
  let storage: StorageManager;
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

    storage = new StorageManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Storage Type Detection', () => {
    it('should detect localStorage availability', () => {
      expect(storage.isAvailable()).toBe(true);
      expect(storage.getStorageType()).toBe('localStorage');
    });

    it('should fallback to memory storage when localStorage unavailable', () => {
      // Create a new instance with broken localStorage
      global.localStorage = {
        setItem: vi.fn(() => {
          throw new Error('localStorage unavailable');
        }),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as Storage;

      const memoryStorage = new StorageManager();
      expect(memoryStorage.getStorageType()).toBe('memory');
      expect(memoryStorage.isAvailable()).toBe(true);
    });
  });

  describe('Core Operations', () => {
    describe('set and get', () => {
      it('should store and retrieve values', async () => {
        await storage.set('test_key', { data: 'test value' });
        const result = await storage.get<{ data: string }>('test_key');
        expect(result).toEqual({ data: 'test value' });
      });

      it('should handle string values', async () => {
        await storage.set('string_key', 'simple string');
        const result = await storage.get<string>('string_key');
        expect(result).toBe('simple string');
      });

      it('should handle number values', async () => {
        await storage.set('number_key', 42);
        const result = await storage.get<number>('number_key');
        expect(result).toBe(42);
      });

      it('should handle array values', async () => {
        const array = [1, 2, 3, 4, 5];
        await storage.set('array_key', array);
        const result = await storage.get<number[]>('array_key');
        expect(result).toEqual(array);
      });

      it('should handle complex nested objects', async () => {
        const complex = {
          id: '123',
          nested: {
            data: [1, 2, 3],
            meta: { timestamp: 1234567890 },
          },
        };
        await storage.set('complex_key', complex);
        const result = await storage.get<typeof complex>('complex_key');
        expect(result).toEqual(complex);
      });

      it('should return null for non-existent keys', async () => {
        const result = await storage.get('nonexistent');
        expect(result).toBeNull();
      });
    });

    describe('remove', () => {
      it('should remove stored values', async () => {
        await storage.set('test_key', 'test value');
        await storage.remove('test_key');
        const result = await storage.get('test_key');
        expect(result).toBeNull();
      });

      it('should handle removing non-existent keys', async () => {
        await expect(storage.remove('nonexistent')).resolves.not.toThrow();
      });
    });

    describe('clear', () => {
      it('should remove all stored values', async () => {
        await storage.set('key1', 'value1');
        await storage.set('key2', 'value2');
        await storage.set('key3', 'value3');
        
        await storage.clear();
        
        expect(await storage.get('key1')).toBeNull();
        expect(await storage.get('key2')).toBeNull();
        expect(await storage.get('key3')).toBeNull();
      });
    });
  });

  describe('Quota Management', () => {
    describe('getUsage', () => {
      it('should calculate total storage usage', async () => {
        await storage.set('test_key', 'test value');
        const usage = await storage.getUsage();
        
        expect(usage.total).toBeGreaterThan(0);
        expect(usage.available).toBeGreaterThan(0);
        expect(usage.percentage).toBeGreaterThanOrEqual(0);
        expect(usage.percentage).toBeLessThanOrEqual(100);
      });

      it('should categorize usage by namespace', async () => {
        await storage.set(`${STORAGE_NAMESPACES.HISTORY}entry1`, { data: 'history' });
        await storage.set(`${STORAGE_NAMESPACES.BOOKMARK}entry1`, { data: 'bookmark' });
        await storage.set(`${STORAGE_NAMESPACES.CACHE}entry1`, { data: 'cache' });
        
        const usage = await storage.getUsage();
        
        expect(usage.byNamespace[STORAGE_NAMESPACES.HISTORY]).toBeGreaterThan(0);
        expect(usage.byNamespace[STORAGE_NAMESPACES.BOOKMARK]).toBeGreaterThan(0);
        expect(usage.byNamespace[STORAGE_NAMESPACES.CACHE]).toBeGreaterThan(0);
      });

      it('should return zero usage for empty storage', async () => {
        await storage.clear();
        const usage = await storage.getUsage();
        
        expect(usage.total).toBe(0);
        expect(usage.percentage).toBe(0);
      });
    });

    describe('evictOldest', () => {
      it('should evict oldest entries from namespace', async () => {
        const namespace = STORAGE_NAMESPACES.HISTORY;
        
        // Add entries with different timestamps
        await storage.set(`${namespace}entry1`, { timestamp: 1000, data: 'old' });
        await storage.set(`${namespace}entry2`, { timestamp: 2000, data: 'newer' });
        await storage.set(`${namespace}entry3`, { timestamp: 3000, data: 'newest' });
        await storage.set(`${namespace}entry4`, { timestamp: 4000, data: 'very new' });
        await storage.set(`${namespace}entry5`, { timestamp: 5000, data: 'latest' });
        
        await storage.evictOldest(namespace);
        
        // Oldest entry should be removed (20% of 5 = 1 entry)
        expect(await storage.get(`${namespace}entry1`)).toBeNull();
        expect(await storage.get(`${namespace}entry5`)).not.toBeNull();
      });

      it('should only evict from specified namespace', async () => {
        await storage.set(`${STORAGE_NAMESPACES.HISTORY}entry1`, { timestamp: 1000 });
        await storage.set(`${STORAGE_NAMESPACES.BOOKMARK}entry1`, { timestamp: 1000 });
        
        await storage.evictOldest(STORAGE_NAMESPACES.HISTORY);
        
        // Bookmark should remain
        expect(await storage.get(`${STORAGE_NAMESPACES.BOOKMARK}entry1`)).not.toBeNull();
      });

      it('should handle namespace with no entries', async () => {
        await expect(storage.evictOldest(STORAGE_NAMESPACES.HISTORY)).resolves.not.toThrow();
      });

      it('should evict at least one entry even with small namespace', async () => {
        const namespace = STORAGE_NAMESPACES.HISTORY;
        await storage.set(`${namespace}entry1`, { timestamp: 1000 });
        
        await storage.evictOldest(namespace);
        
        expect(await storage.get(`${namespace}entry1`)).toBeNull();
      });
    });

    describe('listKeys', () => {
      it('should list all keys in a namespace', async () => {
        const namespace = STORAGE_NAMESPACES.CACHE;
        
        await storage.set(`${namespace}key1`, { data: 'value1' });
        await storage.set(`${namespace}key2`, { data: 'value2' });
        await storage.set(`${namespace}key3`, { data: 'value3' });
        await storage.set(`${STORAGE_NAMESPACES.HISTORY}other`, { data: 'other' });
        
        const keys = await storage.listKeys(namespace);
        
        expect(keys).toHaveLength(3);
        expect(keys).toContain(`${namespace}key1`);
        expect(keys).toContain(`${namespace}key2`);
        expect(keys).toContain(`${namespace}key3`);
        expect(keys).not.toContain(`${STORAGE_NAMESPACES.HISTORY}other`);
      });

      it('should return empty array for namespace with no entries', async () => {
        const keys = await storage.listKeys(STORAGE_NAMESPACES.CACHE);
        expect(keys).toEqual([]);
      });

      it('should only return keys from specified namespace', async () => {
        await storage.set(`${STORAGE_NAMESPACES.CACHE}cache1`, { data: 'cache' });
        await storage.set(`${STORAGE_NAMESPACES.HISTORY}history1`, { data: 'history' });
        await storage.set(`${STORAGE_NAMESPACES.BOOKMARK}bookmark1`, { data: 'bookmark' });
        
        const cacheKeys = await storage.listKeys(STORAGE_NAMESPACES.CACHE);
        
        expect(cacheKeys).toHaveLength(1);
        expect(cacheKeys[0]).toContain('cache');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle quota exceeded error', async () => {
      // Mock quota exceeded error
      const setItemMock = vi.fn().mockImplementationOnce(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });
      
      global.localStorage.setItem = setItemMock;
      
      // Should not throw, should fallback to memory
      await expect(storage.set('test_key', 'value')).resolves.not.toThrow();
    });

    it('should handle corrupted data gracefully', async () => {
      // Manually set corrupted data
      localStorageMock['corrupted_key'] = 'not valid json {{{';
      
      const result = await storage.get('corrupted_key');
      expect(result).toBeNull();
    });

    it('should handle localStorage errors during get', async () => {
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const result = await storage.get('test_key');
      expect(result).toBeNull();
    });

    it('should handle localStorage errors during remove', async () => {
      global.localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      await expect(storage.remove('test_key')).resolves.not.toThrow();
    });

    it('should handle localStorage errors during clear', async () => {
      const originalClear = global.localStorage.clear;
      global.localStorage.clear = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      await expect(storage.clear()).resolves.not.toThrow();
      
      // Restore original clear for afterEach
      global.localStorage.clear = originalClear;
    });
  });

  describe('Memory Storage Fallback', () => {
    let memoryStorage: StorageManager;

    beforeEach(() => {
      // Force memory storage by breaking localStorage
      global.localStorage = {
        setItem: vi.fn(() => {
          throw new Error('localStorage unavailable');
        }),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as Storage;

      memoryStorage = new StorageManager();
    });

    it('should use memory storage when localStorage unavailable', () => {
      expect(memoryStorage.getStorageType()).toBe('memory');
    });

    it('should store and retrieve from memory', async () => {
      await memoryStorage.set('test_key', 'test value');
      const result = await memoryStorage.get<string>('test_key');
      expect(result).toBe('test value');
    });

    it('should calculate usage for memory storage', async () => {
      await memoryStorage.set('test_key', { data: 'test' });
      const usage = await memoryStorage.getUsage();
      
      expect(usage.total).toBeGreaterThan(0);
    });

    it('should evict from memory storage', async () => {
      const namespace = STORAGE_NAMESPACES.HISTORY;
      await memoryStorage.set(`${namespace}entry1`, { timestamp: 1000 });
      await memoryStorage.set(`${namespace}entry2`, { timestamp: 2000 });
      
      await memoryStorage.evictOldest(namespace);
      
      expect(await memoryStorage.get(`${namespace}entry1`)).toBeNull();
    });
  });

  describe('Namespace Constants', () => {
    it('should have all required namespace constants', () => {
      expect(STORAGE_NAMESPACES.HISTORY).toBe('history_');
      expect(STORAGE_NAMESPACES.BOOKMARK).toBe('bookmark_');
      expect(STORAGE_NAMESPACES.CACHE).toBe('cache_');
      expect(STORAGE_NAMESPACES.TEMPLATE).toBe('template_');
      expect(STORAGE_NAMESPACES.SETTINGS).toBe('settings_');
      expect(STORAGE_NAMESPACES.METADATA).toBe('meta_');
    });
  });
});
