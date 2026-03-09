# Implementation Plan: Modern UI Redesign

## Overview

This plan implements a modern design system with light/dark theme support, vibrant gradients, enhanced icon badges, and comprehensive accessibility features. The implementation follows a phased approach: foundation (design tokens and theme system), component refactoring, layout and responsive design, accessibility enhancements, and comprehensive testing.

## Tasks

- [x] 1. Create design token system and CSS foundation
  - [x] 1.1 Create CSS custom properties for design tokens
    - Create `src/styles/tokens.css` with spacing, typography, shadows, and radii tokens
    - Define base spacing unit (8px) and spacing scale (1x, 2x, 3x, 4x, 6x, 8x)
    - Define typography scale with font sizes, line heights, and weights
    - Define shadow scale for elevation and depth
    - Define border radius scale for consistent rounded corners
    - _Requirements: 5.1, 5.2, 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 1.2 Write property test for spacing system multiples
    - **Property 8: Spacing System Multiples**
    - **Validates: Requirements 5.2**
  
  - [x] 1.3 Create theme color definitions
    - Create `src/styles/themes.css` with light and dark theme color palettes
    - Define vibrant gradient-based colors (purple/indigo for light, orange/yellow for dark)
    - Define background colors (primary, secondary, tertiary) for both themes
    - Define text colors (primary, secondary, tertiary) for both themes
    - Define accent colors (primary, success, warning, error, info) for both themes
    - Define gradient definitions (primary, secondary, warm, cool, subtle) for both themes
    - Use `[data-theme="light"]` and `[data-theme="dark"]` attribute selectors
    - _Requirements: 3.1, 3.2, 3.6, 3.7_
  
  - [ ]* 1.4 Write property test for color contrast compliance
    - **Property 5: Color Contrast Compliance**
    - **Validates: Requirements 3.3, 3.4, 3.5**
  
  - [ ]* 1.5 Write property test for typography constraints
    - **Property 7: Typography Constraints**
    - **Validates: Requirements 4.5, 4.6, 4.7**
  
  - [x] 1.6 Create component and utility styles
    - Create `src/styles/components.css` for reusable component base styles
    - Create `src/styles/utilities.css` for utility classes
    - Define transition timing variables (200-300ms for theme, 150-200ms for hover, 100-150ms for focus)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 2. Implement theme system and provider
  - [x] 2.1 Create ThemeProvider context and hook
    - Create `src/components/ThemeProvider.tsx` with React Context
    - Implement `ThemeContextValue` interface with theme state and toggle function
    - Detect system preference using `prefers-color-scheme` media query
    - Initialize theme from localStorage or system preference on mount
    - Apply `data-theme` attribute to document.documentElement
    - Provide `useTheme()` custom hook for accessing theme context
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 2.2 Write property test for theme initialization from storage
    - **Property 1: Theme Initialization from Storage**
    - **Validates: Requirements 1.2**
  
  - [x] 2.3 Implement theme persistence to localStorage
    - Save theme preference to localStorage on theme change
    - Use configurable storage key (default: 'theme')
    - Handle localStorage access failures gracefully
    - _Requirements: 1.4_
  
  - [ ]* 2.4 Write property test for theme toggle persistence
    - **Property 2: Theme Toggle Persistence**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.5 Write unit tests for theme system edge cases
    - Test empty localStorage defaults to system preference
    - Test invalid theme values default to 'light'
    - Test localStorage access failures
    - Test system preference detection failures
    - _Requirements: 1.2, 1.3_

