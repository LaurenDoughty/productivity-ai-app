import { useState } from 'react';
import { Input, Textarea } from '../components/Input';
import '../styles/Input.css';

/**
 * Input Component Examples
 * 
 * Demonstrates focus states, error states, and transitions
 * for the Input and Textarea components.
 */
export function InputExample() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [description, setDescription] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-4)', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Input Component Examples</h2>
      
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Basic Input with Focus State</h3>
        <Input
          label="Username"
          placeholder="Enter your username"
          helperText="Click to see the focus state with accent color border and glow"
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Input with Error State</h3>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          onBlur={(e) => validateEmail(e.target.value)}
          error={emailError}
          placeholder="Enter your email"
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Input with Pre-set Error</h3>
        <Input
          label="Password"
          type="password"
          error="Password must be at least 8 characters"
          placeholder="Enter your password"
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Textarea with Focus State</h3>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
          helperText="Focus to see the accent color border and glow effect"
          rows={4}
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Textarea with Error State</h3>
        <Textarea
          label="Comments"
          error="Comments are required"
          placeholder="Enter your comments"
          rows={4}
        />
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3>Disabled Input</h3>
        <Input
          label="Disabled Field"
          value="This field is disabled"
          disabled
        />
      </div>

      <div style={{ 
        marginTop: 'var(--spacing-6)', 
        padding: 'var(--spacing-2)', 
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-base)'
      }}>
        <h4>Implementation Details:</h4>
        <ul style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          <li><strong>Focus State:</strong> Accent color border with 3px glow shadow</li>
          <li><strong>Error State:</strong> Error color border with error message display</li>
          <li><strong>Transitions:</strong> 100ms smooth transitions (var(--transition-fast))</li>
          <li><strong>Minimum Height:</strong> 40px for inputs, 80px for textareas</li>
          <li><strong>Placeholder Opacity:</strong> 55% (within 50-60% range)</li>
          <li><strong>Theme Support:</strong> Different glow colors for light/dark themes</li>
        </ul>
      </div>
    </div>
  );
}
