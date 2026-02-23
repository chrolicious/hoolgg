'use client';

import React from 'react';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image URL */
  src?: string;
  /** Fallback text (e.g., initials like "JD") */
  fallback?: string;
  /** Alt text for image */
  alt?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Override object-position on the image (e.g. "top" to show head/torso) */
  objectPosition?: string;
}

/**
 * Avatar component — Profile pictures with fallback initials
 *
 * Usage:
 * <Avatar src="https://..." alt="John Doe" />
 * <Avatar fallback="JD" size="lg" />
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      fallback,
      alt = 'avatar',
      size = 'md',
      className,
      style,
      objectPosition,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.avatar} ${styles[size]} ${className || ''}`.trim()}
        style={style}
      >
        {/* Image or fallback */}
        {src ? (
          <img
            src={src}
            alt={alt}
            className={styles.image}
            style={objectPosition ? { objectPosition } : undefined}
          />
        ) : (
          <div className={styles.fallback}>
            {fallback}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
