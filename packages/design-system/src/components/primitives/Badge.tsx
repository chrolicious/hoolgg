'use client';

import React from 'react';
import styles from './Badge.module.css';
import { variantVars, type ButtonVariant } from './Button.shared';

export type BadgeVariant = ButtonVariant;
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  orientation?: 'vertical' | 'horizontal';
  profileIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: () => void;
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
      orientation = 'vertical',
      profileIcon,
      className,
      style: styleProp,
      children,
      onClick,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.badge} ${styles[size]} ${orientation === 'horizontal' ? styles.horizontal : ''} ${className || ''}`}
        style={{ ...variantVars[variant] as React.CSSProperties, ...styleProp }}
        data-variant={variant}
        onClick={onClick}
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
