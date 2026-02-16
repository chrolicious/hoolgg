'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'success' | 'warning' | 'danger';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * StatCard — Displays a single statistic with icon and label
 * Perfect for dashboards and guild overview pages
 *
 * Usage:
 * <StatCard
 *   label="Active Members"
 *   value={45}
 *   icon={<UsersIcon />}
 *   trend={{ direction: 'up', percentage: 5 }}
 * />
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      icon,
      variant = 'default',
      trend,
      subtitle,
      onClick,
      className,
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`${styles.statCard} ${styles[variant]} ${onClick ? styles.interactive : ''} ${className || ''}`}
        onClick={onClick}
        whileHover={onClick ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Icon */}
        {icon && <div className={styles.icon}>{icon}</div>}

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.label}>{label}</p>
          <div className={styles.valueWrapper}>
            <span className={styles.value}>{value}</span>
            {trend && (
              <div className={`${styles.trend} ${styles[`trend-${trend.direction}`]}`}>
                <span className={styles.trendIcon}>
                  {trend.direction === 'up' && '↑'}
                  {trend.direction === 'down' && '↓'}
                  {trend.direction === 'neutral' && '→'}
                </span>
                <span className={styles.trendPercent}>{trend.percentage}%</span>
              </div>
            )}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </motion.div>
    );
  },
);

StatCard.displayName = 'StatCard';
