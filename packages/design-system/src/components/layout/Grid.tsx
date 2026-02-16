'use client';

import React from 'react';
import styles from './Grid.module.css';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number | 'auto';
  rows?: number;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
}

/**
 * Grid — CSS Grid layout wrapper for organizing content
 *
 * Usage:
 * <Grid columns={3} gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 3,
      rows,
      gap = 'md',
      autoFit = false,
      minItemWidth = '150px',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const gridStyle: React.CSSProperties = {
      ...style,
    };

    if (autoFit) {
      gridStyle.gridTemplateColumns = `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
    } else if (typeof columns === 'number') {
      gridStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    if (rows && typeof rows === 'number') {
      gridStyle.gridTemplateRows = `repeat(${rows}, 1fr)`;
    }

    const gapMap: Record<string, string> = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    };

    gridStyle.gap = gapMap[gap];

    return (
      <div
        ref={ref}
        className={`${styles.grid} ${className || ''}`.trim()}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Grid.displayName = 'Grid';
