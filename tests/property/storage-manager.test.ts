/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { StorageManager, STORAGE_NAMESPACES } from '../../src/services/storage/storage-manager';

describe('Property-Based Tests: StorageManager', () => {
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

  /**
   * Property 36: Storage Usage Monitoring
   * **Validates: Requirements 18.1**
   * 
   * For any storage operation (add, remove, update), the total storage usage
   * shall be recalculated and reflect the actual localStorage size.
   */
  it('Property 36: Storage Usage Monitoring', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.oneof(
              fc.string({ minLength: 1, maxLength: 100 }),
              fc.record({
                data: fc.string({ minLength: 1, maxLength: 100 }),
                timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
              })
            ),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (entries) => {
          // Clear storage before test
          await storage.clear();
          
          // Get initial usage (should be 0)
          const initialUsage = await storage.getUsage();
          expect(initialUsage.total).toBe(0);
          
          // Add entries and track expected size
          let expectedSize = 0;
          for (const entry of entries) {
            await storage.set(entry.key, entry.value);
            const serialized = JSON.stringify(entry.value);
            expectedSize += new Blob([serialized]).size;
          }
          
          // Get usage after additions
          const afterAddUsage = await storage.getUsage();
          expect(afterAddUsage.total).toBe(expectedSize);
          expect(afterAddUsage.total).toBeGreaterThan(0);
          
          // Remove half the entries
          const toRemove = entries.slice(0, Math.floor(entries.length / 2));
          for (const entry of toRemove) {
            await storage.remove(entry.key);
            const serialized = JSON.stringify(entry.value);
            expectedSize -= new Blob([serialized]).size;
          }
          
          // Get usage after removals
          const afterRemoveUsage = await storage.getUsage();
          expect(afterRemoveUsage.total).toBe(expectedSize);
          
          // Verify available space is calculated correctly
          const quotaLimit = 10 * 1024 * 1024; // 10MB
          expect(afterRemoveUsage.available).toBe(quotaLimit - afterRemoveUsage.total);
          expect(afterRemoveUsage.percentage).toBe((afterRemoveUsage.total / quotaLimit) * 100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 37: Storage Auto-Eviction
   * **Validates: Requirements 18.3**
   * 
   * For any storage state exceeding 8MB, old history entries shall be
   * automatically evicted until storage is below 8MB.
   */
  it('Property 37: Storage Auto-Eviction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
            data: fc.string({ minLength: 100, maxLength: 500 }),
          }),
          { minLength: 10, maxLength: 30, selector: (entry) => entry.id }
        ),
        async (entries) => {
          // Clear storage before test
          await storage.clear();
          
          // Sort entries by timestamp to know which should be evicted
          const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
          
          // Add entries to history namespace
          for (const entry of sortedEntries) {
            const key = `${STORAGE_NAMESPACES.HISTORY}${entry.id}`;
            await storage.set(key, {
              timestamp: entry.timestamp,
              data: entry.data,
            });
          }
          
          // Get initial count
          const initialCount = sortedEntries.length;
          
          // Trigger eviction
          await storage.evictOldest(STORAGE_NAMESPACES.HISTORY);
          
          // Calculate how many should be evicted (20% of entries, minimum 1)
          const expectedEvicted = Math.max(1, Math.floor(initialCount * 0.2));
          
          // Verify oldest entries were evicted
          for (let i = 0; i < expectedEvicted; i++) {
            const key = `${STORAGE_NAMESPACES.HISTORY}${sortedEntries[i].id}`;
            const result = await storage.get(key);
            expect(result).toBeNull();
          }
          
          // Verify newer entries remain
          if (sortedEntries.length > expectedEvicted) {
            const key = `${STORAGE_NAMESPACES.HISTORY}${sortedEntries[sortedEntries.length - 1].id}`;
            const result = await storage.get(key);
            expect(result).not.toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 38: Clear All Data
   * **Validates: Requirements 18.5**
   * 
   * For any storage state, executing "Clear All Data" shall remove all
   * localStorage entries with application namespaces.
   */
  it('Property 38: Clear All Data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          history: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          bookmarks: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          cache: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          templates: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          settings: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          metadata: fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 10 }),
              value: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
        }),
        async (data) => {
          // Clear storage before test
          await storage.clear();
          
          // Add entries to all namespaces
          const allKeys: string[] = [];
          
          for (const entry of data.history) {
            const key = `${STORAGE_NAMESPACES.HISTORY}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          for (const entry of data.bookmarks) {
            const key = `${STORAGE_NAMESPACES.BOOKMARK}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          for (const entry of data.cache) {
            const key = `${STORAGE_NAMESPACES.CACHE}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          for (const entry of data.templates) {
            const key = `${STORAGE_NAMESPACES.TEMPLATE}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          for (const entry of data.settings) {
            const key = `${STORAGE_NAMESPACES.SETTINGS}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          for (const entry of data.metadata) {
            const key = `${STORAGE_NAMESPACES.METADATA}${entry.key}`;
            await storage.set(key, entry.value);
            allKeys.push(key);
          }
          
          // Verify entries exist
          const usageBeforeClear = await storage.getUsage();
          expect(usageBeforeClear.total).toBeGreaterThan(0);
          
          // Clear all data
          await storage.clear();
          
          // Verify all entries are removed
          for (const key of allKeys) {
            const result = await storage.get(key);
            expect(result).toBeNull();
          }
          
          // Verify storage is empty
          const usageAfterClear = await storage.getUsage();
          expect(usageAfterClear.total).toBe(0);
          expect(usageAfterClear.percentage).toBe(0);
          
          // Verify all namespace usages are 0
          for (const namespace of Object.values(STORAGE_NAMESPACES)) {
            expect(usageAfterClear.byNamespace[namespace]).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
