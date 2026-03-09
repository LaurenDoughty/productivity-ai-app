# Design Document: Client-Side Productivity Features

## Overview

This design implements 20 client-side productivity features for the Productivity Copilot application, maintaining zero backend costs while reducing API calls by 60-80% through aggressive caching. All features operate entirely in the browser using localStorage, service workers, and client-side JavaScript.

The design extends the existing React + TypeScript application with:
- Enhanced caching system (24-hour TTL with fuzzy matching)
- Query history and bookmarking (localStorage-based)
- Offline mode and PWA capabilities (service worker)
- Keyboard shortcuts and productivity tools
- Export, clipboard, and formatting features

Key constraints:
- Bundle size increase < 50KB gzipped
- localStorage usage < 5MB typical, < 10MB maximum
- Zero backend modifications
- Graceful degradation when browser features unavailable

## Architecture

### High-Level Architecture

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI Layer                          │
│  (Views, Components, Keyboard Handlers)                     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Storage      │  │ Cache        │  │ Export       │     │
│  │ Manager      │  │ Service      │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ History      │  │ Bookmark     │  │ Template     │     │
│  │ Service      │  │ Service      │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                 Browser Storage Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ localStorage │  │ IndexedDB    │  │ Memory       │     │
│  │ (primary)    │  │ (future)     │  │ (fallback)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Service Worker                            │
│  (Offline caching, PWA support, background sync)            │
└─────────────────────────────────────────────────────────────┘
```

### Storage Architecture

The storage system uses a multi-tier approach with automatic fallback:

1. **Primary Storage (localStorage)**: 5-10MB limit, synchronous access
2. **Memory Storage**: Unlimited (session-only), fallback when localStorage unavailable
3. **Service Worker Cache**: Application assets and static resources

Storage allocation by feature:
- Query History: 750KB (50 entries × ~15KB each)
- Bookmarks: 2MB (user-managed)
- Enhanced Cache: 3MB (24-hour TTL, LRU eviction)
- Templates & Settings: 250KB
- Total typical: ~5MB, maximum: ~10MB

### Caching Strategy

The enhanced caching system operates at two levels:

1. **Exact Match Cache**: Hash-based lookup for identical queries
2. **Fuzzy Match Cache**: Normalized text comparison for similar queries (< 10% difference)

Cache flow:
```
Query → Normalize → Hash → Exact Match?
                              ├─ Yes → Return cached response
                              └─ No → Fuzzy Match?
                                       ├─ Yes → Return with indicator
                                       └─ No → API call → Cache result
```

Normalization process:
- Convert to lowercase
- Remove extra whitespace
- Strip punctuation (except semantic characters)
- Calculate Levenshtein distance for fuzzy matching

### Service Worker Architecture

The service worker implements a cache-first strategy for static assets and network-first for API calls:

```javascript
// Cache strategy
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(event.request));
  } else if (isAPICall(event.request)) {
    // Network-first for API calls
    event.respondWith(networkFirst(event.request));
  }
});
```

## Components and Interfaces

### StorageManager

Central storage abstraction with automatic fallback and quota management.

```typescript
interface StorageManager {
  // Core operations
  set(key: string, value: unknown): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Quota management
  getUsage(): Promise<StorageUsage>;
  evictOldest(namespace: string): Promise<void>;
  
  // Capability detection
  isAvailable(): boolean;
  getStorageType(): 'localStorage' | 'memory';
}

interface StorageUsage {
  total: number;        // Total bytes used
  byNamespace: Record<string, number>;  // Usage per feature
  available: number;    // Remaining quota
  percentage: number;   // Usage percentage
}
```

### EnhancedCacheService

Extends existing APICache with fuzzy matching and 24-hour TTL.

```typescript
interface EnhancedCacheService {
  // Exact match
  get(query: string): Promise<CachedResponse | null>;
  set(query: string, response: AIResponse): Promise<void>;
  
  // Fuzzy match
  findSimilar(query: string, threshold: number): Promise<FuzzyMatch | null>;
  
  // Management
  prune(): Promise<void>;
  getStats(): CacheStats;
}

