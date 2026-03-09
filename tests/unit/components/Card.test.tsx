/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../../../src/components/Card';

describe('Card Component', () => {
  it('should render card with children', () => {
    render(
      <Card>
        <h2>Test Title</h2>
        <p>Test content</p>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render card with icon badge', () => {
    render(
      <Card icon={<span data-testid="test-icon">🚀</span>}>
        <p>Content</p>
      </Card>
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('should apply primary gradient to icon badge by default', () => {
    const { container } = render(
      <Card icon={<span>🎯</span>}>
        <p>Content</p>
      </Card>
    );

    const iconBadge = container.querySelector('.card__icon-badge');
    expect(iconBadge).toHaveClass('card__icon-badge--primary');
  });

  it('should apply secondary gradient when specified', () => {
    const { container } = render(
      <Card icon={<span>🎯</span>} iconGradient="secondary">
        <p>Content</p>
      </Card>
    );

    const iconBadge = container.querySelector('.card__icon-badge');
    expect(iconBadge).toHaveClass('card__icon-badge--secondary');
  });

  it('should apply warm gradient when specified', () => {
    const { container } = render(
      <Card icon={<span>🎯</span>} iconGradient="warm">
        <p>Content</p>
      </Card>
    );

    const iconBadge = container.querySelector('.card__icon-badge');
    expect(iconBadge).toHaveClass('card__icon-badge--warm');
  });

  it('should apply cool gradient when specified', () => {
    const { container } = render(
      <Card icon={<span>🎯</span>} iconGradient="cool">
        <p>Content</p>
      </Card>
    );

    const iconBadge = container.querySelector('.card__icon-badge');
    expect(iconBadge).toHaveClass('card__icon-badge--cool');
  });

  it('should not render icon badge when icon prop is not provided', () => {
    const { container } = render(
      <Card>
        <p>Content without icon</p>
      </Card>
    );

    const iconBadge = container.querySelector('.card__icon-badge');
    expect(iconBadge).not.toBeInTheDocument();
  });

  it('should apply interactive class when interactive prop is true', () => {
    const { container } = render(
      <Card interactive={true}>
        <p>Interactive card</p>
      </Card>
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('card--interactive');
  });

  it('should not apply interactive class when interactive prop is false', () => {
    const { container } = render(
      <Card interactive={false}>
        <p>Non-interactive card</p>
      </Card>
    );

    const card = container.querySelector('.card');
    expect(card).not.toHaveClass('card--interactive');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('custom-class');
  });

  it('should render card with all props combined', () => {
    const { container } = render(
      <Card
        icon={<span data-testid="combined-icon">⚡</span>}
        iconGradient="warm"
        interactive={true}
        className="test-card"
      >
        <h3>Combined Props Test</h3>
        <p>Testing all props together</p>
      </Card>
    );

    const card = container.querySelector('.card');
    const iconBadge = container.querySelector('.card__icon-badge');

    expect(card).toHaveClass('card--interactive');
    expect(card).toHaveClass('test-card');
    expect(iconBadge).toHaveClass('card__icon-badge--warm');
    expect(screen.getByTestId('combined-icon')).toBeInTheDocument();
    expect(screen.getByText('Combined Props Test')).toBeInTheDocument();
  });
});
