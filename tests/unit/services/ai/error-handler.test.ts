/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { AIProviderErrorHandler } from '../../../../src/services/ai/error-handler';
import {
  NetworkError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
} from '../../../../src/services/ai/types';

describe('AIProviderErrorHandler', () => {
  const errorHandler = new AIProviderErrorHandler();

  describe('classifyError', () => {
    it('should classify NetworkError', () => {
      const error = new NetworkError('Connection failed');
      const errorType = errorHandler['classifyError'](error);
      expect(errorType).toBe('network');
    });

    it('should classify AuthenticationError', () => {
      const error = new AuthenticationError('Invalid API key');
      const errorType = errorHandler['classifyError'](error);
      expect(errorType).toBe('authentication');
    });

    it('should classify RateLimitError', () => {
      const error = new RateLimitError('Too many requests');
      const errorType = errorHandler['classifyError'](error);
      expect(errorType).toBe('rate_limit');
    });

    it('should classify TimeoutError', () => {
      const error = new TimeoutError('Request timed out');
      const errorType = errorHandler['classifyError'](error);
      expect(errorType).toBe('timeout');
    });

    it('should classify unknown errors', () => {
      const error = new Error('Unknown error');
      const errorType = errorHandler['classifyError'](error);
      expect(errorType).toBe('unknown');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for network errors', () => {
      const message = errorHandler['getUserFriendlyMessage']('network');
      expect(message).toContain('connect');
      expect(message).toContain('internet');
    });

    it('should return friendly message for authentication errors', () => {
      const message = errorHandler['getUserFriendlyMessage']('authentication');
      expect(message).toContain('Authentication');
      expect(message).toContain('credentials');
    });

    it('should return friendly message for rate limit errors', () => {
      const message = errorHandler['getUserFriendlyMessage']('rate_limit');
      expect(message).toContain('Rate limit');
      expect(message).toContain('try again');
    });

    it('should return friendly message for timeout errors', () => {
      const message = errorHandler['getUserFriendlyMessage']('timeout');
      expect(message).toContain('timed out');
      expect(message).toContain('try again');
    });

    it('should return friendly message for unknown errors', () => {
      const message = errorHandler['getUserFriendlyMessage']('unknown');
      expect(message).toContain('unexpected');
      expect(message).toContain('try again');
    });
  });

  describe('handleProviderError', () => {
    it('should handle network errors', async () => {
      const error = new NetworkError('Connection failed');
      const response = await errorHandler.handleProviderError(error, 'gemini');

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('network');
      expect(response.provider).toBe('gemini');
      expect(response.content).toContain('connect');
    });

    it('should handle authentication errors', async () => {
      const error = new AuthenticationError('Invalid API key');
      const response = await errorHandler.handleProviderError(error, 'bedrock');

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('authentication');
      expect(response.provider).toBe('bedrock');
      expect(response.content).toContain('Authentication');
    });

    it('should handle rate limit errors', async () => {
      const error = new RateLimitError('Too many requests');
      const response = await errorHandler.handleProviderError(error, 'gemini');

      expect(response.error).toBe(true);
      expect(response.errorType).toBe('rate_limit');
      expect(response.content).toContain('Rate limit');
    });

    it('should set tokensUsed to zero for errors', async () => {
      const error = new Error('Some error');
      const response = await errorHandler.handleProviderError(error, 'gemini');

      expect(response.tokensUsed.input).toBe(0);
      expect(response.tokensUsed.output).toBe(0);
    });

    it('should set latencyMs to zero for errors', async () => {
      const error = new Error('Some error');
      const response = await errorHandler.handleProviderError(error, 'gemini');

      expect(response.latencyMs).toBe(0);
    });

    it('should set cached to false for errors', async () => {
      const error = new Error('Some error');
      const response = await errorHandler.handleProviderError(error, 'gemini');

      expect(response.cached).toBe(false);
    });
  });
});
