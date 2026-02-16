'use client';

import React from 'react';
import styles from './Stack.module.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: StackDirection;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: StackAlign;
  justify?: StackJustify;
}

/**
 * Stack — Flexbox wrapper for organizing content vertically or horizontally
 *
 * Usage:
 * <Stack direction="vertical" gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      direction = 'vertical',
      gap = 'md',
      align = 'start',
      justify = 'start',
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.stack} ${styles[direction]} ${styles[`gap-${gap}`]} ${styles[`align-${align}`]} ${styles[`justify-${justify}`]} ${className || ''}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Stack.displayName = 'Stack';
