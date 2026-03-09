/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from 'react';
// import { useDebounce } from '../hooks/useDebounce';
import { useAIProvider } from '../hooks/useAIProvider';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Sanitizer } from '../utils/sanitizer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Textarea } from '../components/Input';

// Lazy load ReactMarkdown
const ReactMarkdown = lazy(() => import('react-markdown'));

const Optimizer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  // const debouncedPrompt = useDebounce(prompt, 500);
  const { generateOptimization, loading, error, response, cancel } = useAIProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      return;
    }

    // Sanitize inputs
    const sanitizedPrompt = Sanitizer.sanitizePrompt(prompt);
    const sanitizedContext = Sanitizer.sanitizePrompt(context);

    try {
      await generateOptimization({
        prompt: sanitizedPrompt,
        context: sanitizedContext,
      });
    } catch (err) {
      // Error is handled by the hook
      console.error('Optimization failed:', err);
    }
  };

  return (
    <div>
      <h1>AI Optimizer</h1>
      <p>Get AI-powered optimization suggestions for your workflow.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-4)' }}>
        <Textarea
          id="context"
          label="Context (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Provide context about your situation..."
        />

        <Textarea
          id="prompt"
          label="What would you like to optimize? *"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., How can I improve my morning routine?"
          required
        />

        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            variant="primary"
            loading={loading}
          >
            Generate Optimization
          </Button>

          {loading && (
            <Button
              type="button"
              onClick={cancel}
              variant="danger"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {loading && (
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <LoadingSpinner message="Generating optimization..." />
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 'var(--spacing-4)',
            padding: 'var(--spacing-2)',
            backgroundColor: '#f8d7da',
            border: '0.0625rem solid #f5c6cb',
            borderRadius: '0.25rem',
            color: '#721c24',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && !loading && !error && (
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <Card icon="✨" iconGradient="primary">
            <div style={{ marginBottom: 'var(--spacing-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <strong>Provider:</strong> {response.provider}
              {response.cached && response.cacheType === 'exact' && (
                <span style={{ color: 'var(--color-accent-success)', fontWeight: 'bold' }}> ✓ from cache</span>
              )}
              {response.cached && response.cacheType === 'fuzzy' && (
                <span style={{ color: 'var(--color-accent-info)', fontWeight: 'bold' }}>
                  {' '}
                  ≈ similar query ({Math.round((response.similarity || 0) * 100)}% match)
                </span>
              )}
              {' | '}
              <strong>Latency:</strong> {response.latencyMs}ms
              {' | '}
              <strong>Tokens:</strong> {response.tokensUsed.input} in / {response.tokensUsed.output} out
              {response.cost && (
                <>
                  {' | '}
                  <strong>Cost:</strong> ${response.cost.toFixed(6)}
                </>
              )}
            </div>

            <Suspense fallback={<LoadingSpinner message="Loading result..." />}>
              <ReactMarkdown>{response.content}</ReactMarkdown>
            </Suspense>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Optimizer;
