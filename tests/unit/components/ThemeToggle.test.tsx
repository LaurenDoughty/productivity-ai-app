import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { ThemeProvider } from '../../../src/components/ThemeProvider';
import { act } from 'react-dom/test-utils';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Rendering', () => {
    it('should render theme toggle button', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to/i });
      expect(button).toBeInTheDocument();
    });

    it('should display moon icon in light mode', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
      // Moon icon should be present (lucide-react renders as svg)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should display sun icon in dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to light mode/i });
      expect(button).toBeInTheDocument();
      // Sun icon should be present (lucide-react renders as svg)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <ThemeProvider>
          <ThemeToggle className="custom-class" />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to/i });
      expect(button).toHaveClass('custom-class');
    });

    it('should render without label by default', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to/i });
      expect(button).not.toHaveTextContent('Mode');
    });

    it('should render with label when showLabel is true', () => {
      render(
        <ThemeProvider>
          <ThemeToggle showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to/i });
      expect(button).toHaveTextContent('Dark Mode');
    });

    it('should update label text when theme changes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle showLabel={true} />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to/i });
      expect(button).toHaveTextContent('Dark Mode');

      act(() => {
        button.click();
      });

      expect(button).toHaveTextContent('Light Mode');
    });
  });

  describe('Click Interaction', () => {
    it('should toggle theme from light to dark on click', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to dark mode/i });

      act(() => {
        button.click();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });

    it('should toggle theme from dark to light on click', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to light mode/i });

      act(() => {
        button.click();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
    });

    it('should toggle theme multiple times', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');

      // Start with light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Toggle to dark
      act(() => {
        button.click();
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      // Toggle back to light
      act(() => {
        button.click();
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      // Toggle to dark again
      act(() => {
        button.click();
      });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should toggle theme on Enter key press', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to dark mode/i });

      act(() => {
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle theme on Space key press', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to dark mode/i });

      act(() => {
        fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should not toggle theme on other key presses', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /switch to dark mode/i });

      act(() => {
        fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
      });

      // Theme should remain light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should prevent default behavior on Enter key', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        fireEvent(button, event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior on Space key', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        fireEvent(button, event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have appropriate aria-label in light mode', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should have appropriate aria-label in dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should update aria-label when theme changes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

      act(() => {
        button.click();
      });

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should have title attribute for tooltip', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('should have type="button" attribute', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Focus Indicator', () => {
    it('should be focusable', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should have theme-toggle class for styling', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-toggle');
    });
  });

  describe('Icon Rendering', () => {
    it('should render icon inside theme-toggle-icon span', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      const iconSpan = button.querySelector('.theme-toggle-icon');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan?.querySelector('svg')).toBeInTheDocument();
    });

    it('should change icon when theme changes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button');
      const iconSpan = button.querySelector('.theme-toggle-icon');

      // Get initial icon
      const initialIcon = iconSpan?.innerHTML;

      act(() => {
        button.click();
      });

      // Icon should have changed
      const newIcon = iconSpan?.innerHTML;
      expect(newIcon).not.toBe(initialIcon);
    });
  });

  describe('Integration with ThemeProvider', () => {
    it('should reflect theme changes from other sources', () => {
      const TestWrapper = () => {
        return (
          <ThemeProvider>
            <ThemeToggle />
            <ThemeToggle />
          </ThemeProvider>
        );
      };

      render(<TestWrapper />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Click first button
      act(() => {
        buttons[0].click();
      });

      // Both buttons should reflect the theme change
      expect(buttons[0]).toHaveAttribute('aria-label', 'Switch to light mode');
      expect(buttons[1]).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });
});
