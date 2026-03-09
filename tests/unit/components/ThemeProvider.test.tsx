import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../../src/components/ThemeProvider';
import { act } from 'react-dom/test-utils';

// Test component that uses the theme hook
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Theme Initialization', () => {
    it('should load theme from localStorage when available', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should default to light theme when localStorage is empty and no system preference', () => {
      // Mock matchMedia to return false for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should use system preference when localStorage is empty', () => {
      // Mock matchMedia to return true for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should use defaultTheme prop when provided and no stored preference', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorage.setItem('theme', 'invalid-theme');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fall back to system preference or default
      const theme = screen.getByTestId('current-theme').textContent;
      expect(['light', 'dark']).toContain(theme);
    });

    it('should handle localStorage access failures gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage access denied');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to access localStorage:',
        expect.any(Error)
      );

      // Should still render with fallback theme
      const theme = screen.getByTestId('current-theme').textContent;
      expect(['light', 'dark']).toContain(theme);

      // Restore original implementation
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });

    it('should handle matchMedia failures gracefully', () => {
      // Mock matchMedia to throw an error
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn(() => {
          throw new Error('matchMedia not supported');
        }),
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to detect system preference:',
        expect.any(Error)
      );

      // Should fall back to default theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme to localStorage when toggled', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-button');

      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        const storedTheme = localStorage.getItem('theme');
        expect(storedTheme).toBe('dark');
      });
    });

    it('should persist theme to localStorage when set directly', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByTestId('set-dark');

      act(() => {
        setDarkButton.click();
      });

      await waitFor(() => {
        const storedTheme = localStorage.getItem('theme');
        expect(storedTheme).toBe('dark');
      });
    });

    it('should use custom storageKey when provided', async () => {
      render(
        <ThemeProvider storageKey="custom-theme-key">
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-button');

      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        const storedTheme = localStorage.getItem('custom-theme-key');
        expect(storedTheme).toBe('dark');
      });
    });

    it('should handle localStorage write failures gracefully', async () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage write denied');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-button');

      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Failed to save theme to localStorage:',
          expect.any(Error)
        );
      });

      // Theme should still change in memory
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from light to dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      const toggleButton = screen.getByTestId('toggle-button');
      act(() => {
        toggleButton.click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      const toggleButton = screen.getByTestId('toggle-button');
      act(() => {
        toggleButton.click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should toggle multiple times correctly', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByTestId('toggle-button');

      // Start with light
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Toggle to dark
      act(() => {
        toggleButton.click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Toggle back to light
      act(() => {
        toggleButton.click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Toggle to dark again
      act(() => {
        toggleButton.click();
      });
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  describe('Theme Setting', () => {
    it('should set theme to light', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      const setLightButton = screen.getByTestId('set-light');
      act(() => {
        setLightButton.click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should set theme to dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      const setDarkButton = screen.getByTestId('set-dark');
      act(() => {
        setDarkButton.click();
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Document Attribute', () => {
    it('should apply data-theme attribute to document root', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update data-theme attribute when theme changes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      const toggleButton = screen.getByTestId('toggle-button');
      act(() => {
        toggleButton.click();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should provide theme context value', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should render without errors and provide theme value
      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
      expect(screen.getByTestId('set-light')).toBeInTheDocument();
      expect(screen.getByTestId('set-dark')).toBeInTheDocument();
    });
  });
});
