import { useState } from 'react';
import { Button } from '../components/Button';
import { ThemeProvider } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';
import { Save, Trash2, Download, ArrowRight } from 'lucide-react';
import '../styles/tokens.css';
import '../styles/themes.css';

/**
 * Button Component Example
 * 
 * Demonstrates all button variants, sizes, states, and features:
 * - Three variants: primary, secondary, danger
 * - Three sizes: sm, md, lg
 * - Loading state with spinner
 * - Icon support
 * - Disabled state
 * - Hover, focus, and active states
 */

export function ButtonExample() {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ThemeProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: 'var(--spacing-4)',
        fontFamily: 'var(--font-family-base)',
      }}>
        {/* Header with Theme Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-6)',
        }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Button Component Examples
          </h1>
          <ThemeToggle />
        </div>

        {/* Variants Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Button Variants
          </h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </section>

        {/* Sizes Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Button Sizes
          </h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="sm">Small Button</Button>
            <Button variant="primary" size="md">Medium Button</Button>
            <Button variant="primary" size="lg">Large Button</Button>
          </div>
        </section>

        {/* With Icons Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Buttons with Icons
          </h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<Save size={18} />}>
              Save Changes
            </Button>
            <Button variant="secondary" icon={<Download size={18} />}>
              Download
            </Button>
            <Button variant="danger" icon={<Trash2 size={18} />}>
              Delete
            </Button>
            <Button variant="primary" icon={<ArrowRight size={18} />}>
              Continue
            </Button>
          </div>
        </section>

        {/* Loading State Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Loading State
          </h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="primary" loading={loading} onClick={handleLoadingClick}>
              {loading ? 'Processing...' : 'Click to Load'}
            </Button>
            <Button variant="secondary" loading>
              Loading Secondary
            </Button>
            <Button variant="danger" loading>
              Loading Danger
            </Button>
          </div>
        </section>

        {/* Disabled State Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Disabled State
          </h2>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
            <Button variant="danger" disabled>
              Disabled Danger
            </Button>
          </div>
        </section>

        {/* Interactive States Section */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Interactive States
          </h2>
          <p style={{ marginBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)' }}>
            Hover over buttons to see hover effects. Click to see active state animation. 
            Use Tab key to navigate and see focus indicators.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            <Button variant="primary">Hover Me</Button>
            <Button variant="secondary">Click Me</Button>
            <Button variant="danger">Focus Me (Tab)</Button>
          </div>
        </section>

        {/* Full Width Example */}
        <section style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-3)' }}>
            Full Width Button
          </h2>
          <Button 
            variant="primary" 
            icon={<ArrowRight size={18} />}
            style={{ width: '100%' }}
          >
            Full Width Primary Button
          </Button>
        </section>

        {/* Accessibility Notes */}
        <section style={{
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
        }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-2)' }}>
            Accessibility Features
          </h3>
          <ul style={{ 
            listStyle: 'disc',
            paddingLeft: 'var(--spacing-3)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-normal)',
          }}>
            <li>Minimum 40px height for comfortable touch targets</li>
            <li>Prominent focus indicators for keyboard navigation</li>
            <li>Disabled state with reduced opacity and not-allowed cursor</li>
            <li>Loading state disables interaction and shows spinner</li>
            <li>Smooth transitions respect prefers-reduced-motion</li>
            <li>Theme-aware colors maintain proper contrast ratios</li>
            <li>Semantic HTML button element with proper attributes</li>
          </ul>
        </section>
      </div>
    </ThemeProvider>
  );
}

export default ButtonExample;
