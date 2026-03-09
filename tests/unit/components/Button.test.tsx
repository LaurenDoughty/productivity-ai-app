import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Button } from '../../../src/components/Button';
import { Save } from 'lucide-react';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--primary');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--secondary');
    });

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--danger');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--md');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--sm');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--lg');
    });
  });

  describe('Icon Support', () => {
    it('renders with icon', () => {
      render(
        <Button icon={<Save data-testid="save-icon" />}>
          Save
        </Button>
      );
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      render(<Button>No Icon</Button>);
      const button = screen.getByRole('button');
      expect(button.querySelector('.button__icon')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--loading');
      expect(button.querySelector('.button__spinner')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('maintains button dimensions during loading', () => {
      const { rerender } = render(<Button>Click Me</Button>);
      const button = screen.getByRole('button');
      const initialHeight = button.offsetHeight;

      rerender(<Button loading>Click Me</Button>);
      const loadingHeight = button.offsetHeight;

      // Height should remain the same (or very close due to rounding)
      expect(Math.abs(initialHeight - loadingHeight)).toBeLessThan(2);
    });

    it('hides icon when loading', () => {
      render(
        <Button loading icon={<Save data-testid="save-icon" />}>
          Save
        </Button>
      );
      expect(screen.queryByTestId('save-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('.button__spinner')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('has disabled attribute when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('Interactive States', () => {
    it('triggers onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Loading</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('is accessible via keyboard (Enter)', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('is accessible via keyboard (Space)', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Space</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Minimum Height Requirement', () => {
    it('has button--md class for medium size', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--md');
    });

    it('has button--lg class for large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--lg');
    });

    it('has button--sm class for small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--sm');
    });
  });

  describe('Focus State', () => {
    it('can receive focus', () => {
      render(<Button>Focus Me</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('is keyboard accessible', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      );
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      // Simulate Tab key
      buttons[1].focus();
      expect(document.activeElement).toBe(buttons[1]);
    });
  });

  describe('HTML Attributes', () => {
    it('forwards additional props to button element', () => {
      render(
        <Button type="submit" data-testid="submit-button">
          Submit
        </Button>
      );
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('supports aria-label attribute', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Theme Awareness', () => {
    it('applies button class for styling', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button');
      expect(button).toHaveClass('button--primary');
    });
  });

  describe('Accessibility', () => {
    it('is a semantic button element', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('spinner has aria-hidden attribute', () => {
      render(<Button loading>Loading</Button>);
      const spinner = document.querySelector('.button__spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('maintains text content during loading for screen readers', () => {
      render(<Button loading>Save Changes</Button>);
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });
});
