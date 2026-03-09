/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storageManager, STORAGE_NAMESPACES } from '../storage/storage-manager';
import {
  CacheEntry,
  AIResponse,
  FuzzyMatch,
  CacheStats,
  FuzzyMatchConfig,
  DEFAULT_FUZZY_CONFIG,
} from '../storage/types';

/**
 * Enhanced cache service with fuzzy matching and 24-hour TTL
 * Extends existing APICache with aggressive caching to reduce API calls by 60-80%
 */
export class EnhancedCacheService {
  private stats: CacheStats;
  private config: FuzzyMatchConfig;
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 3 * 1024 * 1024; // 3MB

  constructor(config: Partial<FuzzyMatchConfig> = {}) {
    this.config = { ...DEFAULT_FUZZY_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      fuzzyHits: 0,
      hitRate: 0,
      apiSavings: 0,
    };
    this.loadStats();
  }

  /**
   * Get cached response for exact query match
   */
  async get(query: string): Promise<AIResponse | null> {
    const hash = this.hashQuery(query);
    const key = `${STORAGE_NAMESPACES.CACHE}${hash}`;
    
    const entry = await storageManager.get<CacheEntry>(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await storageManager.remove(key);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    await storageManager.set(key, entry);

    // Update stats
    this.stats.hits++;
    this.updateHitRate();
    await this.saveStats();

    return entry.response;
  }

  /**
   * Set cached response for query
   */
  async set(query: string, response: AIResponse): Promise<void> {
    const now = Date.now();
    const hash = this.hashQuery(query);
    const key = `${STORAGE_NAMESPACES.CACHE}${hash}`;
    
    const entry: CacheEntry = {
      key: hash,
      query,
      normalizedQuery: this.normalizeQuery(query),
      response,
      timestamp: now,
      expiresAt: now + this.TTL_MS,
      accessCount: 1,
      lastAccessed: now,
    };

    await storageManager.set(key, entry);

    // Check cache size and evict if needed
    await this.checkAndEvict();
  }

  /**
   * Find similar cached query using fuzzy matching
   */
  async findSimilar(query: string, threshold?: number): Promise<FuzzyMatch | null> {
    const normalizedQuery = this.normalizeQuery(query);
    const matchThreshold = threshold ?? this.config.threshold;
    
    let bestMatch: FuzzyMatch | null = null;
    let bestSimilarity = 0;

    // Get all cache entries
    const entries = await this.getAllCacheEntries();
    
    // Limit candidates for performance
    const candidates = entries.slice(0, this.config.maxCandidates);

    for (const entry of candidates) {
      // Skip expired entries
      if (Date.now() > entry.expiresAt) {
        continue;
      }

      const similarity = this.calculateSimilarity(
        normalizedQuery,
        entry.normalizedQuery
      );

      if (similarity >= matchThreshold && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = {
          query: entry.query,
          response: entry.response,
          similarity,
          timestamp: entry.timestamp,
        };
      }
    }

    if (bestMatch) {
      // Update stats
      this.stats.fuzzyHits++;
      this.updateHitRate();
      await this.saveStats();

      // Update access tracking for the matched entry
      const hash = this.hashQuery(bestMatch.query);
      const key = `${STORAGE_NAMESPACES.CACHE}${hash}`;
      const entry = await storageManager.get<CacheEntry>(key);
      if (entry) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        await storageManager.set(key, entry);
      }
    }

    return bestMatch;
  }

  /**
   * Record a cache miss
   */
  async recordMiss(): Promise<void> {
    this.stats.misses++;
    this.updateHitRate();
    await this.saveStats();
  }

