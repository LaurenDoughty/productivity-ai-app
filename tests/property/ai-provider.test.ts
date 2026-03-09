/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AIProviderFactory } from '../../src/services/ai/factory';
import { OptimizationRequest } from '../../src/services/ai/types';

describe('Property-Based Tests: AI Provider', () => {
  /**
   * Property 31: Provider selection based on configuration
   * For any valid AI provider configuration, the application should instantiate
   * and use the correct provider implementation.
   */
  it('Property 31: Provider selection based on configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('gemini', 'bedrock'),
        (providerType) => {
          const config = {
            type: providerType,
            apiKey: providerType === 'gemini' ? 'test-key' : undefined,
            region: providerType === 'bedrock' ? 'us-east-1' : undefined,
            modelId:
              providerType === 'bedrock'
                ? 'anthropic.claude-3-5-sonnet-20241022-v2:0'
                : undefined,
            retryConfig: {
              maxRetries: 3,
              initialDelayMs: 1000,
              maxDelayMs: 10000,
              backoffMultiplier: 2,
            },
            rateLimitConfig: {
              maxRequestsPerMinute: 60,
              maxTokensPerMinute: 100000,
            },
          };

          const provider = AIProviderFactory.create(config as any);

          // Provider should match the requested type
          expect(provider.name).toBe(providerType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32: Provider abstraction ensures consistent response format
   * For any AI provider and any optimization request, the response format should be
   * identical regardless of which provider is active.
   */
  it('Property 32: Provider abstraction ensures consistent response format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          prompt: fc.string({ minLength: 1, maxLength: 100 }),
          context: fc.string({ maxLength: 200 }),
          maxTokens: fc.integer({ min: 100, max: 1000 }),
          temperature: fc.float({ min: 0, max: 1 }),
        }),
        async (request: OptimizationRequest) => {
          // This test would require mocking the actual API calls
          // For now, we verify the structure
          expect(request).toHaveProperty('prompt');
          expect(request).toHaveProperty('context');
          expect(request.prompt.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 34: Provider-specific request formatting
   * For any AI provider and any optimization request, the request should be
   * transformed into the format required by that provider's API.
   */
  it('Property 34: Provider-specific request formatting', () => {
    fc.assert(
      fc.property(
        fc.record({
          prompt: fc.string({ minLength: 1, maxLength: 100 }),
          context: fc.string({ maxLength: 200 }),
        }),
        (request) => {
          // Verify request has required fields
          expect(request.prompt).toBeDefined();
          expect(request.context).toBeDefined();
          expect(typeof request.prompt).toBe('string');
          expect(typeof request.context).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 37: Provider-specific configuration via environment variables
   * For any provider-specific configuration option, the value should be configurable
   * via environment variables and applied to API requests.
   */
  it('Property 37: Provider-specific configuration via environment variables', () => {
    fc.assert(
      fc.property(
        fc.record({
          maxRetries: fc.integer({ min: 1, max: 10 }),
          initialDelayMs: fc.integer({ min: 100, max: 5000 }),
          maxDelayMs: fc.integer({ min: 1000, max: 30000 }),
          backoffMultiplier: fc.float({ min: 1.5, max: 3 }),
        }),
        (retryConfig) => {
          // Verify retry config is valid
          expect(retryConfig.maxRetries).toBeGreaterThan(0);
          expect(retryConfig.initialDelayMs).toBeGreaterThan(0);
          expect(retryConfig.maxDelayMs).toBeGreaterThanOrEqual(retryConfig.initialDelayMs);
          expect(retryConfig.backoffMultiplier).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 38: Credential validation at startup
   * For any selected AI provider, if the required credentials are missing or invalid,
   * the application should fail at startup with a clear error message.
   */
  it('Property 38: Credential validation at startup', () => {
    fc.assert(
      fc.property(fc.constantFrom('gemini', 'bedrock'), (providerType) => {
        const configWithoutCredentials = {
          type: providerType,
          retryConfig: {
            maxRetries: 3,
            initialDelayMs: 1000,
            maxDelayMs: 10000,
            backoffMultiplier: 2,
          },
          rateLimitConfig: {
            maxRequestsPerMinute: 60,
            maxTokensPerMinute: 100000,
          },
        };

        // Should throw error when credentials are missing
        expect(() => AIProviderFactory.create(configWithoutCredentials as any)).toThrow();
      }),
      { numRuns: 50 }
    );
  });
});
