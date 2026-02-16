'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

/**
 * Card — Sticker-styled container for content grouping
 * Uses the same layered sticker design as buttons for visual consistency
 *
 * Usage:
 * <Card padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      interactive = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${
          interactive ? styles.interactive : ''
        } ${className || ''}`}
        {...props}
      >
        {/* Outline layer */}
        <div className={styles.outline}>
          {/* Dark border layer */}
          <div className={styles.darkLayer}>
            {/* Inside fill */}
            <div className={styles.inside}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
);

Card.displayName = 'Card';