  /**
   * Prune expired entries
   */
  async prune(): Promise<void> {
    const now = Date.now();
    const entries = await this.getAllCacheEntries();

    for (const entry of entries) {
      if (now > entry.expiresAt) {
        const key = `${STORAGE_NAMESPACES.CACHE}${entry.key}`;
        await storageManager.remove(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const entries = await this.getAllCacheEntries();
    
    for (const entry of entries) {
      const key = `${STORAGE_NAMESPACES.CACHE}${entry.key}`;
      await storageManager.remove(key);
    }

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      fuzzyHits: 0,
      hitRate: 0,
      apiSavings: 0,
    };
    await this.saveStats();
  }

  /**
   * Normalize query for fuzzy matching
   */
  private normalizeQuery(query: string): string {
    let normalized = query;

    if (this.config.normalization.lowercase) {
      normalized = normalized.toLowerCase();
    }

    if (this.config.normalization.removePunctuation) {
      // Remove punctuation except semantic characters
      normalized = normalized.replace(/[^\w\s?!.-]/g, '');
    }

    if (this.config.normalization.removeWhitespace) {
      // Normalize whitespace to single spaces
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }

    return normalized;
  }

  /**
   * Calculate similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) {
      return 1.0;
    }

    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create distance matrix
    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Hash query for cache key
   */
  private hashQuery(query: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get all cache entries
   */
  private async getAllCacheEntries(): Promise<CacheEntry[]> {
    const entries: CacheEntry[] = [];
    
    try {
      // Get all keys in the cache namespace
      const keys = await storageManager.listKeys(STORAGE_NAMESPACES.CACHE);
      
      // Fetch each entry
      for (const key of keys) {
        const entry = await storageManager.get<CacheEntry>(key);
        if (entry && this.isValidCacheEntry(entry)) {
          entries.push(entry);
        }
      }
      
      // Sort by last accessed (most recent first) for LRU
      entries.sort((a, b) => b.lastAccessed - a.lastAccessed);
    } catch (error) {
      console.error('Failed to get all cache entries:', error);
    }
    
    return entries;
  }

  /**
   * Validate cache entry structure
   */
  private isValidCacheEntry(entry: unknown): entry is CacheEntry {
    if (typeof entry !== 'object' || entry === null) {
      return false;
    }
    
    const e = entry as Partial<CacheEntry>;
    
    return (
      typeof e.key === 'string' &&
      typeof e.query === 'string' &&
      typeof e.normalizedQuery === 'string' &&
      typeof e.response === 'object' &&
      e.response !== null &&
      typeof e.timestamp === 'number' &&
      typeof e.expiresAt === 'number' &&
      typeof e.accessCount === 'number' &&
      typeof e.lastAccessed === 'number'
    );
  }

  /**
   * Check cache size and evict if needed
   */
  private async checkAndEvict(): Promise<void> {
    const usage = await storageManager.getUsage();
    const cacheSize = usage.byNamespace[STORAGE_NAMESPACES.CACHE] || 0;

    if (cacheSize > this.MAX_CACHE_SIZE) {
      await storageManager.evictOldest(STORAGE_NAMESPACES.CACHE);
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.fuzzyHits + this.stats.misses;
    if (totalRequests > 0) {
      this.stats.hitRate = ((this.stats.hits + this.stats.fuzzyHits) / totalRequests) * 100;
      this.stats.apiSavings = this.stats.hitRate;
    }
  }

  /**
   * Load stats from storage
   */
  private async loadStats(): Promise<void> {
    const key = `${STORAGE_NAMESPACES.METADATA}cache_stats`;
    const stored = await storageManager.get<CacheStats>(key);
    
    if (stored && this.isValidStats(stored)) {
      this.stats = stored;
    }
  }

  /**
   * Validate stats structure
   */
  private isValidStats(stats: unknown): stats is CacheStats {
    if (typeof stats !== 'object' || stats === null) {
      return false;
    }
    
    const s = stats as Partial<CacheStats>;
    return (
      typeof s.hits === 'number' &&
      typeof s.misses === 'number' &&
      typeof s.fuzzyHits === 'number' &&
      typeof s.hitRate === 'number' &&
      typeof s.apiSavings === 'number'
    );
  }

  /**
   * Save stats to storage
   */
  private async saveStats(): Promise<void> {
    const key = `${STORAGE_NAMESPACES.METADATA}cache_stats`;
    await storageManager.set(key, this.stats);
  }
}

// Export singleton instance
export const enhancedCache = new EnhancedCacheService();