interface FuzzyMatch {
  query: string;
  response: AIResponse;
  similarity: number;   // 0-1 score
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  fuzzyHits: number;
  hitRate: number;      // Percentage
  apiSavings: number;   // Estimated cost savings
}
```

### HistoryService

Manages query history with LRU eviction.

```typescript
interface HistoryService {
  // CRUD operations
  add(entry: HistoryEntry): Promise<void>;
  get(id: string): Promise<HistoryEntry | null>;
  getAll(): Promise<HistoryEntry[]>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  
  // Search and filter
  search(query: string): Promise<HistoryEntry[]>;
  getRecent(limit: number): Promise<HistoryEntry[]>;
}

interface HistoryEntry {
  id: string;           // UUID
  query: string;
  response: string;
  timestamp: number;
  rating?: 'up' | 'down';
  tags?: string[];
  cached?: boolean;     // Was this served from cache?
}
```

### BookmarkService

Manages user bookmarks with tagging support.

```typescript
interface BookmarkService {
  // CRUD operations
  add(bookmark: Bookmark): Promise<void>;
  get(id: string): Promise<Bookmark | null>;
  getAll(): Promise<Bookmark[]>;
  remove(id: string): Promise<void>;
  update(id: string, updates: Partial<Bookmark>): Promise<void>;
  
  // Organization
  getByTag(tag: string): Promise<Bookmark[]>;
  getAllTags(): Promise<string[]>;
}

interface Bookmark {
  id: string;
  query: string;
  response: string;
  timestamp: number;
  tags: string[];
  notes?: string;
}
```

### TemplateService

Manages prompt templates (built-in and custom).

```typescript
interface TemplateService {
  // Built-in templates
  getBuiltIn(): Template[];
  
  // Custom templates
  addCustom(template: CustomTemplate): Promise<void>;
  getCustom(): Promise<CustomTemplate[]>;
  removeCustom(id: string): Promise<void>;
  
  // Search
  search(query: string): Template[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  builtin: boolean;
}

interface CustomTemplate extends Omit<Template, 'builtin'> {
  createdAt: number;
}
```

### ExportService

Generates downloadable files in multiple formats.

```typescript
interface ExportService {
  // Export operations
  exportMarkdown(content: ExportContent): void;
  exportJSON(content: ExportContent): void;
  exportPlainText(content: ExportContent): void;
  
  // Batch export
  exportHistory(entries: HistoryEntry[], format: ExportFormat): void;
  exportBookmarks(bookmarks: Bookmark[], format: ExportFormat): void;
}

interface ExportContent {
  query: string;
  response: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

type ExportFormat = 'markdown' | 'json' | 'text';
```

### KeyboardHandler

Manages keyboard shortcuts with platform detection.

```typescript
interface KeyboardHandler {
  // Registration
  register(shortcut: Shortcut): void;
  unregister(key: string): void;
  
  // State
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  
  // Help
  getShortcuts(): Shortcut[];
}

interface Shortcut {
  key: string;          // e.g., 'Ctrl+Enter', 'Cmd+K'
  description: string;
  handler: () => void;
  preventDefault: boolean;
}
```

### ClipboardService

Handles clipboard operations with fallback.

```typescript
interface ClipboardService {
  // Copy operations
  copy(text: string): Promise<boolean>;
  copyMarkdown(text: string): Promise<boolean>;
  
  // Capability detection
  isSupported(): boolean;
}
```

### PWAService

Manages PWA installation and updates.

```typescript
interface PWAService {
  // Installation
  canInstall(): boolean;
  promptInstall(): Promise<boolean>;
  
  // Updates
  checkForUpdates(): Promise<boolean>;
  applyUpdate(): Promise<void>;
  
