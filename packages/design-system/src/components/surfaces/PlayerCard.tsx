'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../primitives/Badge';
import styles from './PlayerCard.module.css';

export type PlayerRole = 'tank' | 'healer' | 'mdps' | 'rdps';
export type PlayerClass =
  | 'warrior'
  | 'paladin'
  | 'hunter'
  | 'rogue'
  | 'priest'
  | 'shaman'
  | 'mage'
  | 'warlock'
  | 'druid'
  | 'deathknight'
  | 'demonhunter'
  | 'evoker';

export interface PlayerCardProps {
  name: string;
  class: PlayerClass;
  spec: string;
  role: PlayerRole;
  ilvl?: number;
  avatar?: React.ReactNode;
  guild?: string;
  realm?: string;
  achievements?: number;
  onClick?: () => void;
  className?: string;
}

// Class colors for WoW
const classColors: Record<PlayerClass, string> = {
  warrior: '#C79C6E',
  paladin: '#F58CBA',
  hunter: '#ABD473',
  rogue: '#FFF569',
  priest: '#FFFFFF',
  shaman: '#0070DD',
  mage: '#69CCF0',
  warlock: '#9482CA',
  druid: '#FF8000',
  deathknight: '#C41E3A',
  demonhunter: '#A335EE',
  evoker: '#00FF96',
};

// Role badges
const roleBadgeVariants: Record<PlayerRole, any> = {
  tank: 'purple',
  healer: 'primary',
  mdps: 'destructive',
  rdps: 'warning',
};

/**
 * PlayerCard — Displays player information in a compact, styled card
 * Shows player name, class, spec, role, and ilvl
 *
 * Usage:
 * <PlayerCard
 *   name="PlayerName"
 *   class="warrior"
 *   spec="Protection"
 *   role="tank"
 *   ilvl={489}
 *   guild="Guild Name"
 *   realm="Illidan"
 * />
 */
export const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(
  (
    {
      name,
      class: playerClass,
      spec,
      role,
      ilvl,
      avatar,
      guild,
      realm,
      achievements,
      onClick,
      className,
    },
    ref,
  ) => {
    const classColor = classColors[playerClass];

    return (
      <motion.div
        ref={ref}
        className={`${styles.playerCard} ${onClick ? styles.interactive : ''} ${className || ''}`}
        onClick={onClick}
        whileHover={onClick ? { y: -4 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Class color indicator */}
        <div
          className={styles.classBar}
          style={{ backgroundColor: classColor }}
        />

        <div className={styles.content}>
          {/* Avatar + Name section */}
          <div className={styles.header}>
            {avatar && <div className={styles.avatar}>{avatar}</div>}
            <div className={styles.titleSection}>
              <h3 className={styles.playerName}>{name}</h3>
              {guild && <p className={styles.guild}>« {guild} »</p>}
              {realm && <p className={styles.realm}>{realm}</p>}
            </div>
          </div>

          {/* Spec and role section */}
          <div className={styles.specSection}>
            <div className={styles.specInfo}>
              <span className={styles.specLabel}>Spec</span>
              <span className={styles.specValue}>{spec}</span>
            </div>
            <Badge variant={roleBadgeVariants[role]} size="sm">
              {role.toUpperCase()}
            </Badge>
          </div>

          {/* Stats footer */}
          <div className={styles.footer}>
            {ilvl !== undefined && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>iLvl</span>
                <span className={styles.statValue}>{ilvl}</span>
              </div>
            )}
            {achievements !== undefined && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Achievements</span>
                <span className={styles.statValue}>{achievements}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

PlayerCard.displayName = 'PlayerCard';
