# Test Suite Documentation

This directory contains comprehensive tests for the AWS Elastic Beanstalk optimization implementation.

## Test Structure

```
tests/
├── setup.ts                    # Test configuration and global setup
├── unit/                       # Unit tests for individual components
│   ├── services/
│   │   ├── ai/
│   │   │   ├── factory.test.ts
│   │   │   ├── retry.test.ts
│   │   │   └── error-handler.test.ts
│   │   ├── cache/
│   │   │   └── api-cache.test.ts
│   │   └── rate-limiter.test.ts
│   └── utils/
│       └── sanitizer.test.ts
├── property/                   # Property-based tests
│   ├── ai-provider.test.ts
│   ├── cache.test.ts
│   ├── error-handling.test.ts
│   ├── security.test.ts
│   └── performance.test.ts
├── integration/                # Integration tests
│   ├── ai-provider.test.ts
│   └── health-check.test.ts
└── e2e/                        # End-to-end tests
    ├── user-flows.spec.ts
    └── performance.spec.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Property-Based Tests Only
```bash
npm run test:property
```

### Integration Tests Only
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### With Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Categories

### Unit Tests (tests/unit/)

Unit tests verify individual components in isolation:

- **AI Provider Factory** (`factory.test.ts`)
  - Provider creation from configuration
  - Environment-based provider selection
  - Credential validation
  - Error handling for missing credentials

- **Retry Handler** (`retry.test.ts`)
  - Exponential backoff algorithm
  - Max retries enforcement
  - Non-retryable error handling
  - Delay calculation

- **Error Handler** (`error-handler.test.ts`)
  - Error classification
  - User-friendly message generation
  - Provider-specific error handling

- **API Cache** (`api-cache.test.ts`)
  - Cache set/get operations
  - TTL expiration
  - LRU eviction
  - LocalStorage persistence

- **Rate Limiter** (`rate-limiter.test.ts`)
  - Token bucket algorithm
  - Request throttling
  - Per-user rate limiting
  - Token refill

- **Sanitizer** (`sanitizer.test.ts`)
  - XSS prevention
  - HTML sanitization
  - Prompt sanitization
  - Input validation

### Property-Based Tests (tests/property/)

Property-based tests verify universal properties across all inputs using fast-check:

- **AI Provider Properties** (`ai-provider.test.ts`)
  - Property 31: Provider selection based on configuration
  - Property 32: Consistent response format
  - Property 34: Provider-specific request formatting
  - Property 37: Configuration via environment variables
  - Property 38: Credential validation at startup

- **Cache Properties** (`cache.test.ts`)
  - Property 9: Hashed assets have long cache headers
  - Property 12: Identical requests use cache
  - Property 21: Cache invalidation on deployment
  - Property 27: API responses cached in browser storage

- **Error Handling Properties** (`error-handling.test.ts`)
  - Property 15: Unhandled errors logged with stack traces
  - Property 17: API failures logged and shown to users
  - Property 18: Log entries have severity levels
  - Property 26: Retry logic with exponential backoff

- **Security Properties** (`security.test.ts`)
  - Property 5: Sensitive data excluded from client bundle
  - Property 6: Missing env vars produce clear errors
  - Property 14: Request throttling limits API call rate
  - Property 19: User inputs are sanitized
  - Property 22: Interactive elements have minimum touch target size

- **Performance Properties** (`performance.test.ts`)
  - Property 7: Health check responds quickly
  - Property 13: Resource usage is logged
  - Property 20: API response times are tracked
  - Property 23: Input debouncing prevents excessive API calls
  - Property 24: Loading states shown during API requests
  - Property 25: Timeout warnings for slow requests
  - Property 28: In-flight requests cancelled on navigation
  - Property 29: Build fails on quality check failures
  - Property 30: Required env vars are documented

### Integration Tests (tests/integration/)

Integration tests verify component interactions:

- **AI Provider Integration** (`ai-provider.test.ts`)
  - Provider factory with environment configuration
  - Cached provider wrapper
  - Cache hit/miss behavior
  - Usage metrics tracking

- **Health Check Integration** (`health-check.test.ts`)
  - Health check endpoint
  - Memory check
  - Disk check
  - AI provider connectivity check
  - Response time validation

### E2E Tests (tests/e2e/)

End-to-end tests verify complete user flows:

- **User Flows** (`user-flows.spec.ts`)
  - Application loading
  - Navigation between views
  - Strategy card display
  - Optimizer input and submission
  - Loading states
  - Responsive design
  - Accessibility
  - Browser navigation

- **Performance** (`performance.spec.ts`)
  - Performance budgets
  - First Contentful Paint
  - Lazy loading efficiency
  - Bundle size
  - Asset caching
  - Layout shift
  - Interaction responsiveness
  - Health check response time

## Test Coverage Goals

- **Overall Coverage**: 80%+
- **Critical Paths**: 100%
  - AI provider abstraction
  - Error handling
  - Security features
  - Caching logic

## Property-Based Testing

We use `fast-check` for property-based testing with:
- **Minimum 50 runs** per property test
- **100 runs** for critical properties
- **20 runs** for async/slow properties

Property tests validate that correctness properties hold for all valid inputs, not just specific examples.

## Mocking Strategy

- **Unit Tests**: Mock external dependencies (API calls, file system, etc.)
- **Integration Tests**: Use real implementations where possible, mock only external services
- **E2E Tests**: Use real application with mocked backend services

## CI/CD Integration

Tests run automatically on:
- Every commit (unit + property tests)
- Pull requests (all tests including integration)
- Pre-deployment (full test suite + E2E)

## Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Property Test Template
```typescript
import fc from 'fast-check';

it('Property: Description', () => {
  fc.assert(
    fc.property(
      fc.string(),
      (input) => {
        // Property that should always hold
        expect(someProperty(input)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Something')).toBeVisible();
});
```

## Debugging Tests

### Run Single Test File
```bash
npm test -- factory.test.ts
```

### Run Single Test
```bash
npm test -- -t "should create Gemini provider"
```

### Debug Mode
```bash
npm test -- --inspect-brk
```

### E2E Debug Mode
```bash
npm run test:e2e -- --debug
```

## Test Maintenance

- Update tests when requirements change
- Add tests for new features
- Remove tests for deprecated features
- Keep test data realistic
- Use factories for test data generation
- Avoid test interdependencies

## Known Issues

None currently.

## Contributing

When adding new features:
1. Write unit tests first (TDD)
2. Add property tests for universal properties
3. Add integration tests for component interactions
4. Add E2E tests for user-facing features
5. Ensure all tests pass before committing
6. Maintain 80%+ code coverage
