# Storage Types Documentation

This document describes the data models and TypeScript interfaces used by the client-side productivity features.

## Overview

The `types.ts` file defines all core data structures used by the History, Bookmark, Cache, Template, and Settings services. These interfaces ensure type safety and consistent data structures across the application.

## Data Models

### History Service

#### HistoryEntry

Represents a query-response pair stored in the user's history.

```typescript
interface HistoryEntry {
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
```

**Storage:**
- Key pattern: `history_{id}`
- Max entries: 50
- Max size per entry: ~15KB
- Total allocation: 750KB

### Bookmark Service

#### Bookmark

Represents a user-bookmarked response.

```typescript
interface Bookmark {
  id: string;                    // UUID v4
  query: string;                 // Original query
  response: string;              // AI response
  timestamp: number;             // Creation time
  tags: string[];               // User tags
  notes?: string;               // User notes
  color?: string;               // Visual marker
}
```

**Storage:**
- Key pattern: `bookmark_{id}`
- Max size: 2MB total
- No hard limit on entries (user-managed)

### Cache Service

#### CacheEntry

Represents a cached query-response pair with fuzzy matching support.

```typescript
interface CacheEntry {
  key: string;                   // Query hash
  query: string;                 // Original query
  normalizedQuery: string;       // For fuzzy matching
  response: AIResponse;          // Cached response
  timestamp: number;             // Cache time
  expiresAt: number;            // Expiration time
  accessCount: number;          // Access frequency
  lastAccessed: number;         // LRU tracking
}
```

**Storage:**
- Key pattern: `cache_{hash}`
- TTL: 24 hours
- Max size: 3MB
- Eviction: LRU when quota exceeded

#### FuzzyMatch

Result of a fuzzy cache match.

```typescript
interface FuzzyMatch {
  query: string;                 // Matched query
  response: AIResponse;          // Cached response
  similarity: number;            // 0-1 score
  timestamp: number;             // Original cache time
}
```

#### CacheStats

Cache performance statistics.

```typescript
interface CacheStats {
  hits: number;                  // Exact cache hits
  misses: number;                // Cache misses
  fuzzyHits: number;            // Fuzzy match hits
  hitRate: number;              // Percentage
  apiSavings: number;           // Estimated cost savings
}
```

### Template Service

#### Template

Represents a prompt template (built-in or custom).

```typescript
interface Template {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Template description
  prompt: string;                // Template text
  category: string;              // Category for organization
  builtin: boolean;             // Is this a built-in template?
}
```

#### CustomTemplate

User-created template with creation timestamp.

```typescript
interface CustomTemplate extends Omit<Template, 'builtin'> {
  createdAt: number;            // Creation timestamp
}
```

### Settings Service

#### UserSettings

User preferences and application settings.

```typescript
interface UserSettings {
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
```

**Storage:**
- Key: `settings_user`
- Max size: 5KB

### Metadata Types

#### StorageMetadata

Tracks storage usage and management information.

```typescript
interface StorageMetadata {
  version: string;               // Schema version
  lastCleanup: number;          // Last cleanup timestamp
  totalEntries: number;         // Total entries across all namespaces
  usageByNamespace: Record<string, number>;  // Bytes per namespace
}
```

#### UsageMetrics

Application usage and performance metrics.

```typescript
interface UsageMetrics {
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
```

## Validation Functions

Each data model has a corresponding validation function:

- `isValidHistoryEntry(entry: unknown): entry is HistoryEntry`
- `isValidBookmark(bookmark: unknown): bookmark is Bookmark`
- `isValidCacheEntry(entry: unknown): entry is CacheEntry`
- `isValidTemplate(template: unknown): template is Template`
- `isValidUserSettings(settings: unknown): settings is UserSettings`
- `isValidStorageMetadata(metadata: unknown): metadata is StorageMetadata`
- `isValidUsageMetrics(metrics: unknown): metrics is UsageMetrics`

These functions perform runtime type checking to ensure data integrity when reading from localStorage.

## Default Values

The module exports default values for common types:

- `DEFAULT_USER_SETTINGS`: Default application settings
- `DEFAULT_STORAGE_METADATA`: Initial storage metadata
- `DEFAULT_USAGE_METRICS`: Initial usage metrics
- `DEFAULT_FUZZY_CONFIG`: Default fuzzy matching configuration

## Usage Example

```typescript
import {
  type HistoryEntry,
  type Bookmark,
  isValidHistoryEntry,
  DEFAULT_USER_SETTINGS,
} from '@/services/storage';

// Create a history entry
const entry: HistoryEntry = {
  id: crypto.randomUUID(),
  query: 'How can I optimize my morning routine?',
  response: 'Here are some suggestions...',
  timestamp: Date.now(),
};

// Validate data from localStorage
const stored = localStorage.getItem('history_123');
if (stored) {
  const parsed = JSON.parse(stored);
  if (isValidHistoryEntry(parsed)) {
    // Safe to use as HistoryEntry
    console.log(parsed.query);
  }
}

// Use default settings
const settings = { ...DEFAULT_USER_SETTINGS, theme: 'dark' };
```

## Storage Allocation

Total storage budget: 5-10MB

| Feature | Allocation | Notes |
|---------|-----------|-------|
| Query History | 750KB | 50 entries × ~15KB |
| Bookmarks | 2MB | User-managed |
| Enhanced Cache | 3MB | 24-hour TTL, LRU eviction |
| Templates & Settings | 250KB | Built-in + custom |
| **Total** | **~6MB** | Typical usage |

## Related Files

- `storage-manager.ts`: Storage abstraction layer
- `index.ts`: Public API exports
- `types.test.ts`: Unit tests for validation functions
