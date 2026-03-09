/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Data models and TypeScript interfaces for client-side productivity features
 * 
 * This file defines all core data structures used by the History, Bookmark,
 * Cache, Template, and Settings services to ensure type safety and consistent
 * data structures across the application.
 */

// ============================================================================
// History Service Types
// ============================================================================

/**
 * Query history entry stored in localStorage
 * 
 * Storage key pattern: history_{id}
 * Max entries: 50
 * Max size per entry: ~15KB
 * Total allocation: 750KB
 */
export interface HistoryEntry {
  id: string;                    // UUID v4
  query: string;                 // User query text
  response: string;              // AI response text
  timestamp: number;             // Unix timestamp (ms)
  rating?: 'up' | 'down';       // User rating
  tags?: string[];              // User-added tags
  cached?: boolean;             // Served from cache?
  tokenCount?: number;          // Estimated tokens
  responseTime?: number;        // Response time (ms)
}

// ============================================================================
// Bookmark Service Types
// ============================================================================

/**
 * Bookmarked response stored in localStorage
 * 
 * Storage key pattern: bookmark_{id}
 * Max size: 2MB total
 * No hard limit on entries (user-managed)
 */
export interface Bookmark {
  id: string;                    // UUID v4
  query: string;                 // Original query
  response: string;              // AI response
  timestamp: number;             // Creation time
  tags: string[];               // User tags
  notes?: string;               // User notes
  color?: string;               // Visual marker
}

// ============================================================================
// Cache Service Types
// ============================================================================

/**
 * AI response structure
 */
export interface AIResponse {
  text: string;                  // Response text
  model?: string;                // Model used
  timestamp: number;             // Response time
  tokenCount?: number;           // Tokens used
}

/**
 * Cached query-response pair
 * 
 * Storage key pattern: cache_{hash}
 * TTL: 24 hours
 * Max size: 3MB
 * Eviction: LRU when quota exceeded
 */
export interface CacheEntry {
  key: string;                   // Query hash
  query: string;                 // Original query
  normalizedQuery: string;       // For fuzzy matching
  response: AIResponse;          // Cached response
  timestamp: number;             // Cache time
  expiresAt: number;            // Expiration time
  accessCount: number;          // Access frequency
  lastAccessed: number;         // LRU tracking
}

/**
 * Fuzzy match result
 */
export interface FuzzyMatch {
  query: string;                 // Matched query
  response: AIResponse;          // Cached response
  similarity: number;            // 0-1 score
  timestamp: number;             // Original cache time
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;                  // Exact cache hits
  misses: number;                // Cache misses
  fuzzyHits: number;            // Fuzzy match hits
  hitRate: number;              // Percentage
  apiSavings: number;           // Estimated cost savings
}

/**
 * Fuzzy matching configuration
 */
export interface FuzzyMatchConfig {
  threshold: number;             // 0.9 = 10% difference allowed
  maxCandidates: number;        // Max entries to check
  normalization: {
    lowercase: boolean;
    removeWhitespace: boolean;
    removePunctuation: boolean;
  };
}

// ============================================================================
// Template Service Types
// ============================================================================

/**
 * Prompt template (built-in or custom)
 */
export interface Template {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Template description
  prompt: string;                // Template text
  category: string;              // Category for organization
  builtin: boolean;             // Is this a built-in template?
}

/**
 * Custom user-created template
 */
export interface CustomTemplate extends Omit<Template, 'builtin'> {
  createdAt: number;            // Creation timestamp
}

/**
 * Template data structure stored in localStorage
 * 
 * Storage key: template_custom
 * Max size: 100KB
 */
export interface TemplateData {
  builtin: Template[];           // Immutable built-in templates
  custom: CustomTemplate[];      // User-created templates
}

// ============================================================================
// Settings Service Types
// ============================================================================

/**
 * User preferences and settings
 * 
 * Storage key: settings_user
 * Max size: 5KB
 */
