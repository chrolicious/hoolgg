'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'highlight';
  showPercentage?: boolean;
  showValue?: boolean;
  animated?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * ProgressBar — Displays progress with label and optional percentage
 * Perfect for guild progression, member capacity, recruitment goals
 *
 * Usage:
 * <ProgressBar
 *   label="Guild Members"
 *   value={45}
 *   max={50}
 *   showPercentage
 *   variant="success"
 * />
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      label,
      value,
      max = 100,
      variant = 'default',
      showPercentage = true,
      showValue = true,
      animated = true,
      subtitle,
      className,
    },
    ref,
  ) => {
    const percentage = (value / max) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
      <div ref={ref} className={`${styles.progressBar} ${className || ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.labelSection}>
            <p className={styles.label}>{label}</p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <div className={styles.stats}>
            {showValue && (
              <span className={styles.value}>
                {value}/{max}
              </span>
            )}
            {showPercentage && (
              <span className={styles.percentage}>{clampedPercentage.toFixed(0)}%</span>
            )}
          </div>
        </div>

        {/* Bar */}
        <div className={`${styles.barContainer} ${styles[variant]}`}>
          <motion.div
            className={styles.barFill}
            initial={animated ? { width: 0 } : { width: `${clampedPercentage}%` }}
            animate={{ width: `${clampedPercentage}%` }}
            transition={{
              duration: animated ? 0.8 : 0,
              ease: 'easeOut',
              delay: animated ? 0.1 : 0,
            }}
          />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
