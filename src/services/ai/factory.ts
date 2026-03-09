/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider, ProviderConfig, AuthenticationError } from './types.js';
import { GeminiProvider } from './gemini-provider.js';
import { BedrockProvider } from './bedrock-provider.js';
import { BackendAIProvider } from './backend-provider.js';

/**
 * Get environment variable value
 * This function can be mocked in tests
 */
export function getEnv(key: string): string | undefined {
  return import.meta.env[key];
}

/**
 * Factory for creating AI provider instances
 */
export class AIProviderFactory {
  /**
   * Create a provider instance from configuration
   */
  static create(config: ProviderConfig): AIProvider {
    switch (config.type) {
      case 'gemini':
        return new GeminiProvider(config);
      case 'bedrock':
        return new BedrockProvider(config);
      default:
        throw new Error(`Unknown provider type: ${(config as any).type}`);
    }
  }

  /**
   * Create a provider instance from environment variables
   * In production, uses backend proxy to keep API keys secure
   */
  static createFromEnvironment(): AIProvider {
    // In production, always use backend proxy for security
    const isDev = import.meta.env.DEV;
    
    if (!isDev) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Using backend AI proxy for secure API access',
        })
      );
      return new BackendAIProvider();
    }

    // Development mode - use direct provider
    const providerType = (getEnv('VITE_AI_PROVIDER') || 'gemini') as 'gemini' | 'bedrock';

    // Log provider selection
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'AI provider selected',
        provider: providerType,
      })
    );

    // Validate credentials based on provider type
    if (providerType === 'gemini') {
      if (!getEnv('VITE_GEMINI_API_KEY')) {
        throw new AuthenticationError(
          'Gemini API key is required. Please set VITE_GEMINI_API_KEY environment variable.'
        );
      }
    } else if (providerType === 'bedrock') {
      if (!getEnv('AWS_REGION')) {
        throw new AuthenticationError(
          'AWS region is required for Bedrock. Please set AWS_REGION environment variable.'
        );
      }
    }

    const config: ProviderConfig = {
      type: providerType,
      apiKey: getEnv('VITE_GEMINI_API_KEY'),
      region: getEnv('AWS_REGION') || 'us-east-1',
      modelId: getEnv('VITE_BEDROCK_MODEL_ID') || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      retryConfig: {
        maxRetries: parseInt(getEnv('VITE_MAX_RETRIES') || '3', 10),
        initialDelayMs: parseInt(getEnv('VITE_INITIAL_DELAY_MS') || '1000', 10),
        maxDelayMs: parseInt(getEnv('VITE_MAX_DELAY_MS') || '10000', 10),
        backoffMultiplier: parseFloat(getEnv('VITE_BACKOFF_MULTIPLIER') || '2'),
      },
      rateLimitConfig: {
        maxRequestsPerMinute: parseInt(getEnv('VITE_MAX_REQUESTS_PER_MINUTE') || '60', 10),
        maxTokensPerMinute: parseInt(getEnv('VITE_MAX_TOKENS_PER_MINUTE') || '100000', 10),
      },
    };

    return AIProviderFactory.create(config);
  }
}
