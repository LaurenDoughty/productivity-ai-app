import React from 'react';
import '../styles/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} button--${size} ${loading ? 'button--loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="button__spinner" aria-hidden="true" />
          <span className="button__text button__text--loading">{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="button__icon">{icon}</span>}
          <span className="button__text">{children}</span>
        </>
      )}
    </button>
  );
}
