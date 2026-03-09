/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  StorageManager,
  storageManager,
  STORAGE_NAMESPACES,
  type IStorageManager,
  type StorageUsage,
} from './storage-manager';

export {
  // History types
  type HistoryEntry,
  
  // Bookmark types
  type Bookmark,
  
  // Cache types
  type AIResponse,
  type CacheEntry,
  type FuzzyMatch,
  type CacheStats,
  type FuzzyMatchConfig,
  
  // Template types
  type Template,
  type CustomTemplate,
  type TemplateData,
  
  // Settings types
  type UserSettings,
  
  // Metadata types
  type StorageMetadata,
  type UsageMetrics,
  
  // Export types
  type ExportContent,
  type ExportFormat,
  
  // Keyboard types
  type Shortcut,
  
  // Validation functions
  isValidHistoryEntry,
  isValidBookmark,
  isValidCacheEntry,
  isValidTemplate,
  isValidUserSettings,
  isValidStorageMetadata,
  isValidUsageMetrics,
  
  // Default values
  DEFAULT_USER_SETTINGS,
  DEFAULT_STORAGE_METADATA,
  DEFAULT_USAGE_METRICS,
  DEFAULT_FUZZY_CONFIG,
} from './types';
