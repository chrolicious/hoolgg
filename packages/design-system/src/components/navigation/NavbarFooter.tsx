'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './NavbarFooter.module.css';

export interface NavbarFooterProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * NavbarFooter — Bottom-right positioned navigation (flipped Navbar)
 * Features rainbow accent bar and sticker-style badge
 * Mirror of Navbar rotated 180 degrees
 *
 * Usage:
 * <NavbarFooter
 *   icon="⚔️"
 *   title="Guild Finder"
 *   subtitle="Find your next adventure"
 *   actions={<button>Settings</button>}
 * />
 */
export const NavbarFooter = React.forwardRef<HTMLDivElement, NavbarFooterProps>(
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
        className={`${styles.navbarFooter} ${className || ''}`}
      >
        {/* Rainbow accent bar */}
        <div
          className={styles.accentBar}
          style={accentColor ? { background: accentColor } : undefined}
        />

        {/* Navbar content */}
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Actions (left side) */}
          {actions && <div className={styles.actions}>{actions}</div>}

          {/* Title and subtitle */}
          <div className={styles.text}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {/* Badge with icon */}
          {icon && (
            <div className={styles.badge}>
              <div className={styles.icon}>{icon}</div>
            </div>
          )}
        </motion.div>
      </div>
    );
  },
);

NavbarFooter.displayName = 'NavbarFooter';
