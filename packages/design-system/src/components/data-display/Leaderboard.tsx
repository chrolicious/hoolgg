'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Leaderboard.module.css';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  value: number | string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  metric?: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Leaderboard — Displays ranked list of entries
 * Perfect for top guilds, top players, DPS rankings, etc.
 *
 * Usage:
 * <Leaderboard
 *   title="Top Guilds"
 *   metric="Members"
 *   entries={guilds.map((g, i) => ({
 *     rank: i + 1,
 *     name: g.name,
 *     value: g.members,
 *   }))}
 * />
 */
export const Leaderboard = React.forwardRef<HTMLDivElement, LeaderboardProps>(
  (
    {
      title,
      entries,
      metric,
      emptyMessage = 'No entries',
      loading = false,
      className,
    },
    ref,
  ) => {
    const getMedalEmoji = (rank: number) => {
      switch (rank) {
        case 1:
          return '🥇';
        case 2:
          return '🥈';
        case 3:
          return '🥉';
        default:
          return null;
      }
    };

    const getMedalColor = (rank: number) => {
      switch (rank) {
        case 1:
          return '#FFD700';
        case 2:
          return '#C0C0C0';
        case 3:
          return '#CD7F32';
        default:
          return 'rgba(255, 255, 255, 0.4)';
      }
    };

    return (
      <div
        ref={ref}
        className={`${styles.leaderboard} ${loading ? styles.loading : ''} ${className || ''}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {metric && <span className={styles.metric}>{metric}</span>}
        </div>

        {/* Entries */}
        <div className={styles.entries}>
          {loading ? (
            <div className={styles.placeholder}>
              <p>Loading...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className={styles.placeholder}>
              <p>{emptyMessage}</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={`${entry.rank}-${entry.name}`}
                className={`${styles.entry} ${entry.highlight ? styles.highlighted : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {/* Rank */}
                <div
                  className={styles.rank}
                  style={{ color: getMedalColor(entry.rank) }}
                >
                  {getMedalEmoji(entry.rank) || entry.rank}
                </div>

                {/* Name with icon */}
                <div className={styles.nameSection}>
                  {entry.icon && <div className={styles.icon}>{entry.icon}</div>}
                  <span className={styles.name}>{entry.name}</span>
                </div>

                {/* Value */}
                <span className={styles.value}>{entry.value}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  },
);

Leaderboard.displayName = 'Leaderboard';
