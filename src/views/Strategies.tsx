/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../components/Card';

const Strategies: React.FC = () => {
  const strategies = [
    {
      title: 'Time Blocking',
      description: 'Allocate specific time blocks for different tasks to improve focus.',
      icon: '⏰',
      gradient: 'primary' as const,
    },
    {
      title: 'Pomodoro Technique',
      description: 'Work in 25-minute focused sessions with short breaks.',
      icon: '🍅',
      gradient: 'warm' as const,
    },
    {
      title: 'Eisenhower Matrix',
      description: 'Prioritize tasks based on urgency and importance.',
      icon: '📊',
      gradient: 'cool' as const,
    },
    {
      title: 'Getting Things Done (GTD)',
      description: 'Capture, clarify, organize, reflect, and engage with your tasks.',
      icon: '✅',
      gradient: 'secondary' as const,
    },
  ];

  return (
    <div>
      <h1>Productivity Strategies</h1>
      <p>Explore proven productivity strategies to optimize your workflow.</p>

      <div className="grid-layout" style={{ marginTop: 'var(--spacing-4)' }}>
        {strategies.map((strategy, index) => (
          <Card
            key={index}
            icon={strategy.icon}
            iconGradient={strategy.gradient}
          >
            <h3 style={{ marginBottom: 'var(--spacing-1)' }}>{strategy.title}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {strategy.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Strategies;
