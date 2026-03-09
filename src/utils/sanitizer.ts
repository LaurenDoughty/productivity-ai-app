/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  // Remove dangerous tags and attributes
  let sanitized = input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove svg with onload
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  return sanitized;
}

/**
 * Sanitize prompt input
 */
export function sanitizePrompt(input: string, maxLength?: number): string {
  if (!input) return '';
  
  // Remove potentially dangerous characters and tags
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();

  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize URL parameters
 */
export function sanitizeURL(input: string): string {
  try {
    const url = new URL(input);
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Validate environment variables
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = ['VITE_AI_PROVIDER'];
  const missing: string[] = [];

  for (const key of required) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  // Check provider-specific variables
  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
  if (provider === 'gemini' && !import.meta.env.VITE_GEMINI_API_KEY) {
    missing.push('VITE_GEMINI_API_KEY');
  } else if (provider === 'bedrock' && !import.meta.env.AWS_REGION) {
    missing.push('AWS_REGION');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Legacy class-based API for backward compatibility
 */
export class Sanitizer {
  static sanitizeHTML = sanitizeHTML;
  static sanitizePrompt = sanitizePrompt;
  static sanitizeURL = sanitizeURL;
  static validateEnvironmentVariables = validateEnvironmentVariables;
}
