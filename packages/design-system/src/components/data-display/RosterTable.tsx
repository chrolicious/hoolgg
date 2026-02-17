'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  guild?: string;
  herotalent?: string;
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

// Map each class to its Badge variant
const classBadgeVariants: Record<PlayerClass, any> = {
  warrior: 'warrior',
  paladin: 'paladin',
  hunter: 'hunter',
  rogue: 'rogue',
  priest: 'priest',
  shaman: 'shaman',
  mage: 'mage',
  warlock: 'warlock',
  druid: 'druid',
  deathknight: 'deathknight',
  demonhunter: 'demonhunter',
  evoker: 'evoker',
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
    const [selectedMember, setSelectedMember] = useState<RosterMember | null>(null);

    const handleSort = (column: string) => {
      let newDirection: SortDirection = 'asc';
      if (sortBy === column && sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortBy === column && sortDirection === 'desc') {
        newDirection = null;
      }
      onSort?.(column, newDirection);
    };

    const handleMemberClick = (member: RosterMember) => {
      setSelectedMember(selectedMember?.id === member.id ? null : member);
      onMemberClick?.(member);
    };

    return (
      <div
        ref={ref}
        className={`${styles.rosterTable} ${loading ? styles.loading : ''} ${className || ''}`}
      >
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
            members.map((member, index) => {
              const isExpanded = selectedMember?.id === member.id;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  layout
                >
                  <motion.div layout>
                  <Badge
                    variant={classBadgeVariants[member.class]}
                    className={`${styles.memberBadge} ${onMemberClick ? styles.interactive : ''}`}
                    onClick={() => handleMemberClick(member)}
                  >
                  {/* Badge content - all columns inside */}
                  <div className={styles.badgeContent}>
                    {/* Name + Guild column */}
                    <div className={styles.column}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={styles.name}>{member.name}</span>
                        {member.guild && (
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {member.guild}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spec + Hero Talent column */}
                    <div className={styles.column}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={styles.spec}>{member.spec}</span>
                        {member.herotalent && (
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {member.herotalent}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* iLvl column */}
                    <div className={styles.column}>
                      <span className={styles.ilvl}>{member.ilvl}</span>
                    </div>

                    {/* Role column */}
                    <div className={styles.column}>
                      <span className={styles.role}>
                        {member.role.toUpperCase()}
                      </span>
                    </div>

                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden', width: '100%' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--hool-space-4)', paddingTop: 'var(--hool-space-4)', paddingBottom: 'var(--hool-space-4)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', boxSizing: 'border-box' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            Class
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff' }}>
                            {member.class.charAt(0).toUpperCase() + member.class.slice(1)}
                          </div>
                        </div>
                        {member.achievements !== undefined && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Achievements
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff' }}>
                              {member.achievements}
                            </div>
                          </div>
                        )}
                        {member.joinedDate && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Joined
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff' }}>
                              {new Date(member.joinedDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {member.status && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Status
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: statusColors[member.status],
                                }}
                              />
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </Badge>
                </motion.div>
              </motion.div>
            );
            })
          )}
        </div>
      </div>
    );
  },
);

RosterTable.displayName = 'RosterTable';
