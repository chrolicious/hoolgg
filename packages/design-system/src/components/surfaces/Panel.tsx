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
 * Panel — Card with optional header and footer sections
 * Provides structure for grouped content with title and actions
 *
 * Usage:
 * <Panel
 *   title="Panel Title"
 *   subtitle="Optional description"
 *   footer={<Button>Action</Button>}
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
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.panel} ${styles[variant]} ${className || ''}`}
        {...props}
      >
        {/* Outline layer */}
        <div className={styles.outline}>
          {/* Dark border layer */}
          <div className={styles.darkLayer}>
            {/* Inside fill */}
            <div className={styles.inside}>
              {/* Header section */}
              {(title || subtitle) && (
                <div className={`${styles.header} ${styles[`padding-${padding}`]}`}>
                  {title && <div className={styles.title}>{title}</div>}
                  {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
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
          </div>
        </div>
      </div>
    );
  },
);

Panel.displayName = 'Panel';
