'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AchievementGrid.module.css';

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  earned?: boolean;
  earnedDate?: string;
}

export interface AchievementGridProps {
  achievements: Achievement[];
  title?: string;
  columns?: 3 | 4 | 5 | 6;
  showLocked?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

/**
 * AchievementGrid — Displays achievements/badges in a grid layout
 * Shows earned vs locked achievements with hover tooltips
 *
 * Usage:
 * <AchievementGrid
 *   title="Guild Achievements"
 *   achievements={achievements}
 *   columns={5}
 * />
 */
export const AchievementGrid = React.forwardRef<HTMLDivElement, AchievementGridProps>(
  (
    {
      achievements,
      title,
      columns = 5,
      showLocked = true,
      onAchievementClick,
      className,
    },
    ref,
  ) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const displayedAchievements = showLocked
      ? achievements
      : achievements.filter((a) => a.earned);

    return (
      <div
        ref={ref}
        className={`${styles.achievementGrid} ${className || ''}`}
      >
        {title && <h3 className={styles.title}>{title}</h3>}

        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {displayedAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`${styles.achievement} ${
                achievement.earned ? styles.earned : styles.locked
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              onMouseEnter={() => setHoveredId(achievement.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onAchievementClick?.(achievement)}
              whileHover={achievement.earned ? { scale: 1.1, y: -4 } : undefined}
            >
              {/* Achievement badge */}
              <div className={styles.badge}>
                {achievement.icon ? (
                  <div className={styles.icon}>{achievement.icon}</div>
                ) : (
                  <div className={styles.placeholder}>🏆</div>
                )}

                {/* Locked overlay */}
                {!achievement.earned && (
                  <div className={styles.lockedOverlay}>
                    <span className={styles.lockIcon}>🔒</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <p className={styles.name}>{achievement.name}</p>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredId === achievement.id && (
                  <motion.div
                    className={styles.tooltip}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={styles.tooltipContent}>
                      <p className={styles.tooltipName}>{achievement.name}</p>
                      {achievement.description && (
                        <p className={styles.tooltipDescription}>
                          {achievement.description}
                        </p>
                      )}
                      {achievement.earned && achievement.earnedDate && (
                        <p className={styles.tooltipDate}>
                          Earned: {achievement.earnedDate}
                        </p>
                      )}
                      {!achievement.earned && (
                        <p className={styles.tooltipLocked}>Locked</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    );
  },
);

AchievementGrid.displayName = 'AchievementGrid';
