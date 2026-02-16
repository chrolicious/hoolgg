'use client';

import React from 'react';
import styles from './Panel.module.css';

export interface PanelProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Panel — Glassmorphism container with header, body, and footer sections
 * Provides structure for grouped content with clear visual separation
 *
 * Usage:
 * <Panel
 *   title="Settings"
 *   variant="elevated"
 *   footer={<Button>Save</Button>}
 * >
 *   Panel content
 * </Panel>
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      children,
      title,
      subtitle,
      footer,
      variant = 'default',
      padding = 'md',
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.panel} ${styles[variant]} ${className || ''}`}
      >
        {/* Header section */}
        {(title || subtitle) && (
          <div className={`${styles.header} ${styles[`padding-${padding}`]}`}>
            <div>
              {title && <div className={styles.title}>{title}</div>}
              {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
          </div>
        )}

        {/* Divider between header and body */}
        {(title || subtitle) && <div className={styles.divider} />}

        {/* Body section */}
        <div className={`${styles.body} ${styles[`padding-${padding}`]}`}>
          {children}
        </div>

        {/* Divider between body and footer */}
        {footer && <div className={styles.divider} />}

        {/* Footer section */}
        {footer && (
          <div className={`${styles.footer} ${styles[`padding-${padding}`]}`}>
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Panel.displayName = 'Panel';
