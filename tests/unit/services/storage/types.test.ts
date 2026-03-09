/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  isValidHistoryEntry,
  isValidBookmark,
  isValidCacheEntry,
  isValidTemplate,
  isValidUserSettings,
  isValidStorageMetadata,
  isValidUsageMetrics,
  DEFAULT_USER_SETTINGS,
  DEFAULT_STORAGE_METADATA,
  DEFAULT_USAGE_METRICS,
  type HistoryEntry,
  type Bookmark,
  type CacheEntry,
  type Template,
  type UserSettings,
  type StorageMetadata,
  type UsageMetrics,
} from '../../../../src/services/storage';

describe('Storage Types Validation', () => {
  describe('HistoryEntry validation', () => {
    it('should validate a valid history entry', () => {
      const entry: HistoryEntry = {
        id: 'test-id',
        query: 'test query',
        response: 'test response',
        timestamp: Date.now(),
      };
      
      expect(isValidHistoryEntry(entry)).toBe(true);
    });

    it('should validate a history entry with optional fields', () => {
      const entry: HistoryEntry = {
        id: 'test-id',
        query: 'test query',
        response: 'test response',
        timestamp: Date.now(),
        rating: 'up',
        tags: ['tag1', 'tag2'],
        cached: true,
        tokenCount: 100,
        responseTime: 500,
      };
      
      expect(isValidHistoryEntry(entry)).toBe(true);
    });

    it('should reject invalid history entry', () => {
      expect(isValidHistoryEntry(null)).toBe(false);
      expect(isValidHistoryEntry({})).toBe(false);
      expect(isValidHistoryEntry({ id: 'test' })).toBe(false);
      expect(isValidHistoryEntry({ id: 123, query: 'test', response: 'test', timestamp: Date.now() })).toBe(false);
    });
  });

  describe('Bookmark validation', () => {
    it('should validate a valid bookmark', () => {
      const bookmark: Bookmark = {
        id: 'test-id',
        query: 'test query',
        response: 'test response',
        timestamp: Date.now(),
        tags: ['tag1'],
      };
      
      expect(isValidBookmark(bookmark)).toBe(true);
    });

    it('should validate a bookmark with optional fields', () => {
      const bookmark: Bookmark = {
        id: 'test-id',
        query: 'test query',
        response: 'test response',
        timestamp: Date.now(),
        tags: ['tag1'],
        notes: 'test notes',
        color: '#ff0000',
      };
      
      expect(isValidBookmark(bookmark)).toBe(true);
    });

    it('should reject invalid bookmark', () => {
      expect(isValidBookmark(null)).toBe(false);
      expect(isValidBookmark({})).toBe(false);
      expect(isValidBookmark({ id: 'test', query: 'test', response: 'test', timestamp: Date.now() })).toBe(false);
    });
  });

  describe('CacheEntry validation', () => {
    it('should validate a valid cache entry', () => {
      const entry: CacheEntry = {
        key: 'test-key',
        query: 'test query',
        normalizedQuery: 'test query',
        response: { text: 'test response', timestamp: Date.now() },
        timestamp: Date.now(),
        expiresAt: Date.now() + 86400000,
        accessCount: 1,
        lastAccessed: Date.now(),
      };
      
      expect(isValidCacheEntry(entry)).toBe(true);
    });

    it('should reject invalid cache entry', () => {
      expect(isValidCacheEntry(null)).toBe(false);
      expect(isValidCacheEntry({})).toBe(false);
      expect(isValidCacheEntry({ key: 'test' })).toBe(false);
    });
  });

  describe('Template validation', () => {
    it('should validate a valid template', () => {
      const template: Template = {
        id: 'test-id',
        name: 'Test Template',
        description: 'Test description',
        prompt: 'Test prompt',
        category: 'Test',
        builtin: true,
      };
      
      expect(isValidTemplate(template)).toBe(true);
    });

    it('should reject invalid template', () => {
      expect(isValidTemplate(null)).toBe(false);
      expect(isValidTemplate({})).toBe(false);
      expect(isValidTemplate({ id: 'test', name: 'test' })).toBe(false);
    });
  });

  describe('UserSettings validation', () => {
    it('should validate default user settings', () => {
      expect(isValidUserSettings(DEFAULT_USER_SETTINGS)).toBe(true);
    });

    it('should validate custom user settings', () => {
      const settings: UserSettings = {
        theme: 'dark',
        fontSize: 'large',
        displayMode: 'plain',
        keyboardShortcuts: false,
        fuzzyMatching: false,
        offlineMode: false,
        cacheTTL: 12,
        fuzzyThreshold: 0.8,
        autoCleanup: false,
        cleanupThreshold: 5,
      };
      
      expect(isValidUserSettings(settings)).toBe(true);
    });

    it('should reject invalid user settings', () => {
      expect(isValidUserSettings(null)).toBe(false);
      expect(isValidUserSettings({})).toBe(false);
      expect(isValidUserSettings({ theme: 'invalid' })).toBe(false);
    });
  });

  describe('StorageMetadata validation', () => {
    it('should validate default storage metadata', () => {
      expect(isValidStorageMetadata(DEFAULT_STORAGE_METADATA)).toBe(true);
    });

    it('should validate custom storage metadata', () => {
      const metadata: StorageMetadata = {
        version: '2.0.0',
        lastCleanup: Date.now(),
        totalEntries: 100,
        usageByNamespace: { history_: 1000, bookmark_: 2000 },
      };
      
      expect(isValidStorageMetadata(metadata)).toBe(true);
    });

    it('should reject invalid storage metadata', () => {
      expect(isValidStorageMetadata(null)).toBe(false);
      expect(isValidStorageMetadata({})).toBe(false);
      expect(isValidStorageMetadata({ version: '1.0.0' })).toBe(false);
    });
  });

  describe('UsageMetrics validation', () => {
    it('should validate default usage metrics', () => {
      expect(isValidUsageMetrics(DEFAULT_USAGE_METRICS)).toBe(true);
    });

    it('should validate custom usage metrics', () => {
      const metrics: UsageMetrics = {
        totalQueries: 100,
        cachedQueries: 80,
        fuzzyMatches: 10,
        apiCalls: 20,
        avgResponseTime: 500,
        cacheHitRate: 0.8,
        storageUsed: 1000000,
        entriesCount: 50,
        estimatedSavings: 0.8,
        firstUse: Date.now() - 86400000,
        lastUpdated: Date.now(),
      };
      
      expect(isValidUsageMetrics(metrics)).toBe(true);
    });

    it('should reject invalid usage metrics', () => {
      expect(isValidUsageMetrics(null)).toBe(false);
      expect(isValidUsageMetrics({})).toBe(false);
      expect(isValidUsageMetrics({ totalQueries: 100 })).toBe(false);
    });
  });

  describe('Default values', () => {
    it('should have valid default user settings', () => {
      expect(DEFAULT_USER_SETTINGS.theme).toBe('auto');
      expect(DEFAULT_USER_SETTINGS.fontSize).toBe('medium');
      expect(DEFAULT_USER_SETTINGS.displayMode).toBe('markdown');
      expect(DEFAULT_USER_SETTINGS.keyboardShortcuts).toBe(true);
      expect(DEFAULT_USER_SETTINGS.fuzzyMatching).toBe(true);
      expect(DEFAULT_USER_SETTINGS.offlineMode).toBe(true);
      expect(DEFAULT_USER_SETTINGS.cacheTTL).toBe(24);
      expect(DEFAULT_USER_SETTINGS.fuzzyThreshold).toBe(0.9);
      expect(DEFAULT_USER_SETTINGS.autoCleanup).toBe(true);
      expect(DEFAULT_USER_SETTINGS.cleanupThreshold).toBe(8);
    });

    it('should have valid default storage metadata', () => {
      expect(DEFAULT_STORAGE_METADATA.version).toBe('1.0.0');
      expect(DEFAULT_STORAGE_METADATA.totalEntries).toBe(0);
      expect(typeof DEFAULT_STORAGE_METADATA.lastCleanup).toBe('number');
      expect(typeof DEFAULT_STORAGE_METADATA.usageByNamespace).toBe('object');
    });

    it('should have valid default usage metrics', () => {
      expect(DEFAULT_USAGE_METRICS.totalQueries).toBe(0);
      expect(DEFAULT_USAGE_METRICS.cachedQueries).toBe(0);
      expect(DEFAULT_USAGE_METRICS.fuzzyMatches).toBe(0);
      expect(DEFAULT_USAGE_METRICS.apiCalls).toBe(0);
      expect(DEFAULT_USAGE_METRICS.avgResponseTime).toBe(0);
      expect(DEFAULT_USAGE_METRICS.cacheHitRate).toBe(0);
      expect(DEFAULT_USAGE_METRICS.storageUsed).toBe(0);
      expect(DEFAULT_USAGE_METRICS.entriesCount).toBe(0);
      expect(DEFAULT_USAGE_METRICS.estimatedSavings).toBe(0);
      expect(typeof DEFAULT_USAGE_METRICS.firstUse).toBe('number');
      expect(typeof DEFAULT_USAGE_METRICS.lastUpdated).toBe('number');
    });
  });
});
