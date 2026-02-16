'use client';

import React from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
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
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.container} ${styles[padding]} ${animated ? styles.animated : ''} ${className || ''}`.trim()}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
