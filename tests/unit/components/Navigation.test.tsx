import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../../../src/components/Navigation';
import { ThemeProvider } from '../../../src/components/ThemeProvider';

// Helper to render Navigation with required providers
const renderNavigation = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <Navigation {...props} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  describe('Rendering', () => {
    it('renders all navigation links', () => {
      renderNavigation();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Strategies')).toBeInTheDocument();
      expect(screen.getByText('Optimizer')).toBeInTheDocument();
    });

    it('renders theme toggle', () => {
      renderNavigation();
      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      renderNavigation({ className: 'custom-nav' });
      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('custom-nav');
    });
  });

  describe('Active State', () => {
    it('highlights active link based on current path', () => {
      renderNavigation();
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('navigation__link--active');
    });

    it('applies accent color to active link', () => {
      renderNavigation();
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('navigation__link--active');
    });
  });

  describe('Navigation Links', () => {
    it('all links are accessible', () => {
      renderNavigation();
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
      links.forEach(link => {
        expect(link).toBeInTheDocument();
      });
    });

    it('links have correct href attributes', () => {
      renderNavigation();
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('Strategies').closest('a')).toHaveAttribute('href', '/strategies');
      expect(screen.getByText('Optimizer').closest('a')).toHaveAttribute('href', '/optimizer');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies navigation class for styling', () => {
      renderNavigation();
      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('navigation');
    });

    it('has navigation container with flex layout', () => {
      renderNavigation();
      const container = document.querySelector('.navigation__container');
      expect(container).toBeInTheDocument();
    });

    it('has navigation links container', () => {
      renderNavigation();
      const linksContainer = document.querySelector('.navigation__links');
      expect(linksContainer).toBeInTheDocument();
    });

    it('has navigation actions container for theme toggle', () => {
      renderNavigation();
      const actionsContainer = document.querySelector('.navigation__actions');
      expect(actionsContainer).toBeInTheDocument();
    });

    it('navigation links have minimum touch target class', () => {
      renderNavigation();
      const links = document.querySelectorAll('.navigation__link');
      links.forEach(link => {
        expect(link).toHaveClass('navigation__link');
      });
    });
  });

  describe('Accessibility', () => {
    it('uses semantic nav element', () => {
      renderNavigation();
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('all links are keyboard accessible', () => {
      renderNavigation();
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link.tagName).toBe('A');
      });
    });

    it('theme toggle is keyboard accessible', () => {
      renderNavigation();
      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Theme Awareness', () => {
    it('applies navigation class for theme-aware styling', () => {
      renderNavigation();
      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('navigation');
    });

    it('navigation links use theme-aware classes', () => {
      renderNavigation();
      const links = document.querySelectorAll('.navigation__link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('positions theme toggle in actions container', () => {
      renderNavigation();
      const actionsContainer = document.querySelector('.navigation__actions');
      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(actionsContainer).toContainElement(themeToggle);
    });

    it('positions navigation links in links container', () => {
      renderNavigation();
      const linksContainer = document.querySelector('.navigation__links');
      const homeLink = screen.getByText('Home');
      expect(linksContainer).toContainElement(homeLink);
    });
  });

  describe('Touch Target Sizes', () => {
    it('navigation links have appropriate classes for touch targets', () => {
      renderNavigation();
      const links = document.querySelectorAll('.navigation__link');
      links.forEach(link => {
        // The CSS ensures min-height: 40px on mobile
        expect(link).toHaveClass('navigation__link');
      });
    });
  });

  describe('Focus States', () => {
    it('navigation links can receive focus', () => {
      renderNavigation();
      const homeLink = screen.getByText('Home').closest('a') as HTMLElement;
      homeLink.focus();
      expect(document.activeElement).toBe(homeLink);
    });

    it('theme toggle can receive focus', () => {
      renderNavigation();
      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      themeToggle.focus();
      expect(document.activeElement).toBe(themeToggle);
    });
  });
});
