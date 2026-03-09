import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ThemeProvider } from '../components/ThemeProvider';

/**
 * Navigation Component Example
 * 
 * Demonstrates the Navigation component with theme toggle.
 * The Navigation component:
 * - Displays navigation links with clear visual hierarchy
 * - Highlights the active page using accent color
 * - Positions ThemeToggle on the right side
 * - Uses theme-aware background and text colors
 * - Has a gradient top border accent
 * - Maintains height between 56-64px (60px)
 * - Includes backdrop blur effect for depth
 * - Provides hover and focus states for all links
 * - Responsive design for mobile screens
 */
export function NavigationExample() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-secondary)' }}>
          <Navigation />
          
          <div style={{ padding: 'var(--spacing-4)', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'var(--font-size-3xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-3)'
            }}>
              Navigation Component
            </h1>
            
            <div style={{ 
              padding: 'var(--spacing-3)', 
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-3)'
            }}>
              <h2 style={{ 
                fontSize: 'var(--font-size-xl)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Features
              </h2>
              <ul style={{ 
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-normal)',
                paddingLeft: 'var(--spacing-3)'
              }}>
                <li>Clear visual hierarchy with navigation links</li>
                <li>Active page highlighting with accent color</li>
                <li>Theme toggle positioned on the right</li>
                <li>Theme-aware colors (try switching themes!)</li>
                <li>Gradient top border accent</li>
                <li>60px height for comfortable touch targets</li>
                <li>Backdrop blur effect for depth</li>
                <li>Hover states with visual feedback</li>
                <li>Keyboard accessible with focus indicators</li>
                <li>Responsive design for mobile screens</li>
              </ul>
            </div>

            <div style={{ 
              padding: 'var(--spacing-3)', 
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <h2 style={{ 
                fontSize: 'var(--font-size-xl)', 
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Usage
              </h2>
              <pre style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                padding: 'var(--spacing-2)',
                borderRadius: 'var(--radius-base)',
                overflow: 'auto',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)'
              }}>
{`import { Navigation } from './components/Navigation';
import { ThemeProvider } from './components/ThemeProvider';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navigation />
        {/* Your app content */}
      </BrowserRouter>
    </ThemeProvider>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