  // Status
  isInstalled(): boolean;
  isOnline(): boolean;
}
```

## Data Models

### Storage Schema

All data stored in localStorage uses namespaced keys:

```typescript
// Namespace prefixes
const NAMESPACES = {
  HISTORY: 'history_',
  BOOKMARK: 'bookmark_',
  CACHE: 'cache_',
  TEMPLATE: 'template_',
  SETTINGS: 'settings_',
  METADATA: 'meta_',
};

// Metadata tracking
interface StorageMetadata {
  version: string;
  lastCleanup: number;
  totalEntries: number;
  usageByNamespace: Record<string, number>;
}
```

### Query History Schema

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

// Storage key: history_{id}
// Max entries: 50
// Max size per entry: ~15KB
// Total allocation: 750KB
```

### Bookmark Schema

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

// Storage key: bookmark_{id}
// Max size: 2MB total
// No hard limit on entries (user-managed)
```

### Cache Entry Schema

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

// Storage key: cache_{hash}
// TTL: 24 hours
// Max size: 3MB
// Eviction: LRU when quota exceeded
```

### Template Schema

```typescript
interface TemplateData {
  builtin: Template[];           // Immutable built-in templates
  custom: CustomTemplate[];      // User-created templates
}

// Built-in templates (10 templates)
const BUILTIN_TEMPLATES: Template[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine Optimization',
    description: 'Optimize your morning routine for productivity',
    prompt: 'Help me optimize my morning routine. I want to...',
    category: 'Daily Planning',
    builtin: true,
  },
  // ... 9 more templates
];

// Storage key: template_custom
// Max size: 100KB
```

### Settings Schema

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

// Storage key: settings_user
// Max size: 5KB
```

### Metrics Schema

```typescript
interface UsageMetrics {
  // API metrics
  totalQueries: number;
  cachedQueries: number;
  fuzzyMatches: number;
  apiCalls: number;
  
  // Performance metrics
  avgResponseTime: number;
  cacheHitRate: number;
  
  // Storage metrics
  storageUsed: number;
  entriesCount: number;
  
  // Cost savings
  estimatedSavings: number;      // Percentage
  
