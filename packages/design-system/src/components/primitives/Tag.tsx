'use client';

import React from 'react';
import styles from './Tag.module.css';
import { variantVars, type ButtonVariant } from './Button.shared';

export type TagVariant = ButtonVariant;
export type TagSize = 'sm' | 'md';

export interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  onRemove?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Tag component — Small sticker-style labels with optional remove button
 *
 * Usage:
 * <Tag variant="primary">skill</Tag>
 * <Tag onRemove={() => {}}>removable tag</Tag>
 */
export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      onRemove,
      className,
      children,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.tag} ${styles[size]} ${className || ''}`.trim()}
        style={variantVars[variant] as React.CSSProperties}
        data-variant={variant}
      >
        {/* Outline layer */}
        <div className={styles.outline}>
          {/* Dark border layer */}
          <div className={styles.darkLayer}>
            {/* Inside fill */}
            <div className={styles.inside}>
              <span className={styles.label}>{children}</span>
              {onRemove && (
                <button
                  className={styles.removeButton}
                  onClick={onRemove}
                  aria-label="Remove tag"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Tag.displayName = 'Tag';
