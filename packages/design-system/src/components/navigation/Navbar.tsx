'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';

export interface NavbarProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Navbar — Top-left positioned navigation with icon badge and title
 * Features rainbow accent bar and sticker-style badge
 *
 * Usage:
 * <Navbar
 *   icon="⚔️"
 *   title="Guild Finder"
 *   subtitle="Find your next adventure"
 *   actions={<button>Settings</button>}
 * />
 */
export const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  (
    {
      icon,
      title,
      subtitle,
      accentColor,
      actions,
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.navbar} ${className || ''}`}
      >
        {/* Rainbow accent bar */}
        <div
          className={styles.accentBar}
          style={accentColor ? { background: accentColor } : undefined}
        />

        {/* Navbar content */}
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Badge with icon */}
          {icon && (
            <div className={styles.badge}>
              <div className={styles.icon}>{icon}</div>
            </div>
          )}

          {/* Title and subtitle */}
          <div className={styles.text}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {/* Actions (right side) */}
          {actions && <div className={styles.actions}>{actions}</div>}
        </motion.div>
      </div>
    );
  },
);

Navbar.displayName = 'Navbar';
