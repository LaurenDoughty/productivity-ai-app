/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Storage namespace constants for organizing data
 */
export const STORAGE_NAMESPACES = {
  HISTORY: 'history_',
  BOOKMARK: 'bookmark_',
  CACHE: 'cache_',
  TEMPLATE: 'template_',
  SETTINGS: 'settings_',
  METADATA: 'meta_',
} as const;

/**
 * Storage usage information
 */
export interface StorageUsage {
  total: number;                          // Total bytes used
  byNamespace: Record<string, number>;    // Usage per feature
  available: number;                      // Remaining quota
  percentage: number;                     // Usage percentage
}

/**
 * Storage manager interface
 */
export interface IStorageManager {
  // Core operations
  set(key: string, value: unknown): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Quota management
  getUsage(): Promise<StorageUsage>;
  evictOldest(namespace: string): Promise<void>;
  
  // Namespace operations
  listKeys(namespace: string): Promise<string[]>;
  
  // Capability detection
  isAvailable(): boolean;
  getStorageType(): 'localStorage' | 'memory';
}

/**
 * StorageManager implementation with localStorage and memory fallback
 */
export class StorageManager implements IStorageManager {
  private memoryStorage: Map<string, unknown>;
  private storageType: 'localStorage' | 'memory';
  private readonly QUOTA_LIMIT = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.memoryStorage = new Map();
    this.storageType = this.detectStorageType();
  }

  /**
   * Detect available storage type
   */
  private detectStorageType(): 'localStorage' | 'memory' {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return 'localStorage';
    } catch (error) {
      console.warn('localStorage unavailable, falling back to memory storage:', error);
      return 'memory';
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.storageType === 'localStorage' || this.memoryStorage !== null;
  }

  /**
   * Get current storage type
   */
  getStorageType(): 'localStorage' | 'memory' {
    return this.storageType;
  }

  /**
   * Set a value in storage
   */
  async set(key: string, value: unknown): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.storageType === 'localStorage') {
      try {
        localStorage.setItem(key, serialized);
      } catch (error) {
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, attempting eviction');
          
          // Try to evict oldest entries from the namespace
          const namespace = this.extractNamespace(key);
          if (namespace) {
            await this.evictOldest(namespace);
            
            // Retry once after eviction
            try {
              localStorage.setItem(key, serialized);
              return;
            } catch (retryError) {
              console.error('Failed to set after eviction, falling back to memory');
              this.storageType = 'memory';
            }
          }
        } else {
          console.error('Failed to set in localStorage:', error);
          this.storageType = 'memory';
        }
      }
    }

    // Fallback to memory storage
    if (this.storageType === 'memory') {
      this.memoryStorage.set(key, value);
    }
  }

  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.storageType === 'localStorage') {
      try {
        const item = localStorage.getItem(key);
        if (item === null) {
          return null;
        }
        return JSON.parse(item) as T;
      } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return null;
      }
    }

    // Memory storage
    const value = this.memoryStorage.get(key);
    return value !== undefined ? (value as T) : null;
  }

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    if (this.storageType === 'localStorage') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    }

    this.memoryStorage.delete(key);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    if (this.storageType === 'localStorage') {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    }

    this.memoryStorage.clear();
  }

  /**
   * Get storage usage information
   */
  async getUsage(): Promise<StorageUsage> {
    const byNamespace: Record<string, number> = {};
    let total = 0;

    if (this.storageType === 'localStorage') {
      try {
        // Calculate usage for each namespace
        for (const namespace of Object.values(STORAGE_NAMESPACES)) {
          byNamespace[namespace] = 0;
        }

        // Iterate through all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              const size = new Blob([value]).size;
              total += size;

              // Categorize by namespace
              const namespace = this.extractNamespace(key);
              if (namespace && byNamespace[namespace] !== undefined) {
                byNamespace[namespace] += size;
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to calculate storage usage:', error);
      }
    } else {
      // Calculate memory storage usage
      for (const namespace of Object.values(STORAGE_NAMESPACES)) {
        byNamespace[namespace] = 0;
      }

      this.memoryStorage.forEach((value, key) => {
        const size = new Blob([JSON.stringify(value)]).size;
        total += size;

        const namespace = this.extractNamespace(key);
        if (namespace && byNamespace[namespace] !== undefined) {
          byNamespace[namespace] += size;
        }
      });
    }

    const available = Math.max(0, this.QUOTA_LIMIT - total);
    const percentage = (total / this.QUOTA_LIMIT) * 100;

    return {
      total,
      byNamespace,
      available,
      percentage,
    };
  }

  /**
   * Evict oldest entries from a namespace
   */
  async evictOldest(namespace: string): Promise<void> {
    const entries: Array<{ key: string; timestamp: number }> = [];

    if (this.storageType === 'localStorage') {
      try {
        // Find all entries in the namespace
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(namespace)) {
            const value = localStorage.getItem(key);
            if (value) {
              try {
                const parsed = JSON.parse(value);
                const timestamp = parsed.timestamp || 0;
                entries.push({ key, timestamp });
              } catch (error) {
                // If parsing fails, consider it for eviction with timestamp 0
                entries.push({ key, timestamp: 0 });
              }
            }
          }
        }

        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest 20% of entries
        const toRemove = Math.max(1, Math.floor(entries.length * 0.2));
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(entries[i].key);
        }
      } catch (error) {
        console.error('Failed to evict oldest entries:', error);
      }
    } else {
      // Evict from memory storage
      this.memoryStorage.forEach((value, key) => {
        if (key.startsWith(namespace)) {
          try {
            const parsed = value as { timestamp?: number };
            const timestamp = parsed.timestamp || 0;
            entries.push({ key, timestamp });
          } catch (error) {
            entries.push({ key, timestamp: 0 });
          }
        }
      });

      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.max(1, Math.floor(entries.length * 0.2));
      for (let i = 0; i < toRemove; i++) {
        this.memoryStorage.delete(entries[i].key);
      }
    }
  }

  /**
   * List all keys in a namespace
   */
  async listKeys(namespace: string): Promise<string[]> {
    const keys: string[] = [];

    if (this.storageType === 'localStorage') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(namespace)) {
            keys.push(key);
          }
        }
      } catch (error) {
        console.error('Failed to list keys from localStorage:', error);
      }
    } else {
      // List from memory storage
      this.memoryStorage.forEach((_, key) => {
        if (key.startsWith(namespace)) {
          keys.push(key);
        }
      });
    }

    return keys;
  }

  /**
   * Extract namespace from key
   */
  private extractNamespace(key: string): string | null {
    for (const namespace of Object.values(STORAGE_NAMESPACES)) {
      if (key.startsWith(namespace)) {
        return namespace;
      }
    }
    return null;
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