- [x] 3. Create ThemeToggle component
  - [x] 3.1 Implement ThemeToggle component with icon and animation
    - Create `src/components/ThemeToggle.tsx` component
    - Use sun icon for light mode, moon icon for dark mode (Lucide React)
    - Implement click handler that calls `toggleTheme()` from context
    - Add smooth transition animation on toggle (200-300ms)
    - Include ARIA label for screen readers ("Toggle theme" or similar)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.6_
  
  - [ ]* 3.2 Write property test for theme toggle state transition
    - **Property 3: Theme Toggle State Transition**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 3.3 Add keyboard accessibility to ThemeToggle
    - Handle Enter and Space key events for toggling
    - Ensure proper focus indicator styling
    - _Requirements: 2.5, 2.6_
  
  - [ ]* 3.4 Write property test for keyboard accessibility
    - **Property 4: Keyboard Accessibility for Theme Toggle**
    - **Validates: Requirements 2.5**
  
  - [ ]* 3.5 Write unit tests for ThemeToggle component
    - Test icon changes based on theme
    - Test click handler invokes toggleTheme
    - Test keyboard events (Enter, Space)
    - Test ARIA labels are present
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Checkpoint - Verify theme system functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create reusable Card component
  - [x] 5.1 Implement Card component with enhanced icon badge
    - Create `src/components/Card.tsx` component
    - Implement large icon badge (120x120px with 3.5rem emoji size)
    - Position icon badge prominently at top-center of card
    - Apply gradient background to icon badge based on `iconGradient` prop
    - Use theme-aware background colors from design tokens
    - Apply subtle shadows for depth (use shadow tokens)
    - Use rounded corners (8-12px border radius)
    - Apply consistent internal padding using spacing tokens
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 5.2 Add interactive hover states to Card
    - Implement hover state with elevation change (shadow increase)
    - Add icon badge hover animation (scale 1.15x, rotate 5deg)
    - Apply smooth transitions (150-200ms)
    - Only apply interactive styles when `interactive` prop is true
    - _Requirements: 7.5, 11.2_
  
  - [ ]* 5.3 Write property test for theme-aware component styling
    - **Property 11: Theme-Aware Component Styling**
    - **Validates: Requirements 6.5, 7.3, 8.8, 9.1, 10.5**
  
  - [ ]* 5.4 Write unit tests for Card component
    - Test card renders with icon badge
    - Test gradient backgrounds apply correctly
    - Test interactive hover states
    - Test theme-aware colors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Create reusable Button component
  - [x] 6.1 Implement Button component with variants
    - Create `src/components/Button.tsx` component
    - Implement three variants: primary (gradient background), secondary (outline), danger (error color)
    - Use gradient backgrounds for primary buttons
    - Ensure minimum height of 40px for touch targets
    - Use rounded corners (4-8px border radius)
    - Apply theme-aware colors from design tokens
    - Support optional icon with proper spacing
    - _Requirements: 8.1, 8.2, 8.3, 8.8_
  
  - [ ]* 6.2 Write property test for button minimum height
    - **Property 13: Button Minimum Height**
    - **Validates: Requirements 8.2**
  
  - [x] 6.3 Implement button states (hover, disabled, active, focus)
    - Add hover state with color change (150-200ms transition)
    - Add disabled state with reduced opacity and not-allowed cursor
    - Add active state with brief animation on click
    - Add focus state with prominent focus indicator
    - _Requirements: 8.4, 8.5, 8.6, 8.7_
  
  - [ ]* 6.4 Write property test for button state styling
    - **Property 14: Button State Styling**
    - **Validates: Requirements 8.4, 8.5**
  
  - [ ]* 6.5 Write property test for interactive element hover states
    - **Property 10: Interactive Element Hover States**
    - **Validates: Requirements 6.3, 7.5, 8.4**
  
  - [x] 6.6 Add loading state to Button
    - Implement loading spinner animation with accent color
    - Disable button interaction during loading
    - Maintain button dimensions during loading state
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 6.7 Write unit tests for Button component
    - Test all three variants render correctly
    - Test hover, disabled, active, and focus states
    - Test loading state with spinner
    - Test icon support
    - Test minimum height requirement
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [x] 7. Create reusable Input component
  - [x] 7.1 Implement Input and Textarea components
    - Create `src/components/Input.tsx` with Input and Textarea components
    - Ensure minimum height of 40px for comfortable interaction
    - Use theme-aware border and background colors
    - Apply consistent padding using spacing tokens
    - Use typography scale for text sizing
    - Display placeholder text with 50-60% opacity
    - _Requirements: 9.1, 9.2, 9.5, 9.6, 9.8_
  
  - [ ]* 7.2 Write property test for input minimum height
    - **Property 15: Input Minimum Height**
    - **Validates: Requirements 9.2**
  
  - [ ]* 7.3 Write property test for input placeholder opacity
    - **Property 17: Input Placeholder Opacity**
    - **Validates: Requirements 9.6**
  
  - [x] 7.4 Implement input focus and error states
    - Add focus state with accent color border and glow shadow
    - Add error state with error color border and message display
    - Apply smooth transitions (100-150ms)
    - _Requirements: 9.3, 9.4, 9.7_
  
  - [ ]* 7.5 Write property test for input focus states
    - **Property 16: Input Focus States**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ]* 7.6 Write property test for input error states
    - **Property 18: Input Error States**
    - **Validates: Requirements 9.7**
  
  - [x] 7.7 Add label and helper text support
    - Implement associated labels with proper for/id attributes
    - Display helper text below input
    - Display error message when error prop is provided
    - _Requirements: 12.5_
  
  - [ ]* 7.8 Write property test for form label association
    - **Property 23: Form Label Association**
    - **Validates: Requirements 12.5**
  
  - [ ]* 7.9 Write unit tests for Input component
    - Test focus state styling
    - Test error state styling
    - Test label association
    - Test placeholder opacity
    - Test minimum height
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 12.5_

