# Storage Manager Service

The StorageManager service provides a unified interface for client-side data persistence with automatic fallback from localStorage to in-memory storage.

## Features

- **Automatic Fallback**: Seamlessly falls back to memory storage when localStorage is unavailable
- **Quota Management**: Monitors storage usage and automatically evicts old entries when quota is exceeded
- **Namespace Organization**: Organizes data using predefined namespaces for different features
- **Error Handling**: Gracefully handles storage errors, corrupted data, and quota exceeded scenarios
- **TypeScript Support**: Fully typed with generic support for type-safe operations

## Usage

### Basic Operations

```typescript
import { storageManager, STORAGE_NAMESPACES } from '@/services/storage';

// Set a value
await storageManager.set('my_key', { data: 'value' });

// Get a value
const value = await storageManager.get<{ data: string }>('my_key');

// Remove a value
await storageManager.remove('my_key');

// Clear all storage
await storageManager.clear();
```

### Using Namespaces

```typescript
import { storageManager, STORAGE_NAMESPACES } from '@/services/storage';

// Store history entry
await storageManager.set(
  `${STORAGE_NAMESPACES.HISTORY}entry_123`,
  {
    query: 'user query',
    response: 'AI response',
    timestamp: Date.now(),
  }
);

// Store bookmark
await storageManager.set(
  `${STORAGE_NAMESPACES.BOOKMARK}bookmark_456`,
  {
    query: 'important query',
    response: 'important response',
    tags: ['productivity', 'optimization'],
    timestamp: Date.now(),
  }
);
```

### Quota Management

```typescript
import { storageManager } from '@/services/storage';

// Get storage usage information
const usage = await storageManager.getUsage();
console.log(`Total: ${usage.total} bytes`);
console.log(`Available: ${usage.available} bytes`);
console.log(`Usage: ${usage.percentage}%`);
console.log('By namespace:', usage.byNamespace);

// Evict oldest entries from a namespace
await storageManager.evictOldest(STORAGE_NAMESPACES.HISTORY);
```

### Storage Type Detection

```typescript
import { storageManager } from '@/services/storage';

// Check if storage is available
if (storageManager.isAvailable()) {
  console.log('Storage is available');
}

// Check storage type
const type = storageManager.getStorageType();
console.log(`Using ${type} storage`);
```

## Namespaces

The following namespaces are available:

- `HISTORY` - Query history entries
- `BOOKMARK` - Bookmarked responses
- `CACHE` - Cached API responses
- `TEMPLATE` - Prompt templates
- `SETTINGS` - User settings
- `METADATA` - Application metadata

## Storage Limits

- **Total Quota**: 10MB
- **Warning Threshold**: 5MB
- **Auto-Eviction Threshold**: 8MB

When storage exceeds the auto-eviction threshold, the oldest 20% of entries from the relevant namespace are automatically removed.

## Error Handling

The StorageManager handles errors gracefully:

- **localStorage Unavailable**: Automatically falls back to memory storage
- **Quota Exceeded**: Attempts to evict old entries and retry
- **Corrupted Data**: Returns null for corrupted entries
- **Storage Errors**: Logs errors and continues operation

All operations are designed to never throw exceptions, ensuring the application remains functional even when storage fails.

## Testing

Unit tests are available at `tests/unit/services/storage/storage-manager.test.ts`.

Run tests with:
```bash
npm test -- tests/unit/services/storage/storage-manager.test.ts
```
