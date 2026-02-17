'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../primitives/Badge';
import styles from './GuildCard.module.css';

export interface GuildCardProps {
  name: string;
  realm: string;
  faction: 'alliance' | 'horde';
  memberCount: number;
  maxMembers?: number;
  description?: string;
  leader?: string;
  recruitingStatus?: 'open' | 'closed' | 'selective';
  onClick?: () => void;
  className?: string;
}

/**
 * GuildCard — Displays guild information in a compact, styled card
 * Shows guild name, realm, faction, member count, and recruiting status
 *
 * Usage:
 * <GuildCard
 *   name="Guild Name"
 *   realm="Illidan"
 *   faction="horde"
 *   memberCount={45}
 *   maxMembers={50}
 *   recruitingStatus="open"
 *   onClick={() => navigate('/guilds/guild-name')}
 * />
 */
export const GuildCard = React.forwardRef<HTMLDivElement, GuildCardProps>(
  (
    {
      name,
      realm,
      faction,
      memberCount,
      maxMembers = 50,
      description,
      leader,
      recruitingStatus,
      onClick,
      className,
    },
    ref,
  ) => {
    const factionColor = faction === 'alliance' ? '#3B82F6' : '#EF4444';
    const recruitingBadgeVariant =
      recruitingStatus === 'open'
        ? 'primary'
        : recruitingStatus === 'selective'
          ? 'warning'
          : 'secondary';

    return (
      <motion.div
        ref={ref}
        className={`${styles.guildCard} ${onClick ? styles.interactive : ''} ${className || ''}`}
        onClick={onClick}
        whileHover={onClick ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Faction indicator bar */}
        <div
          className={styles.factionBar}
          style={{ backgroundColor: factionColor }}
        />

        <div className={styles.content}>
          {/* Header with guild name */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h3 className={styles.guildName}>{name}</h3>
              <p className={styles.realm}>{realm}</p>
            </div>
          </div>

          {/* Recruiting status badge - full width */}
          {recruitingStatus && (
            <div className={styles.badgeWrapper}>
              <Badge variant={recruitingBadgeVariant} size="sm">
                {recruitingStatus === 'open'
                  ? 'Recruiting'
                  : recruitingStatus === 'selective'
                    ? 'Selective'
                    : 'Closed'}
              </Badge>
            </div>
          )}

          {/* Description */}
          {description && <p className={styles.description}>{description}</p>}

          {/* Footer with stats */}
          <div className={styles.footer}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Members</span>
              <span className={styles.statValue}>
                {memberCount}/{maxMembers}
              </span>
            </div>
            {leader && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Leader</span>
                <span className={styles.statValue}>{leader}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

GuildCard.displayName = 'GuildCard';
