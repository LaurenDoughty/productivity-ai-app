/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cache entry with expiration
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttlMs: number;
  maxEntries: number;
  storageType: 'memory' | 'localStorage' | 'both';
}

/**
 * Multi-level API response cache
 */
export class APICache<T> {
  private memoryCache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private accessOrder: string[]; // For LRU eviction

  constructor(config: CacheConfig) {
    this.config = config;
    this.memoryCache = new Map();
    this.accessOrder = [];

    // Load from localStorage if enabled
    if (this.config.storageType === 'localStorage' || this.config.storageType === 'both') {
      this.loadFromLocalStorage();
    }
  }

  /**
   * Set a value in the cache
   */
  set(key: string, data: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttlMs,
      key,
    };

    // Add to memory cache
    this.memoryCache.set(key, entry);

    // Update access order for LRU
    this.updateAccessOrder(key);

    // Evict if over limit
    if (this.memoryCache.size > this.config.maxEntries) {
      this.evictOldest();
    }

    // Persist to localStorage if enabled
    if (this.config.storageType === 'localStorage' || this.config.storageType === 'both') {
      this.saveToLocalStorage(key, entry);
    }
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    // Check memory cache first
    let entry = this.memoryCache.get(key);

    // If not in memory, check localStorage
    if (!entry && (this.config.storageType === 'localStorage' || this.config.storageType === 'both')) {
      const localEntry = this.loadFromLocalStorageKey(key);
      if (localEntry) {
        entry = localEntry;
        this.memoryCache.set(key, entry);
      }
    }

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.invalidate(key);
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);

    return entry.data;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate a cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.accessOrder = this.accessOrder.filter((k) => k !== key);

    if (this.config.storageType === 'localStorage' || this.config.storageType === 'both') {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    this.accessOrder = [];

    if (this.config.storageType === 'localStorage' || this.config.storageType === 'both') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * Prune expired entries
   */
  prune(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.invalidate(key));
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter((k) => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder[0];
      this.invalidate(oldestKey);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          const cacheKey = key.substring(6);
          const entry = this.loadFromLocalStorageKey(cacheKey);
          if (entry && Date.now() <= entry.expiresAt) {
            this.memoryCache.set(cacheKey, entry);
            this.accessOrder.push(cacheKey);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  /**
   * Load a specific key from localStorage
   */
  private loadFromLocalStorageKey(key: string): CacheEntry<T> | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (item) {
        return JSON.parse(item) as CacheEntry<T>;
      }
    } catch (error) {
      console.warn('Failed to load key from localStorage:', error);
    }
    return null;
  }

  /**
   * Save entry to localStorage
   */
  private saveToLocalStorage(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
}
