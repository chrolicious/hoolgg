'use client';

import React from 'react';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away';

export interface AvatarProps {
  /** Image URL */
  src?: string;
  /** Fallback text (e.g., initials like "JD") */
  fallback?: string;
  /** Alt text for image */
  alt?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Online status indicator */
  status?: AvatarStatus;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * Avatar component — Profile pictures with fallback initials
 *
 * Usage:
 * <Avatar src="https://..." alt="John Doe" />
 * <Avatar fallback="JD" size="lg" status="online" />
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      fallback,
      alt = 'avatar',
      size = 'md',
      status,
      className,
      style,
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
          />
        ) : (
          <div className={styles.fallback}>
            {fallback}
          </div>
        )}

        {/* Status indicator */}
        {status && (
          <div className={`${styles.status} ${styles[`status_${status}`]}`} />
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
