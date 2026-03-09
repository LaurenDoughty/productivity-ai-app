import React from 'react';
import '../styles/Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  icon?: React.ReactNode;
  iconGradient?: 'primary' | 'secondary' | 'warm' | 'cool' | 'subtle';
  style?: React.CSSProperties;
}

export function Card({
  children,
  className = '',
  interactive = false,
  icon,
  iconGradient = 'primary',
  style,
}: CardProps) {
  return (
    <div className={`card ${interactive ? 'card--interactive' : ''} ${className}`} style={style}>
      {icon && (
        <div className={`card__icon-badge card__icon-badge--${iconGradient}`}>
          {icon}
        </div>
      )}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
}
