/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Card Component Usage Examples
 * 
 * This file demonstrates various ways to use the Card component.
 * Import this component in your views to see the Card component in action.
 */

import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const CardExample: React.FC = () => {
  return (
    <div style={{ padding: 'var(--spacing-4)' }}>
      <h1 style={{ marginBottom: 'var(--spacing-4)' }}>Card Component Examples</h1>

      {/* Basic Cards */}
      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Basic Cards</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-3)' 
        }}>
          <Card>
            <h3>Simple Card</h3>
            <p>A basic card without an icon badge.</p>
          </Card>

          <Card icon={<span>🚀</span>}>
            <h3>Card with Icon</h3>
            <p>A card featuring a large icon badge at the top.</p>
          </Card>

          <Card icon={<span>⚡</span>} iconGradient="warm">
            <h3>Warm Gradient</h3>
            <p>Using the warm gradient for the icon badge.</p>
          </Card>
        </div>
      </section>

      {/* Gradient Variants */}
      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Gradient Variants</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--spacing-3)' 
        }}>
          <Card icon={<span>🎯</span>} iconGradient="primary">
            <h3>Primary</h3>
            <p>Purple/indigo gradient in light mode</p>
          </Card>

          <Card icon={<span>🌟</span>} iconGradient="secondary">
            <h3>Secondary</h3>
            <p>Teal/pink gradient in light mode</p>
          </Card>

          <Card icon={<span>🔥</span>} iconGradient="warm">
            <h3>Warm</h3>
            <p>Pink/red gradient in light mode</p>
          </Card>

          <Card icon={<span>🌊</span>} iconGradient="cool">
            <h3>Cool</h3>
            <p>Blue/cyan gradient in light mode</p>
          </Card>
        </div>
      </section>

      {/* Interactive Cards */}
      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Interactive Cards</h2>
        <p style={{ marginBottom: 'var(--spacing-2)', color: '#666' }}>
          Hover over these cards to see the elevation and icon animation effects.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-3)' 
        }}>
          <Card 
            icon={<span>📊</span>} 
            iconGradient="primary"
            interactive={true}
          >
            <h3>Analytics</h3>
            <p>View your productivity metrics and insights.</p>
            <Button variant="primary" style={{ marginTop: 'var(--spacing-2)' }}>
              View Details →
            </Button>
          </Card>

          <Card 
            icon={<span>⚙️</span>} 
            iconGradient="cool"
            interactive={true}
          >
            <h3>Settings</h3>
            <p>Configure your preferences and options.</p>
            <Button variant="primary" style={{ marginTop: 'var(--spacing-2)' }}>
              Configure →
            </Button>
          </Card>

          <Card 
            icon={<span>🎨</span>} 
            iconGradient="warm"
            interactive={true}
          >
            <h3>Customize</h3>
            <p>Personalize your workspace and theme.</p>
            <Button variant="primary" style={{ marginTop: 'var(--spacing-2)' }}>
              Customize →
            </Button>
          </Card>
        </div>
      </section>

      {/* Strategy Cards Example */}
      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Strategy Cards</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--spacing-3)' 
        }}>
          <Card icon={<span>🎯</span>} iconGradient="primary">
            <h3>Focus Strategy</h3>
            <p>Concentrate on high-impact tasks that drive results.</p>
            <ul style={{ marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-3)', fontSize: '0.9rem' }}>
              <li>Eliminate distractions</li>
              <li>Time blocking</li>
              <li>Deep work sessions</li>
            </ul>
          </Card>

          <Card icon={<span>⚡</span>} iconGradient="warm">
            <h3>Quick Wins</h3>
            <p>Achieve fast results with minimal effort.</p>
            <ul style={{ marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-3)', fontSize: '0.9rem' }}>
              <li>Low-hanging fruit</li>
              <li>Quick tasks first</li>
              <li>Momentum building</li>
            </ul>
          </Card>

          <Card icon={<span>🌊</span>} iconGradient="cool">
            <h3>Flow State</h3>
            <p>Enter deep work mode for maximum productivity.</p>
            <ul style={{ marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-3)', fontSize: '0.9rem' }}>
              <li>Uninterrupted time</li>
              <li>Optimal challenge</li>
              <li>Clear goals</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CardExample;