export interface UserSettings {
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  displayMode: 'markdown' | 'plain';
  
  // Feature toggles
  keyboardShortcuts: boolean;
  fuzzyMatching: boolean;
  offlineMode: boolean;
  
  // Cache settings
  cacheTTL: number;              // Hours
  fuzzyThreshold: number;        // 0-1
  
  // Storage settings
  autoCleanup: boolean;
  cleanupThreshold: number;      // MB
}

// ============================================================================
// Storage Metadata Types
// ============================================================================

/**
 * Storage metadata for tracking and management
 * 
 * Storage key: meta_storage
 */
export interface StorageMetadata {
  version: string;               // Schema version
  lastCleanup: number;          // Last cleanup timestamp
  totalEntries: number;         // Total entries across all namespaces
  usageByNamespace: Record<string, number>;  // Bytes per namespace
}

/**
 * Usage metrics for analytics and optimization
 * 
 * Storage key: meta_metrics
 */
export interface UsageMetrics {
  // API metrics
  totalQueries: number;          // Total queries submitted
  cachedQueries: number;         // Queries served from cache
  fuzzyMatches: number;          // Fuzzy match hits
  apiCalls: number;              // Actual API calls made
  
  // Performance metrics
  avgResponseTime: number;       // Average response time (ms)
  cacheHitRate: number;         // Cache hit percentage
  
  // Storage metrics
  storageUsed: number;          // Total storage used (bytes)
  entriesCount: number;         // Total entries
  
  // Cost savings
  estimatedSavings: number;     // Percentage of API calls saved
  
  // Timestamps
  firstUse: number;             // First usage timestamp
  lastUpdated: number;          // Last update timestamp
}

// ============================================================================
// Export Service Types
// ============================================================================

/**
 * Content to be exported
 */
export interface ExportContent {
  query: string;                 // Original query
  response: string;              // AI response
  timestamp: number;             // Creation time
  metadata?: Record<string, unknown>;  // Additional metadata
}

/**
 * Export format options
 */
export type ExportFormat = 'markdown' | 'json' | 'text';

// ============================================================================
// Keyboard Shortcut Types
// ============================================================================

/**
 * Keyboard shortcut definition
 */
export interface Shortcut {
  key: string;                   // e.g., 'Ctrl+Enter', 'Cmd+K'
  description: string;           // Human-readable description
  handler: () => void;          // Action to execute
  preventDefault: boolean;      // Prevent default browser behavior
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate HistoryEntry structure
 */
export function isValidHistoryEntry(entry: unknown): entry is HistoryEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  
  const e = entry as Partial<HistoryEntry>;
  
  return (
    typeof e.id === 'string' &&
    typeof e.query === 'string' &&
    typeof e.response === 'string' &&
    typeof e.timestamp === 'number' &&
    (e.rating === undefined || e.rating === 'up' || e.rating === 'down') &&
    (e.tags === undefined || Array.isArray(e.tags)) &&
    (e.cached === undefined || typeof e.cached === 'boolean') &&
    (e.tokenCount === undefined || typeof e.tokenCount === 'number') &&
    (e.responseTime === undefined || typeof e.responseTime === 'number')
  );
}

/**
 * Validate Bookmark structure
 */
export function isValidBookmark(bookmark: unknown): bookmark is Bookmark {
  if (typeof bookmark !== 'object' || bookmark === null) {
    return false;
  }
  
  const b = bookmark as Partial<Bookmark>;
  
  return (
    typeof b.id === 'string' &&
    typeof b.query === 'string' &&
    typeof b.response === 'string' &&
    typeof b.timestamp === 'number' &&
    Array.isArray(b.tags) &&
    (b.notes === undefined || typeof b.notes === 'string') &&
    (b.color === undefined || typeof b.color === 'string')
  );
}

/**
 * Validate CacheEntry structure
 */
