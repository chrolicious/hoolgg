'use client';

import React from 'react';
import styles from './Container.module.css';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

/**
 * Container — Wrapper with checkered background and glassmorphism border
 *
 * Usage:
 * <Container>
 *   <div>Your content here</div>
 * </Container>
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      className,
      padding = 'md',
      animated = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.container} ${styles[padding]} ${animated ? styles.animated : ''} ${className || ''}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
