/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizePrompt } from '../../../src/utils/sanitizer';

describe('Sanitizer', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<script');
      expect(output).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('alert');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('javascript:');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<iframe');
    });

    it('should remove object and embed tags', () => {
      const input = '<object data="evil.swf"></object><embed src="evil.swf">';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<object');
      expect(output).not.toContain('<embed');
    });

    it('should preserve safe HTML', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const output = sanitizeHTML(input);
      expect(output).toContain('Hello');
      expect(output).toContain('World');
    });

    it('should handle empty input', () => {
      const output = sanitizeHTML('');
      expect(output).toBe('');
    });

    it('should handle plain text', () => {
      const input = 'Just plain text';
      const output = sanitizeHTML(input);
      expect(output).toBe(input);
    });

    it('should remove multiple XSS attempts', () => {
      const input =
        '<script>alert(1)</script><img src=x onerror=alert(2)><svg onload=alert(3)>';
      const output = sanitizeHTML(input);
      expect(output).not.toContain('<script');
      expect(output).not.toContain('onerror');
      expect(output).not.toContain('onload');
      expect(output).not.toContain('alert');
    });
  });

  describe('sanitizePrompt', () => {
    it('should preserve alphanumeric characters', () => {
      const input = 'Hello World 123';
      const output = sanitizePrompt(input);
      expect(output).toContain('Hello');
      expect(output).toContain('World');
      expect(output).toContain('123');
    });

    it('should preserve common punctuation', () => {
      const input = 'Hello, world! How are you?';
      const output = sanitizePrompt(input);
      expect(output).toContain(',');
      expect(output).toContain('!');
      expect(output).toContain('?');
    });

    it('should remove potentially dangerous characters', () => {
      const input = 'Hello<script>alert("XSS")</script>';
      const output = sanitizePrompt(input);
      expect(output).not.toContain('<script');
      expect(output).not.toContain('alert');
    });

    it('should handle empty input', () => {
      const output = sanitizePrompt('');
      expect(output).toBe('');
    });

    it('should preserve newlines and spaces', () => {
      const input = 'Line 1\nLine 2\n\nLine 3';
      const output = sanitizePrompt(input);
      expect(output).toContain('\n');
    });

    it('should handle unicode characters', () => {
      const input = 'Hello 世界 🌍';
      const output = sanitizePrompt(input);
      expect(output).toContain('Hello');
      // Unicode handling depends on implementation
    });

    it('should limit length if specified', () => {
      const input = 'a'.repeat(10000);
      const output = sanitizePrompt(input, 1000);
      expect(output.length).toBeLessThanOrEqual(1000);
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const output = sanitizePrompt(input);
      expect(output).toBe('Hello World');
    });
  });
});
