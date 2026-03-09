/**
 * ARIA Utilities for accessibility
 */

/**
 * Creates an ARIA live region for announcing dynamic content changes
 */
export function createLiveRegion(role: 'polite' | 'assertive' = 'polite'): {
  element: HTMLElement;
  announce: (message: string) => void;
  destroy: () => void;
} {
  // Create the live region element
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', role);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('aria-relevant', 'additions text');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('aria-live', role);
  
  // Hide the element visually but keep it accessible to screen readers
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  });

  // Add to document
  document.body.appendChild(liveRegion);

  return {
    element: liveRegion,
    announce: (message: string) => {
      // Clear any existing content
      liveRegion.textContent = '';
      
      // Use setTimeout to ensure the text is announced
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
    },
    destroy: () => {
      if (liveRegion.parentNode) {
        document.body.removeChild(liveRegion);
      }
    }
  };
}

/**
 * Creates an ARIA live region for error announcements
 */
export function createErrorAnnouncer(): {
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announceInfo: (message: string) => void;
} {
  const errorRegion = createLiveRegion('assertive');
  const successRegion = createLiveRegion('polite');
  const infoRegion = createLiveRegion('polite');

  return {
    announceError: (message: string) => {
      errorRegion.announce(message);
    },
    announceSuccess: (message: string) => {
      successRegion.announce(message);
    },
    announceInfo: (message: string) => {
      infoRegion.announce(message);
    }
  };
}

/**
 * Generates a unique ID for ARIA attributes
 */
export function generateAriaId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates ARIA attributes for a component
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = [];
  const ariaAttributes = [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-labelledby',
    'aria-describedby',
    'aria-live',
    'aria-atomic',
    'aria-relevant',
    'aria-live',
    'aria-busy',
    'aria-disabled',
    'aria-hidden',
    'aria-expanded',
    'aria-haspopup',
    'aria-controls',
    'aria-current',
    'aria-selected',
    'aria-checked',
    'aria-pressed',
    'aria-valuenow',
    'aria-valuemin',
    'aria-valuemax',
    'aria-valuetext'
  ];

  const hasAria = ariaAttributes.some(attr => 
    element.hasAttribute(attr) || element.hasAttribute(`aria-${attr}`)
  );

  if (!hasAria) {
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();
    
    // Some elements might not need ARIA if they have semantic HTML
    if (role || 
        ['button', 'link', 'textbox', 'checkbox', 'radio', 'slider', 'progressbar'].includes(role || '')) {
      // These roles typically need ARIA labels
      if (!element.hasAttribute('aria-label') && 
          !element.hasAttribute('aria-labelledby') &&
          !element.textContent?.trim()) {
        errors.push(`Element ${tagName} with role="${role}" needs aria-label or aria-labelledby`);
      }
    }
  }

  return errors;
}

/**
 * Focus trap for modal dialogs and focus management
 */
export class FocusManager {
  private focusableElements: HTMLElement[] = [];
  private originalActiveElement: HTMLElement | null = null;
  
  constructor(private container: HTMLElement) {
    this.originalActiveElement = document.activeElement as HTMLElement;
    this.trapFocus();
  }
  
  private trapFocus() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    
    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ).filter((el): el is HTMLElement => {
      const style = window.getComputedStyle(el as Element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }) as HTMLElement[];
    
    // Focus the first focusable element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }
  
  restoreFocus() {
    if (this.originalActiveElement) {
      (this.originalActiveElement as HTMLElement).focus();
    }
  }
}

/**
 * Keyboard navigation helper for lists and menus
 */
export function createKeyboardNavigation(
  items: HTMLElement[],
  onSelect: (index: number) => void
) {
  let currentIndex = 0;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        items[currentIndex].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(currentIndex);
        break;
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        items[currentIndex].focus();
        break;
      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        items[currentIndex].focus();
        break;
      case 'Escape':
        // Handle escape
        break;
    }
  };
  
  // Attach event listeners
  items.forEach(item => {
    item.addEventListener('keydown', handleKeyDown);
  });
  
  return {
    focusFirst: () => {
      currentIndex = 0;
      items[0]?.focus();
    },
    destroy: () => {
      // Clean up event listeners
      items.forEach(item => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    }
  };
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'assertive' | 'polite' = 'polite') {
  const announcer = document.getElementById('screen-reader-announcer');
  if (announcer) {
    announcer.textContent = message;
    announcer.setAttribute('aria-live', priority);
  }
}

/**
 * Initialize screen reader announcer element
 */
export function initializeScreenReaderAnnouncer() {
  let announcer = document.getElementById('screen-reader-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('aria-relevant', 'additions text');
    Object.assign(announcer.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    });
    document.body.appendChild(announcer);
  }
  return announcer;
}