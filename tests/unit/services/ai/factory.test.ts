/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthenticationError, ProviderConfig } from '../../../../src/services/ai/types';

// Mock the getEnv function before importing the factory
let mockEnv: Record<string, string> = {};

vi.mock('../../../../src/services/ai/factory', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/services/ai/factory')>(
    '../../../../src/services/ai/factory'
  );
  return {
    ...actual,
    getEnv: (key: string) => mockEnv[key],
  };
});

// Now import after mocking
const { AIProviderFactory } = await import('../../../../src/services/ai/factory');
const { GeminiProvider } = await import('../../../../src/services/ai/gemini-provider');
const { BedrockProvider } = await import('../../../../src/services/ai/bedrock-provider');

describe('AIProviderFactory', () => {
  describe('create', () => {
    it('should create Gemini provider when type is gemini', () => {
      const config: ProviderConfig = {
        type: 'gemini',
        apiKey: 'test-key',
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

      const provider = AIProviderFactory.create(config);

      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.name).toBe('gemini');
    });

    it('should create Bedrock provider when type is bedrock', () => {
      const config: ProviderConfig = {
        type: 'bedrock',
        region: 'us-east-1',
        modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
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

      const provider = AIProviderFactory.create(config);

      expect(provider).toBeInstanceOf(BedrockProvider);
      expect(provider.name).toBe('bedrock');
    });

    it('should throw error for unknown provider type', () => {
      const config = {
        type: 'unknown',
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
      } as any;

      expect(() => AIProviderFactory.create(config)).toThrow('Unknown provider type: unknown');
    });
  });

  describe('createFromEnvironment', () => {
    beforeEach(() => {
      mockEnv = {};
    });

    it('should create Gemini provider when VITE_AI_PROVIDER is gemini', () => {
      mockEnv = {
        VITE_AI_PROVIDER: 'gemini',
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_MAX_RETRIES: '3',
        VITE_INITIAL_DELAY_MS: '1000',
        VITE_MAX_DELAY_MS: '10000',
        VITE_BACKOFF_MULTIPLIER: '2',
        VITE_MAX_REQUESTS_PER_MINUTE: '60',
        VITE_MAX_TOKENS_PER_MINUTE: '100000',
      };

      const provider = AIProviderFactory.createFromEnvironment();

      expect(provider.name).toBe('gemini');
    });

    it('should create Bedrock provider when VITE_AI_PROVIDER is bedrock', () => {
      mockEnv = {
        VITE_AI_PROVIDER: 'bedrock',
        AWS_REGION: 'us-east-1',
        VITE_BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        VITE_MAX_RETRIES: '3',
        VITE_INITIAL_DELAY_MS: '1000',
        VITE_MAX_DELAY_MS: '10000',
        VITE_BACKOFF_MULTIPLIER: '2',
        VITE_MAX_REQUESTS_PER_MINUTE: '60',
        VITE_MAX_TOKENS_PER_MINUTE: '100000',
      };

      const provider = AIProviderFactory.createFromEnvironment();

      expect(provider.name).toBe('bedrock');
    });

    it('should default to Gemini when VITE_AI_PROVIDER is not set', () => {
      mockEnv = {
        VITE_GEMINI_API_KEY: 'test-key',
        VITE_MAX_RETRIES: '3',
        VITE_INITIAL_DELAY_MS: '1000',
        VITE_MAX_DELAY_MS: '10000',
        VITE_BACKOFF_MULTIPLIER: '2',
        VITE_MAX_REQUESTS_PER_MINUTE: '60',
        VITE_MAX_TOKENS_PER_MINUTE: '100000',
      };

      const provider = AIProviderFactory.createFromEnvironment();

      expect(provider.name).toBe('gemini');
    });

    it('should throw error when Gemini is selected but API key is missing', () => {
      mockEnv = {
        VITE_AI_PROVIDER: 'gemini',
        VITE_MAX_RETRIES: '3',
      };

      expect(() => AIProviderFactory.createFromEnvironment()).toThrow(AuthenticationError);
      expect(() => AIProviderFactory.createFromEnvironment()).toThrow(
        'Gemini API key is required'
      );
    });

    it('should throw error when Bedrock is selected but AWS region is missing', () => {
      mockEnv = {
        VITE_AI_PROVIDER: 'bedrock',
        VITE_MAX_RETRIES: '3',
      };

      expect(() => AIProviderFactory.createFromEnvironment()).toThrow(AuthenticationError);
      expect(() => AIProviderFactory.createFromEnvironment()).toThrow(
        'AWS region is required for Bedrock'
      );
    });
  });
});
