# Card Component

A reusable card component with enhanced icon badge support, theme-aware styling, and interactive hover states.

## Features

- **Large Icon Badge**: 120x120px icon badge with 3.5rem emoji size
- **Gradient Backgrounds**: Four gradient options (primary, secondary, warm, cool)
- **Theme-Aware**: Automatically adapts to light/dark theme
- **Interactive States**: Optional hover effects with elevation changes and icon animations
- **Consistent Styling**: Uses design tokens for spacing, shadows, and border radius

## Usage

### Basic Card

```tsx
import { Card } from '../components/Card';

function Example() {
  return (
    <Card>
      <h2>Card Title</h2>
      <p>Card content goes here</p>
    </Card>
  );
}
```

### Card with Icon Badge

```tsx
<Card icon={<span>🚀</span>} iconGradient="primary">
  <h2>Launch Strategy</h2>
  <p>Deploy your application with confidence</p>
</Card>
```

### Interactive Card

```tsx
<Card 
  icon={<span>⚡</span>} 
  iconGradient="warm"
  interactive={true}
  onClick={() => console.log('Card clicked')}
>
  <h2>Quick Action</h2>
  <p>Click to perform action</p>
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Content to display inside the card |
| `className` | `string` | `''` | Additional CSS classes to apply |
| `interactive` | `boolean` | `false` | Enable hover effects and interactive styling |
| `icon` | `React.ReactNode` | `undefined` | Icon or emoji to display in the badge |
| `iconGradient` | `'primary' \| 'secondary' \| 'warm' \| 'cool'` | `'primary'` | Gradient background for the icon badge |

## Gradient Options

- **primary**: Purple/indigo gradient (light mode), Pink/red gradient (dark mode)
- **secondary**: Teal/pink gradient (light mode), Peach gradient (dark mode)
- **warm**: Pink/red gradient (light mode), Orange/yellow gradient (dark mode)
- **cool**: Blue/cyan gradient (light mode), Purple/pink gradient (dark mode)

## Interactive Behavior

When `interactive={true}`:
- Card elevates on hover (shadow increases)
- Icon badge scales to 1.15x and rotates 5deg
- Smooth transitions (150-200ms)
- Focus indicator for keyboard navigation

## Design Tokens Used

- **Spacing**: `--spacing-2`, `--spacing-3`, `--spacing-4`
- **Shadows**: `--shadow-base`, `--shadow-lg`, `--shadow-xl`
- **Border Radius**: `--radius-md`, `--radius-2xl`
- **Colors**: Theme-aware background, border, and gradient colors
- **Transitions**: `--transition-base` (150ms)

## Accessibility

- Keyboard navigation support with focus indicators
- Theme-aware colors maintain proper contrast ratios
- Semantic HTML structure for screen readers

## Examples

### Strategy Cards

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
  <Card icon={<span>🎯</span>} iconGradient="primary">
    <h3>Focus Strategy</h3>
    <p>Concentrate on high-impact tasks</p>
  </Card>
  
  <Card icon={<span>⚡</span>} iconGradient="warm">
    <h3>Quick Wins</h3>
    <p>Achieve fast results</p>
  </Card>
  
  <Card icon={<span>🌊</span>} iconGradient="cool">
    <h3>Flow State</h3>
    <p>Enter deep work mode</p>
  </Card>
</div>
```

### Interactive Dashboard Cards

```tsx
<Card 
  icon={<span>📊</span>} 
  iconGradient="secondary"
  interactive={true}
  className="dashboard-card"
>
  <h3>Analytics</h3>
  <p>View your productivity metrics</p>
  <button>View Details →</button>
</Card>
```
