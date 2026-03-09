import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { App } from '../../src/App';
import { ThemeProvider } from '../../src/components/ThemeProvider';

describe('App with ThemeProvider Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset data-theme attribute
    document.documentElement.removeAttribute('data-theme');
  });

  describe('ThemeProvider Integration', () => {
    it('renders App wrapped in ThemeProvider', () => {
      const { container } = render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      expect(container).toBeInTheDocument();
    });

    it('applies data-theme attribute to document root', () => {
      render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      // ThemeProvider should apply data-theme attribute
      const themeAttr = document.documentElement.getAttribute('data-theme');
      expect(themeAttr).toBeTruthy();
      expect(['light', 'dark']).toContain(themeAttr);
    });

    it('initializes with light theme by default when no preference exists', () => {
      // Mock matchMedia to return false for dark mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });

      render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists theme to localStorage', () => {
      render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      // Check that theme was saved to localStorage
      const savedTheme = localStorage.getItem('theme');
      expect(savedTheme).toBeTruthy();
      expect(['light', 'dark']).toContain(savedTheme);
    });

    it('loads theme from localStorage on initialization', () => {
      // Set a theme in localStorage before rendering
      localStorage.setItem('theme', 'dark');
      
      render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('App Structure', () => {
    it('renders navigation', () => {
      const { container } = render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('renders main content area', () => {
      const { container } = render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('renders footer', () => {
      const { container } = render(
        <ThemeProvider>
          <App />
        </ThemeProvider>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });
});
