'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  background?: 'dark' | 'light';
  className?: string;
}

/**
 * Card — Glassmorphism container with depth and gradient styling
 * Perfect for grouping related content with visual hierarchy
 *
 * Usage:
 * <Card padding="lg" variant="elevated">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      interactive = false,
      background = 'dark',
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${styles[`bg-${background}`]} ${
          interactive ? styles.interactive : ''
        } ${className || ''}`}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
