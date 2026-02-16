'use client';

import React from 'react';
import styles from './TextureOverlay.module.css';

export interface TextureOverlayProps {
  pattern?: 'checkerboard' | 'grid' | 'dots';
  opacity?: number;
  animated?: boolean;
  className?: string;
}

/**
 * TextureOverlay — Full-page checkerboard texture overlay
 * Creates visual depth and matches Mario Wonder aesthetic
 *
 * Usage:
 * <div style="position: relative">
 *   <TextureOverlay opacity={0.15} />
 *   Content goes here
 * </div>
 */
export const TextureOverlay = React.forwardRef<HTMLDivElement, TextureOverlayProps>(
  (
    {
      pattern = 'checkerboard',
      opacity = 0.15,
      animated = true,
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.overlay} ${styles[pattern]} ${animated ? styles.animated : ''} ${className || ''}`}
        style={{ opacity }}
      />
    );
  },
);

TextureOverlay.displayName = 'TextureOverlay';
