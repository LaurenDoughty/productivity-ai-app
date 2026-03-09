# Navigation Component

A modern, theme-aware navigation bar component with integrated theme toggle, gradient accent border, and responsive design.

## Features

- **Clear Visual Hierarchy**: Navigation links are displayed with consistent spacing and typography
- **Active State Highlighting**: Current page is highlighted with accent color and gradient underline
- **Theme Toggle Integration**: ThemeToggle component positioned on the right side
- **Theme-Aware Styling**: Automatically adapts colors based on light/dark theme
- **Gradient Border Accent**: Top border uses gradient from design tokens
- **Optimal Height**: Maintains 60px height (within 56-64px requirement) for comfortable touch targets
- **Backdrop Blur Effect**: Creates depth with blur effect on background
- **Hover States**: Visual feedback on hover with smooth transitions
- **Keyboard Accessible**: Full keyboard navigation support with visible focus indicators
- **Responsive Design**: Adapts to mobile screens with touch-friendly targets

## Usage

### Basic Usage

```tsx
import { Navigation } from './components/Navigation';
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
}
```

### With Custom Class

```tsx
<Navigation className="custom-nav" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Optional CSS class for custom styling |

## Navigation Items

The component automatically detects the current route using `useLocation()` from React Router and highlights the active link. The navigation items are:

- **Home** (`/`)
- **Strategies** (`/strategies`)
- **Optimizer** (`/optimizer`)

## Styling

The Navigation component uses CSS custom properties from the design token system:

### Colors
- `--color-bg-primary`: Navigation background
- `--color-text-primary`: Active and hover text color
- `--color-text-secondary`: Default link color
- `--color-accent-primary`: Active link color and focus outline
- `--gradient-primary`: Border gradient and active link underline

### Spacing
- `--spacing-1`: Link gap and padding
- `--spacing-2`: Container padding and actions gap

### Typography
- `--font-size-base`: Link text size (desktop)
- `--font-size-sm`: Link text size (mobile)
- `--font-weight-medium`: Default link weight
- `--font-weight-bold`: Active link weight

### Effects
- `--shadow-sm`: Subtle shadow for depth
- `--transition-base`: Hover and focus transitions
- `backdrop-filter: blur(10px)`: Background blur effect

## Accessibility

The Navigation component follows accessibility best practices:

- **Keyboard Navigation**: All links are keyboard accessible via Tab key
- **Focus Indicators**: Visible focus outline using accent color
- **Semantic HTML**: Uses `<nav>` element for proper structure
- **Touch Targets**: Minimum 40px touch target size on mobile
- **ARIA Support**: ThemeToggle includes proper ARIA labels

## Responsive Behavior

### Desktop (> 768px)
- Full spacing between links
- Standard font size
- Comfortable padding

### Mobile (≤ 768px)
- Reduced spacing to fit more links
- Smaller font size
- Minimum 40px touch targets maintained
- Reduced container padding

## Requirements Validation

This component satisfies the following requirements:

- **6.1**: Displays navigation links with clear visual hierarchy ✓
- **6.2**: Highlights active page using accent color ✓
- **6.3**: Displays hover state with visual feedback ✓
- **6.4**: Includes ThemeToggle positioned on the right ✓
- **6.5**: Uses theme-appropriate background and text colors ✓
- **6.6**: Maintains height of 60px (within 56-64px range) ✓
- **6.7**: Displays focus indicator for keyboard navigation ✓

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

Note: `backdrop-filter` is widely supported but may degrade gracefully in older browsers.

## Example

See `src/examples/NavigationExample.tsx` for a complete working example with theme switching demonstration.