- [x] 8. Checkpoint - Verify component library
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create Navigation component
  - [x] 9.1 Implement Navigation component with theme toggle
    - Create `src/components/Navigation.tsx` component
    - Display navigation links with clear visual hierarchy
    - Position ThemeToggle on the right side
    - Use theme-aware background and text colors
    - Add gradient top border accent
    - Maintain height between 56-64px
    - Add backdrop blur effect for depth
    - _Requirements: 6.1, 6.4, 6.5, 6.6_
  
  - [x] 9.2 Implement navigation active and hover states
    - Highlight active page using accent color
    - Add hover state with visual feedback (150-200ms transition)
    - Add focus indicators for keyboard navigation
    - _Requirements: 6.2, 6.3, 6.7_
  
  - [ ]* 9.3 Write property test for navigation active state
    - **Property 9: Navigation Active State**
    - **Validates: Requirements 6.2**
  
  - [ ]* 9.4 Write property test for focus indicators
    - **Property 12: Focus Indicators**
    - **Validates: Requirements 6.7, 8.6, 12.2**
  
  - [x] 9.3 Add responsive behavior for mobile
    - Stack or collapse navigation items below 768px width
    - Ensure touch-friendly target sizes (minimum 40px)
    - _Requirements: 13.2, 13.5_
  
  - [ ]* 9.6 Write unit tests for Navigation component
    - Test active state highlighting
    - Test hover states
    - Test focus indicators
    - Test theme toggle positioning
    - Test responsive behavior at 768px breakpoint
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 13.2_

- [x] 10. Refactor App.tsx to use new components
  - [x] 10.1 Wrap App with ThemeProvider
    - Import and wrap root App component with ThemeProvider
    - Remove any existing theme-related state management
    - _Requirements: 1.1_
  
  - [x] 10.2 Replace navigation with Navigation component
    - Replace existing navigation implementation with new Navigation component
    - Pass active tab state and tab change handler
    - Remove inline Tailwind classes related to navigation styling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 10.3 Refactor page content to use Card components
    - Replace existing card implementations with new Card component
    - Update icon badges to 120x120px size with 3.5rem emoji
    - Apply appropriate gradient backgrounds to icon badges
    - Remove inline Tailwind classes related to card styling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 10.4 Replace buttons with Button component
    - Replace existing button implementations with new Button component
    - Use appropriate variants (primary, secondary, danger)
    - Add loading states where applicable
    - Remove inline Tailwind classes related to button styling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [x] 10.5 Replace form inputs with Input component
    - Replace existing input and textarea elements with new Input component
    - Add proper labels and error handling
    - Remove inline Tailwind classes related to input styling
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 11. Implement responsive layout improvements
  - [x] 11.1 Update grid layouts to use design tokens
    - Replace hardcoded spacing values with spacing tokens
    - Ensure consistent spacing across all layouts
    - _Requirements: 5.3_
  
  - [x] 11.2 Add responsive breakpoints for mobile
    - Implement single-column layout below 768px width
    - Ensure no horizontal scrolling from 320px to 1920px width
    - Use relative units (rem, em, %) instead of fixed pixels
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_
  
  - [ ]* 11.3 Write property test for mobile touch target sizes
    - **Property 25: Mobile Touch Target Sizes**
    - **Validates: Requirements 13.5**
  
  - [ ]* 11.4 Write property test for horizontal scroll prevention
    - **Property 26: Horizontal Scroll Prevention**
    - **Validates: Requirements 13.6**
  
  - [ ]* 11.5 Write unit tests for responsive behavior
    - Test layout at 320px, 768px, and 1920px widths
    - Test single-column layout below 768px
    - Test no horizontal scrolling at all breakpoints
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

