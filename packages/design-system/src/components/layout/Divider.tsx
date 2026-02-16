'use client';

import React from 'react';
import styles from './Divider.module.css';

export type DividerDirection = 'horizontal' | 'vertical';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: DividerDirection;
  label?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Divider — Visual separator line (horizontal or vertical)
 *
 * Usage:
 * <Divider />
 * <Divider direction="vertical" />
 * <Divider label="OR" />
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      direction = 'horizontal',
      label,
      spacing = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    if (label) {
      return (
        <div
          ref={ref}
          className={`${styles.dividerWithLabel} ${styles[`spacing-${spacing}`]} ${className || ''}`.trim()}
          {...props}
        >
          <div className={styles.line} />
          <div className={styles.labelText}>{label}</div>
          <div className={styles.line} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${styles.divider} ${styles[direction]} ${styles[`spacing-${spacing}`]} ${className || ''}`.trim()}
        {...props}
      />
    );
  },
);

Divider.displayName = 'Divider';