export function isValidCacheEntry(entry: unknown): entry is CacheEntry {
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
 * Validate Template structure
 */
export function isValidTemplate(template: unknown): template is Template {
  if (typeof template !== 'object' || template === null) {
    return false;
  }
  
  const t = template as Partial<Template>;
  
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string' &&
    typeof t.prompt === 'string' &&
    typeof t.category === 'string' &&
    typeof t.builtin === 'boolean'
  );
}

/**
 * Validate UserSettings structure
 */
export function isValidUserSettings(settings: unknown): settings is UserSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }
  
  const s = settings as Partial<UserSettings>;
  
  return (
    (s.theme === 'light' || s.theme === 'dark' || s.theme === 'auto') &&
    (s.fontSize === 'small' || s.fontSize === 'medium' || s.fontSize === 'large') &&
    (s.displayMode === 'markdown' || s.displayMode === 'plain') &&
    typeof s.keyboardShortcuts === 'boolean' &&
    typeof s.fuzzyMatching === 'boolean' &&
    typeof s.offlineMode === 'boolean' &&
    typeof s.cacheTTL === 'number' &&
    typeof s.fuzzyThreshold === 'number' &&
    typeof s.autoCleanup === 'boolean' &&
    typeof s.cleanupThreshold === 'number'
  );
}

/**
 * Validate StorageMetadata structure
 */
export function isValidStorageMetadata(metadata: unknown): metadata is StorageMetadata {
  if (typeof metadata !== 'object' || metadata === null) {
    return false;
  }
  
  const m = metadata as Partial<StorageMetadata>;
  
  return (
    typeof m.version === 'string' &&
    typeof m.lastCleanup === 'number' &&
    typeof m.totalEntries === 'number' &&
    typeof m.usageByNamespace === 'object' &&
    m.usageByNamespace !== null
  );
}

/**
 * Validate UsageMetrics structure
 */
export function isValidUsageMetrics(metrics: unknown): metrics is UsageMetrics {
  if (typeof metrics !== 'object' || metrics === null) {
    return false;
  }
  
  const m = metrics as Partial<UsageMetrics>;
  
  return (
    typeof m.totalQueries === 'number' &&
    typeof m.cachedQueries === 'number' &&
    typeof m.fuzzyMatches === 'number' &&
    typeof m.apiCalls === 'number' &&
    typeof m.avgResponseTime === 'number' &&
    typeof m.cacheHitRate === 'number' &&
    typeof m.storageUsed === 'number' &&
    typeof m.entriesCount === 'number' &&
    typeof m.estimatedSavings === 'number' &&
    typeof m.firstUse === 'number' &&
    typeof m.lastUpdated === 'number'
  );
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default user settings
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'auto',
  fontSize: 'medium',
  displayMode: 'markdown',
  keyboardShortcuts: true,
  fuzzyMatching: true,
  offlineMode: true,
  cacheTTL: 24,
  fuzzyThreshold: 0.9,
  autoCleanup: true,
  cleanupThreshold: 8,
};

/**
 * Default storage metadata
 */
export const DEFAULT_STORAGE_METADATA: StorageMetadata = {
  version: '1.0.0',
  lastCleanup: Date.now(),
  totalEntries: 0,
  usageByNamespace: {},
};

/**
 * Default usage metrics
 */
export const DEFAULT_USAGE_METRICS: UsageMetrics = {
  totalQueries: 0,
  cachedQueries: 0,
  fuzzyMatches: 0,
  apiCalls: 0,
  avgResponseTime: 0,
  cacheHitRate: 0,
  storageUsed: 0,
  entriesCount: 0,
  estimatedSavings: 0,
  firstUse: Date.now(),
  lastUpdated: Date.now(),
};

/**
 * Default fuzzy match configuration
 */
export const DEFAULT_FUZZY_CONFIG: FuzzyMatchConfig = {
  threshold: 0.9,
  maxCandidates: 100,
  normalization: {
    lowercase: true,
    removeWhitespace: true,
    removePunctuation: true,
  },
};
