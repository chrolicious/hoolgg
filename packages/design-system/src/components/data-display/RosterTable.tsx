'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../primitives/Icon';
import { Badge } from '../primitives/Badge';
import styles from './RosterTable.module.css';

export type SortDirection = 'asc' | 'desc' | null;
export type PlayerStatus = 'online' | 'offline' | 'away';
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

export interface RosterMember {
  id: string;
  name: string;
  class: PlayerClass;
  spec: string;
  role: PlayerRole;
  ilvl: number;
  achievements?: number;
  status: PlayerStatus;
  joinedDate?: string;
}

export interface RosterTableProps {
  members: RosterMember[];
  onMemberClick?: (member: RosterMember) => void;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

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

const roleColors: Record<PlayerRole, string> = {
  tank: 'purple',
  healer: 'primary',
  mdps: 'destructive',
  rdps: 'warning',
};

const statusColors: Record<PlayerStatus, string> = {
  online: '#10B981',
  offline: '#6B7280',
  away: '#F59E0B',
};

/**
 * RosterTable — Displays guild member roster with sortable columns
 * Shows player names, classes, specs, roles, ilvls, and status
 *
 * Usage:
 * <RosterTable
 *   members={guildMembers}
 *   onMemberClick={(member) => setSelectedMember(member)}
 * />
 */
export const RosterTable = React.forwardRef<HTMLDivElement, RosterTableProps>(
  (
    {
      members,
      onMemberClick,
      sortBy,
      sortDirection,
      onSort,
      loading = false,
      emptyMessage = 'No members found',
      className,
    },
    ref,
  ) => {
    const handleSort = (column: string) => {
      let newDirection: SortDirection = 'asc';
      if (sortBy === column && sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortBy === column && sortDirection === 'desc') {
        newDirection = null;
      }
      onSort?.(column, newDirection);
    };

    const SortHeader = ({ column, label }: { column: string; label: string }) => (
      <button
        className={styles.sortHeader}
        onClick={() => handleSort(column)}
        type="button"
      >
        <span>{label}</span>
        {sortBy === column && sortDirection && (
          <Icon
            name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={12}
            animation="none"
          />
        )}
      </button>
    );

    return (
      <div
        ref={ref}
        className={`${styles.rosterTable} ${loading ? styles.loading : ''} ${className || ''}`}
      >
        {/* Sorting controls */}
        <div className={styles.header}>
          <SortHeader column="name" label="Name" />
          <SortHeader column="spec" label="Spec" />
          <SortHeader column="ilvl" label="iLvl" />
          <SortHeader column="role" label="Role" />
          <SortHeader column="status" label="Status" />
        </div>

        {/* Members list */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.placeholder}>
              <p>Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className={styles.placeholder}>
              <p>{emptyMessage}</p>
            </div>
          ) : (
            members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                whileHover={onMemberClick ? { y: -4 } : undefined}
              >
                <Badge
                  className={`${styles.memberBadge} ${onMemberClick ? styles.interactive : ''}`}
                  onClick={() => onMemberClick?.(member)}
                >
                  {/* Class color indicator bar */}
                  <div
                    className={styles.classBar}
                    style={{ backgroundColor: classColors[member.class] }}
                  />

                  {/* Badge content - all columns inside */}
                  <div className={styles.badgeContent}>
                    {/* Name column */}
                    <div className={styles.column}>
                      <span className={styles.name}>{member.name}</span>
                    </div>

                    {/* Spec column */}
                    <div className={styles.column}>
                      <span className={styles.spec}>{member.spec}</span>
                    </div>

                    {/* iLvl column */}
                    <div className={styles.column}>
                      <span className={styles.ilvl}>{member.ilvl}</span>
                    </div>

                    {/* Role column */}
                    <div className={styles.column}>
                      <Badge variant={roleColors[member.role] as any} size="sm">
                        {member.role.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Status column */}
                    <div className={styles.column}>
                      <div className={styles.status}>
                        <div
                          className={styles.statusDot}
                          style={{ backgroundColor: statusColors[member.status] }}
                        />
                        <span className={styles.statusText}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  },
);

RosterTable.displayName = 'RosterTable';
