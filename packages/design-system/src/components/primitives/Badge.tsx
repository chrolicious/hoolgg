'use client';

import React from 'react';
import styles from './Badge.module.css';
import { variantVars, type ButtonVariant } from './Button.shared';

export type BadgeVariant = ButtonVariant;
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  profileIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

interface BadgeSectionProps {
  children?: React.ReactNode;
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      profileIcon,
      className,
      children,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.badge} ${styles[size]} ${className || ''}`}
        style={variantVars[variant] as React.CSSProperties}
        data-variant={variant}
      >
        {/* Outline layer */}
        <div className={styles.outline}>
          {/* Dark border layer */}
          <div className={styles.darkLayer}>
            {/* Inside fill with star background */}
            <div className={styles.inside}>
              {/* Profile icon at top */}
              {profileIcon && <div className={styles.profileIcon}>{profileIcon}</div>}

              {/* Content sections */}
              <div className={styles.content}>{children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Badge.displayName = 'Badge';

export const BadgeHeader = ({ children, className }: BadgeSectionProps) => (
  <div className={`${styles.header} ${className || ''}`}>{children}</div>
);
BadgeHeader.displayName = 'BadgeHeader';

export const BadgeBody = ({ children, className }: BadgeSectionProps) => (
  <div className={`${styles.body} ${className || ''}`}>{children}</div>
);
BadgeBody.displayName = 'BadgeBody';

export const BadgeFooter = ({ children, className }: BadgeSectionProps) => (
  <div className={`${styles.footer} ${className || ''}`}>{children}</div>
);
BadgeFooter.displayName = 'BadgeFooter';
