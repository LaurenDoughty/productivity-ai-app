# Button Component Documentation

## Overview

The Button component is a reusable, accessible button with multiple variants, sizes, and states. It features gradient backgrounds, loading states, icon support, and full keyboard accessibility.

## Features

- **Three Variants**: Primary (gradient), Secondary (outline), Danger (error color)
- **Three Sizes**: Small, Medium, Large
- **Loading State**: Animated spinner with disabled interaction
- **Icon Support**: Optional icon with proper spacing
- **Accessibility**: Minimum 40px touch targets, focus indicators, keyboard navigation
- **Theme-Aware**: Automatically adapts to light/dark themes
- **Reduced Motion**: Respects user's motion preferences

## Usage

### Basic Usage

```tsx
import { Button } from '../components/Button';

function MyComponent() {
  return (
    <Button variant="primary" onClick={() => console.log('Clicked!')}>
      Click Me
    </Button>
  );
}
```

### With Icon

```tsx
import { Button } from '../components/Button';
import { Save } from 'lucide-react';

function SaveButton() {
  return (
    <Button variant="primary" icon={<Save size={18} />}>
      Save Changes
    </Button>
  );
}
```

### Loading State

```tsx
import { Button } from '../components/Button';
import { useState } from 'react';

function AsyncButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await someAsyncOperation();
    setLoading(false);
  };

  return (
    <Button variant="primary" loading={loading} onClick={handleClick}>
      {loading ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### Disabled State

```tsx
import { Button } from '../components/Button';

function DisabledButton() {
  return (
    <Button variant="primary" disabled>
      Cannot Click
    </Button>
  );
}
```

## Props

### ButtonProps

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner and disables interaction |
| `icon` | `React.ReactNode` | `undefined` | Optional icon to display before text |
| `disabled` | `boolean` | `false` | Disables the button |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `React.ReactNode` | - | Button text content |

All standard HTML button attributes are also supported (onClick, type, aria-label, etc.)

## Variants

### Primary
- Gradient background (purple/indigo in light mode, orange/yellow in dark mode)
- White text
- Elevated shadow
- Hover: Brightness increase, shadow elevation
- Use for: Primary actions, CTAs

### Secondary
- Transparent background
- Accent color border and text
- No shadow
- Hover: Filled with accent color, white text
- Use for: Secondary actions, cancel buttons

### Danger
- Error color background
- White text
- Elevated shadow
- Hover: Brightness increase, shadow elevation
- Use for: Destructive actions, delete buttons

## Sizes

### Small (`sm`)
- Min height: 32px
- Padding: 8px 24px
- Font size: 14px
- Use for: Compact UIs, inline actions

### Medium (`md`)
- Min height: 40px (default)
- Padding: 16px 32px
- Font size: 16px
- Use for: Standard buttons, forms

### Large (`lg`)
- Min height: 48px
- Padding: 24px 48px
- Font size: 18px
- Use for: Hero CTAs, prominent actions

## States

### Hover
- Color/brightness change
- Shadow elevation (primary/danger)
- Background fill (secondary)
- Transition: 150ms ease-in-out

### Active
- Brief scale animation (97%)
- Reduced shadow
- Transition: 150ms ease-out

### Focus
- Prominent outline (2px accent color)
- 2px offset for visibility
- Visible on keyboard navigation

### Disabled
- 50% opacity
- Not-allowed cursor
- No hover/active effects
- Cannot be clicked

### Loading
- Animated spinner
- Disabled interaction
- Maintains dimensions
- Text remains visible for screen readers

## Accessibility

### Keyboard Navigation
- Fully keyboard accessible
- Tab to focus
- Enter or Space to activate
- Visible focus indicators

### Screen Readers
- Semantic `<button>` element
- Supports aria-label and aria-describedby
- Loading spinner has aria-hidden
- Text content maintained during loading

### Touch Targets
- Minimum 40px height (medium/large)
- Adequate padding for comfortable tapping
- No overlapping interactive elements

### Motion
- Respects `prefers-reduced-motion`
- Animations disabled or slowed when requested
- Spinner animation duration increased

## Design Tokens

The Button component uses the following design tokens:

### Colors
- `--color-accent-primary`: Primary accent color
- `--color-accent-error`: Error/danger color
- `--gradient-primary`: Primary gradient background
- `--color-bg-primary`: Background color (secondary variant)

### Spacing
- `--spacing-1`: 8px (icon gap, small padding)
- `--spacing-2`: 16px (medium padding)
- `--spacing-3`: 24px (small horizontal padding)
- `--spacing-4`: 32px (medium horizontal padding)
- `--spacing-6`: 48px (large horizontal padding)

### Typography
- `--font-family-base`: System font stack
- `--font-size-sm`: 14px (small buttons)
- `--font-size-base`: 16px (medium buttons)
- `--font-size-lg`: 18px (large buttons)
- `--font-weight-medium`: 500

### Effects
- `--shadow-base`: Base elevation
- `--shadow-md`: Medium elevation
- `--shadow-lg`: Large elevation (hover)
- `--radius-base`: 8px border radius

### Transitions
- `--transition-fast`: 100ms (focus)
- `--transition-base`: 150ms (hover)

## Examples

### Form Submit Button

```tsx
<Button 
  type="submit" 
  variant="primary" 
  size="lg"
  loading={isSubmitting}
>
  Submit Form
</Button>
```

### Delete Confirmation

```tsx
<Button 
  variant="danger" 
  icon={<Trash2 size={18} />}
  onClick={handleDelete}
>
  Delete Item
</Button>
```

### Cancel Action

```tsx
<Button 
  variant="secondary" 
  onClick={handleCancel}
>
  Cancel
</Button>
```

### Full Width Button

```tsx
<Button 
  variant="primary" 
  style={{ width: '100%' }}
>
  Continue
</Button>
```

### Icon-Only Button

```tsx
<Button 
  variant="secondary" 
  size="sm"
  aria-label="Close dialog"
>
  ×
</Button>
```

## Best Practices

### Do's
- Use primary variant for main actions
- Use secondary for less important actions
- Use danger for destructive actions
- Provide loading states for async operations
- Include aria-labels for icon-only buttons
- Use appropriate sizes for context
- Maintain consistent button hierarchy

### Don'ts
- Don't use multiple primary buttons in close proximity
- Don't use danger variant for non-destructive actions
- Don't nest buttons or make them too small
- Don't rely solely on color to convey meaning
- Don't disable buttons without explanation
- Don't use loading state without user feedback

## Testing

The Button component includes comprehensive unit tests covering:
- All variants and sizes
- Loading and disabled states
- Icon support
- Keyboard accessibility
- Focus management
- Click handlers
- HTML attribute forwarding
- Theme awareness

Run tests with:
```bash
npm test -- Button.test.tsx
```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Related Components

- **Card**: Container component with similar styling patterns
- **Input**: Form input component with consistent design
- **ThemeToggle**: Specialized button for theme switching

## Requirements Validation

This component satisfies the following requirements from the Modern UI Redesign spec:

- **8.1**: Three variants (primary, secondary, danger)
- **8.2**: Minimum 40px height for touch targets
- **8.3**: Rounded corners (8px border radius)
- **8.4**: Hover state with color change
- **8.5**: Disabled state with reduced opacity
- **8.6**: Focus state with prominent indicator
- **8.7**: Active state with brief animation
- **8.8**: Theme-aware colors from design tokens
- **10.1**: Loading spinner with accent color
- **10.3**: Maintains dimensions during loading
