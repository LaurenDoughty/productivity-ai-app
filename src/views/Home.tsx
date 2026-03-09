/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../components/Card';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Productivity Copilot</h1>
      <p>Optimize your workflow with AI-powered strategies.</p>
      
      <div className="grid-layout" style={{ marginTop: 'var(--spacing-4)' }}>
        <Card icon="🚀" iconGradient="primary">
          <h2>Features</h2>
          <ul style={{ marginLeft: 'var(--spacing-3)', marginTop: 'var(--spacing-1)' }}>
            <li>AI-powered optimization strategies</li>
            <li>Hybrid AI provider support (Gemini & Bedrock)</li>
            <li>Multi-level caching for performance</li>
            <li>Optimized for AWS Free Tier</li>
          </ul>
        </Card>

        <Card icon="⚙️" iconGradient="secondary">
          <h2>Current Configuration</h2>
          <ul style={{ marginLeft: 'var(--spacing-3)', marginTop: 'var(--spacing-1)' }}>
            <li>AI Provider: {import.meta.env.VITE_AI_PROVIDER || 'gemini'}</li>
            <li>Environment: {import.meta.env.MODE}</li>
            <li>Version: {import.meta.env.APP_VERSION || '1.0.0'}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
