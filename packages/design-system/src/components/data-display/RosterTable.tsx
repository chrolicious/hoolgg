'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../primitives/Icon';
import { Badge } from '../primitives/Badge';
import { Modal } from '../surfaces/Modal';
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
      setSelectedMember(member);
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
            members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                whileHover={onMemberClick ? { y: -4 } : undefined}
              >
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
                </Badge>
              </motion.div>
            ))
          )}
        </div>

        {/* Member detail modal */}
        {selectedMember && (
          <Modal
            isOpen={!!selectedMember}
            onClose={() => setSelectedMember(null)}
            title={selectedMember.name}
            subtitle={selectedMember.class.charAt(0).toUpperCase() + selectedMember.class.slice(1)}
            size="md"
            padding="lg"
            gradientVariant="purple-pink"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Class and Spec */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Class
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                    {selectedMember.class.charAt(0).toUpperCase() + selectedMember.class.slice(1)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Spec
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                    {selectedMember.spec}
                  </div>
                </div>
              </div>

              {/* Role and iLvl */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Role
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: classColors[selectedMember.class], marginTop: '4px' }}>
                    {selectedMember.role.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    iLvl
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                    {selectedMember.ilvl}
                  </div>
                </div>
              </div>

              {/* Status and Achievements */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Status
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: statusColors[selectedMember.status],
                      }}
                    />
                    {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                  </div>
                </div>
                {selectedMember.achievements !== undefined && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Achievements
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                      {selectedMember.achievements}
                    </div>
                  </div>
                )}
              </div>

              {/* Joined Date */}
              {selectedMember.joinedDate && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Joined
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>
                    {new Date(selectedMember.joinedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    );
  },
);

RosterTable.displayName = 'RosterTable';