- [x] 12. Checkpoint - Verify layout and responsiveness
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement accessibility enhancements
  - [x] 13.1 Add ARIA labels and live regions
    - Add ARIA labels to ThemeToggle and other icon-only buttons
    - Implement ARIA live regions for error announcements
    - Ensure proper heading hierarchy (h1, h2, h3)
    - _Requirements: 12.4, 12.6, 12.7_
  
  - [ ]* 13.2 Write property test for error announcements
    - **Property 24: Error Announcements**
    - **Validates: Requirements 12.7**
  
  - [x] 13.3 Implement keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Test Tab, Enter, and Space key navigation
    - Verify focus order is logical and intuitive
    - _Requirements: 12.1_
  
  - [ ]* 13.4 Write property test for keyboard navigation support
    - **Property 21: Keyboard Navigation Support**
    - **Validates: Requirements 12.1**
  
  - [x] 13.5 Add non-color alternatives for color-coded information
    - Ensure error states include icons or text, not just color
    - Add text labels to color-coded status indicators
    - _Requirements: 12.3_
  
  - [ ]* 13.6 Write property test for non-color alternatives
    - **Property 22: Non-Color Alternatives**
    - **Validates: Requirements 12.3**
  
  - [x] 13.7 Implement reduced motion support
    - Detect `prefers-reduced-motion` media query
    - Disable or reduce animations when preference is set
    - Apply to theme transitions, hover effects, and loading animations
    - _Requirements: 11.6_
  
  - [ ]* 13.8 Write property test for reduced motion preference
    - **Property 20: Reduced Motion Preference**
    - **Validates: Requirements 11.6**
  
  - [ ]* 13.9 Write unit tests for accessibility features
    - Test ARIA labels are present on all icon-only buttons
    - Test ARIA live regions announce errors
    - Test heading hierarchy is correct
    - Test keyboard navigation works for all interactive elements
    - Test reduced motion disables animations
    - _Requirements: 12.1, 12.3, 12.4, 12.6, 12.7, 11.6_

- [x] 14. Implement loading state improvements
  - [x] 14.1 Create enhanced loading component
    - Create loading spinner with accent color
    - Add descriptive text indicating what is loading
    - Use smooth animations with easing functions
    - Center loading state within container
    - Ensure theme-aware colors
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 14.2 Write property test for loading state descriptive text
    - **Property 19: Loading State Descriptive Text**
    - **Validates: Requirements 10.2**
  
  - [ ]* 14.3 Write unit tests for loading component
    - Test spinner renders with accent color
    - Test descriptive text is present
    - Test centering within container
    - Test theme-aware colors
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 15. Performance optimization and validation
  - [x] 15.1 Optimize CSS bundle size
    - Tree-shake unused Tailwind utilities
    - Minimize CSS duplication
    - Verify design tokens reduce token repetition
    - _Requirements: 14.1_
  
  - [x] 15.2 Verify theme switching performance
    - Measure theme switch duration (should be < 300ms)
    - Ensure no Cumulative Layout Shift during theme changes
    - Verify animations maintain 60fps
    - _Requirements: 1.5, 14.2, 14.3, 14.4_
  
  - [x] 15.3 Prevent flash of unstyled content
    - Ensure design tokens load synchronously
    - Test initial page load with empty cache
    - _Requirements: 14.5_
  
  - [ ]* 15.4 Write unit tests for performance requirements
    - Test bundle size increase is less than 10KB gzipped
    - Test theme switch completes within 300ms
    - Test no layout shifts during theme changes
    - _Requirements: 14.1, 14.2, 14.4_

- [x] 16. Final integration and polish
  - [x] 16.1 Remove all inline Tailwind styles
    - Search for and replace remaining inline className strings
    - Ensure all components use design tokens
    - Verify consistency across all pages
    - _Requirements: 15.3_
  
  - [x] 16.2 Add documentation comments to design tokens
    - Document usage and values for all design tokens
    - Add examples for common patterns
    - _Requirements: 15.5_
  
  - [x] 16.3 Verify design system consistency
    - Audit all components for design token usage
    - Ensure no hardcoded colors, spacing, or typography values
    - Test all three main pages (Home, Strategies, Optimizer)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 16.4 Write integration tests for theme propagation
    - Test theme changes propagate to all components
    - Test all pages use theme-aware colors
    - Test navigation state management
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_

- [x] 17. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses TypeScript and React as specified in the design document
- Icon badges are enhanced to 120x120px (50% larger than mockup) per user feedback
- Design tokens serve as single source of truth for all theme-related values
- Tailwind CSS is retained for layout utilities but not for theme-related styling