  // Timestamps
  firstUse: number;
  lastUpdated: number;
}

// Storage key: meta_metrics
// Updated on each query
```

### Fuzzy Matching Algorithm

The fuzzy matching system uses normalized Levenshtein distance:

```typescript
interface FuzzyMatchConfig {
  threshold: number;             // 0.9 = 10% difference allowed
  maxCandidates: number;        // Max entries to check
  normalization: {
    lowercase: boolean;
    removeWhitespace: boolean;
    removePunctuation: boolean;
  };
}

// Matching process:
// 1. Normalize both queries
// 2. Calculate Levenshtein distance
// 3. Normalize by max length: similarity = 1 - (distance / maxLength)
// 4. Return match if similarity >= threshold
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Storage Persistence**: Multiple criteria test that localStorage persists data (5.5, 8.5, 16.4). These are browser features, not application logic - marked as not testable.

2. **Cache Behavior**: Criteria 10.2 (exact match) and 19.1 (duplicate queries) test the same behavior - combined into one property.

3. **Fuzzy Matching**: Criteria 10.3 (fuzzy check) and 19.2 (fuzzy serving) test the same behavior - combined into one property.

4. **No API Calls**: Criteria 1.5 (history selection) and 4.4 (bookmark selection) both test that cached content doesn't trigger API calls - combined into one property about cached content.

5. **UI Element Presence**: Many criteria test that UI elements exist (buttons, panels, etc.). These are examples, not properties that need universal quantification.

6. **Keyboard Shortcuts**: Criteria 6.1-6.6 all test keyboard shortcut behavior - can be combined into a general property about shortcut handling.

The remaining properties provide unique validation value and will be included below.

### Property 1: History Size Invariant

*For any* sequence of query additions to history, the total number of entries shall never exceed 50.

**Validates: Requirements 1.2, 1.3**

### Property 2: History LRU Eviction

*For any* history at capacity (50 entries), when a new entry is added, the oldest entry by timestamp shall be removed.

**Validates: Requirements 1.3**

### Property 3: History Storage Quota

*For any* history state with 50 entries, the total storage size shall not exceed 750KB.

**Validates: Requirements 1.6**

### Property 4: Cached Content No API Calls

*For any* cached content (history entry, bookmark, or cached response), displaying it shall not trigger an API call.

**Validates: Requirements 1.5, 4.4, 10.2**

### Property 5: Clipboard Copy Preserves Content

*For any* response text, copying to clipboard shall result in clipboard contents matching the original text exactly.

**Validates: Requirements 2.2**

### Property 6: Markdown Copy Preserves Formatting

*For any* response with markdown formatting, copying as markdown shall preserve all markdown syntax in the clipboard.

**Validates: Requirements 2.3**

### Property 7: Export Format Correctness

*For any* response content, exporting as JSON shall produce valid JSON containing query, response, and timestamp fields.

**Validates: Requirements 3.3**

### Property 8: Export Filename Pattern

*For any* export operation, the generated filename shall match the pattern "productivity-copilot-YYYY-MM-DD-HHmmss.{ext}" where ext matches the export format.

**Validates: Requirements 3.6**

### Property 9: Export No Network Requests

*For any* export operation, no network requests shall be made during file generation or download.

**Validates: Requirements 3.5**

### Property 10: Bookmark Persistence

*For any* response that is bookmarked, the bookmark shall be stored with query, response, timestamp, and tags fields.

**Validates: Requirements 4.2, 4.5**

### Property 11: Bookmark Removal

*For any* bookmarked response, removing the bookmark shall result in it no longer appearing in the bookmarks collection.

**Validates: Requirements 4.6**

### Property 12: Bookmark Storage Quota

*For any* bookmarks collection, the total storage size shall not exceed 2MB.

**Validates: Requirements 4.7**

### Property 13: Template Application

*For any* prompt template, selecting it shall populate the query input field with the template's prompt text.

**Validates: Requirements 5.3**

### Property 14: Custom Template Persistence

*For any* custom template created by the user, it shall be stored in localStorage and retrievable in subsequent sessions.

**Validates: Requirements 5.4**

### Property 15: Keyboard Shortcut Execution

*For any* registered keyboard shortcut, pressing the key combination shall execute the associated handler and prevent default browser behavior.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

### Property 16: Character Count Accuracy

*For any* text in the query input field, the displayed character count shall equal the actual length of the text.

**Validates: Requirements 7.1**

### Property 17: Word Count Accuracy

*For any* text in the query input field, the displayed word count shall equal the number of whitespace-separated tokens.

**Validates: Requirements 7.2**

### Property 18: Token Estimation Formula

*For any* text in the query input field, the estimated token count shall equal the character count divided by 4 (rounded up).

**Validates: Requirements 7.3**

### Property 19: Rating Persistence

*For any* response that is rated, the rating shall be stored with the query-response pair and persist across page reloads.

**Validates: Requirements 8.2**

### Property 20: Rating Update

*For any* response with an existing rating, changing the rating shall update the stored value to the new rating.

**Validates: Requirements 8.4**

### Property 21: Rating Visual Feedback

*For any* response that is rated, the UI shall display visual feedback indicating which rating (up or down) was selected.

**Validates: Requirements 8.3**

### Property 22: Cache TTL Extension

*For any* cache entry, it shall remain valid for 24 hours from the time it was cached.

**Validates: Requirements 10.1**

### Property 23: Exact Cache Match

*For any* query that exactly matches a cached query (after hashing), the cached response shall be returned without making an API call.

**Validates: Requirements 10.2, 19.1**

### Property 24: Fuzzy Cache Match

*For any* query that differs from a cached query by less than 10% (after normalization), the cached response shall be returned with a "similar query" indicator.

**Validates: Requirements 10.3, 10.4, 10.5, 19.2**

### Property 25: Cache Key Format

*For any* cached query, the storage key shall be in the format "cache_{hash}" where hash is derived from the normalized query.

**Validates: Requirements 10.6**

### Property 26: Cache LRU Eviction

*For any* cache exceeding 3MB storage, the least recently accessed entries shall be evicted until storage is below 3MB.

**Validates: Requirements 10.7**

### Property 27: Suggested Prompt Selection

*For any* suggested prompt that is clicked, the query input field shall be populated with that prompt's text.

**Validates: Requirements 13.3**

### Property 28: Suggested Prompt Rotation

*For any* page load, the displayed suggested prompts shall be randomly selected from the pool of 15-20 examples.

**Validates: Requirements 13.4**

### Property 29: Streaming Incremental Display

*For any* streaming response, each text chunk shall be appended to the display as it arrives, without replacing previous chunks.

**Validates: Requirements 14.1, 14.2**

### Property 30: Streaming Cancellation

*For any* streaming response in progress, triggering cancellation shall stop the stream and prevent further chunks from being displayed.

**Validates: Requirements 14.5**

### Property 31: Refinement Context Preservation

*For any* response that is refined, the refinement prompt shall include the original query and response as context.

**Validates: Requirements 15.2, 15.3**

### Property 32: Refinement Chain Branching

*For any* point in a refinement chain, creating a branch shall start a new independent chain while preserving the original.

**Validates: Requirements 15.5**

### Property 33: Display Mode Toggle

*For any* response, toggling between markdown and plain text modes shall change the rendering without modifying the underlying content.

**Validates: Requirements 16.1, 16.5, 16.6**

### Property 34: Collapsible Section State

*For any* long response with collapsible sections, toggling a section shall change its visibility state without affecting other sections.

**Validates: Requirements 16.2**

### Property 35: Font Size Application

*For any* font size selection (small, medium, large), the displayed text size shall change to match the selected size.

**Validates: Requirements 16.3**

### Property 36: Storage Usage Monitoring

*For any* storage operation (add, remove, update), the total storage usage shall be recalculated and reflect the actual localStorage size.

**Validates: Requirements 18.1**

### Property 37: Storage Auto-Eviction

*For any* storage state exceeding 8MB, old history entries shall be automatically evicted until storage is below 8MB.

**Validates: Requirements 18.3**

### Property 38: Clear All Data

*For any* storage state, executing "Clear All Data" shall remove all localStorage entries with application namespaces.

**Validates: Requirements 18.5**

### Property 39: API Metrics Tracking

*For any* query (cached or not), the metrics shall be updated to reflect whether it was a cache hit, fuzzy match, or API call.

**Validates: Requirements 19.3**

### Property 40: Cache Hit Rate Calculation

*For any* set of queries, the cache hit rate shall equal (cache hits + fuzzy matches) / total queries.

**Validates: Requirements 19.4**

## Error Handling

### Storage Errors

**localStorage Unavailable**:
- Detect using try-catch around localStorage.setItem()
- Fall back to in-memory Map-based storage
- Display warning banner: "Browser storage unavailable. Data will not persist."
- Continue all operations using memory storage

**Quota Exceeded**:
- Catch QuotaExceededError on write operations
- Trigger automatic LRU eviction for the relevant namespace
- Retry the write operation once
- If still failing, display error: "Storage full. Please clear old data."

**Corrupted Data**:
- Wrap all JSON.parse() calls in try-catch
- Log corruption to console with key name
- Remove corrupted entry
- Return null/default value
- Continue operation without crashing

### Network Errors

**Offline Detection**:
- Listen to window 'online' and 'offline' events
- Update UI indicator immediately
- Queue new queries for retry when online (optional)
- Display message: "You're offline. Showing cached content only."

**API Failures**:
- Retry failed requests up to 3 times with exponential backoff
- If all retries fail, display error message
- Do not cache failed responses
- Allow user to retry manually

**Service Worker Errors**:
- Catch service worker registration failures
- Log to console but continue without offline support
- Display message: "Offline mode unavailable in this browser."

### UI Errors

**Clipboard Failures**:
- Catch clipboard API errors
- Display fallback instructions: "Copy failed. Please select and copy manually."
- Provide textarea with pre-selected text as fallback

**Keyboard Shortcut Conflicts**:
- Check for existing handlers before registering
- Allow user to disable shortcuts in settings
- Provide visual feedback when shortcuts are disabled

**Export Failures**:
- Catch Blob/download errors
- Provide fallback: display content in new window for manual save
- Display error message with fallback instructions

### Data Validation

**Input Validation**:
- Sanitize all user input before storage
- Limit string lengths: queries (10KB), responses (100KB), tags (50 chars)
- Reject invalid characters in filenames
- Validate JSON structure before parsing

**Storage Validation**:
- Verify data structure on read
- Check for required fields
- Validate timestamps are reasonable (not future, not too old)
- Sanitize before rendering to prevent XSS

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- UI component rendering
- Error handling paths
- Browser API integration
- Service worker lifecycle
- Specific keyboard shortcuts
- Storage quota edge cases

**Property Tests**: Verify universal properties across all inputs
- Storage operations with random data
- Cache matching with varied queries
- Export format correctness
- Keyboard shortcut handling
- Counter calculations
- Data persistence round-trips

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking enabled to find minimal failing cases

**Test Tagging**:
Each property test must include a comment referencing the design property:

```typescript
// Feature: client-side-productivity-features, Property 1: History Size Invariant
test('history never exceeds 50 entries', () => {
  fc.assert(
    fc.property(fc.array(fc.record({...}), {minLength: 51}), (entries) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

### Test Categories

**Storage Tests** (Properties 1-3, 10-12, 36-38):
- Generate random history/bookmark entries
- Test size limits and eviction
- Verify storage quota enforcement
- Test fallback to memory storage

**Cache Tests** (Properties 4, 22-26, 39-40):
- Generate random queries with variations
- Test exact and fuzzy matching
- Verify TTL expiration
- Test LRU eviction
- Verify no API calls for cached content

**Export Tests** (Properties 7-9):
- Generate random content with markdown
- Test all export formats
- Verify filename patterns
- Verify no network requests

**Clipboard Tests** (Properties 5-6):
- Generate random text and markdown
- Test copy operations
- Verify content preservation

**UI Interaction Tests** (Properties 13, 15, 27, 33-35):
- Test template selection
- Test keyboard shortcuts
- Test display mode toggles
- Test font size changes

**Counter Tests** (Properties 16-18):
- Generate random text inputs
- Verify character, word, and token counts
- Test real-time updates

**Rating Tests** (Properties 19-21):
- Test rating persistence
- Test rating updates
- Verify visual feedback

**Streaming Tests** (Properties 29-30):
- Mock streaming responses
- Test incremental display
- Test cancellation

**Refinement Tests** (Properties 31-32):
- Test context preservation
- Test chain branching

### Unit Test Examples

**Edge Cases**:
- Empty history/bookmarks
- Maximum storage capacity
- Offline mode transitions
- Service worker update cycles
- Corrupted localStorage data
- Missing browser APIs

**Integration Tests**:
- End-to-end query flow with caching
- Export → Import round-trip
- Keyboard shortcuts with focus management
- PWA installation flow
- Service worker cache updates

**Error Handling Tests**:
- localStorage quota exceeded
- Clipboard API unavailable
- Service worker registration failure
- Network timeout during query
- Corrupted cache entries

### Performance Tests

**Bundle Size**:
- Automated check in CI: fail if gzipped size > 50KB increase
- Use webpack-bundle-analyzer to identify large dependencies
- Verify code splitting for optional features

**Storage Performance**:
- Measure read/write times for large datasets
- Test with 50 history entries + 100 bookmarks + 3MB cache
- Verify operations complete in < 100ms

**UI Responsiveness**:
- Test keyboard shortcuts respond in < 50ms
- Test counter updates in < 16ms (60fps)
- Test streaming updates in < 100ms per chunk

### Browser Compatibility Tests

Test graceful degradation across browsers:
- Chrome/Edge (full support)
- Firefox (full support)
- Safari (limited service worker support)
- Mobile browsers (limited storage)
- Private/Incognito mode (no persistence)

### Continuous Integration

**Pre-commit**:
- Run unit tests
- Run linter
- Check bundle size

**CI Pipeline**:
- Run all unit tests
- Run all property tests (100 iterations each)
- Run integration tests
- Generate coverage report (target: 80%+)
- Build and measure bundle size
- Test in multiple browsers (Playwright)

**Property Test Failure Handling**:
- Log the failing seed for reproducibility
- Log the shrunk minimal failing case
- Create GitHub issue with reproduction steps
- Block merge until fixed

