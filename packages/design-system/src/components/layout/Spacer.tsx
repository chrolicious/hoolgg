'use client';

import React from 'react';

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpacerDirection = 'vertical' | 'horizontal';

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpacerSize;
  direction?: SpacerDirection;
}

const sizeMap: Record<SpacerSize, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/**
 * Spacer — Creates blank space for layout control
 *
 * Usage:
 * <Spacer size="md" />
 * <Spacer size="lg" direction="horizontal" />
 */
export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  (
    {
      size = 'md',
      direction = 'vertical',
      ...props
    },
    ref,
  ) => {
    const sizePixels = sizeMap[size];

    const style: React.CSSProperties =
      direction === 'vertical'
        ? { height: `${sizePixels}px`, flexShrink: 0 }
        : { width: `${sizePixels}px`, flexShrink: 0 };

    return <div ref={ref} style={style} {...props} />;
  },
);

Spacer.displayName = 'Spacer';
