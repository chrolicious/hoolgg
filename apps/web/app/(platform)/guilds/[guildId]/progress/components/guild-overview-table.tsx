'use client';

import React, { useState, useMemo } from 'react';
import { RosterTable, Select, Card, Icon, Button } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import type { RosterMember, PlayerClass, PlayerRole, SortDirection } from '@hool/design-system';

export interface GuildMemberProgress {
  character_name: string;
  realm?: string;
  class_name: string;
  spec: string;
  role: string;
  current_ilvl: number;
  target_ilvl: number;
  status: 'ahead' | 'behind' | 'unknown';
  last_updated?: string;
}

interface GuildOverviewTableProps {
  members: GuildMemberProgress[];
  targetIlvl: number;
  currentWeek: number;
  onMemberClick?: (member: GuildMemberProgress) => void;
  isLoading?: boolean;
}

function normalizeClassName(className: string): PlayerClass {
  const normalized = className.toLowerCase().replace(/[\s_-]/g, '');
  const classMap: Record<string, PlayerClass> = {
    warrior: 'warrior', paladin: 'paladin', hunter: 'hunter',
    rogue: 'rogue', priest: 'priest', shaman: 'shaman',
    mage: 'mage', warlock: 'warlock', druid: 'druid',
    deathknight: 'deathknight', demonhunter: 'demonhunter', evoker: 'evoker',
  };
  return classMap[normalized] || 'warrior';
}

function normalizeRole(role: string): PlayerRole {
  const normalized = role.toLowerCase();
  if (normalized === 'tank') return 'tank';
  if (normalized === 'healer' || normalized === 'heal') return 'healer';
  if (normalized === 'mdps' || normalized === 'melee') return 'mdps';
  return 'rdps';
}

const CLASS_OPTIONS = [
  { value: '', label: 'All Classes' },
  { value: 'warrior', label: 'Warrior' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'hunter', label: 'Hunter' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'priest', label: 'Priest' },
  { value: 'shaman', label: 'Shaman' },
  { value: 'mage', label: 'Mage' },
  { value: 'warlock', label: 'Warlock' },
  { value: 'druid', label: 'Druid' },
  { value: 'deathknight', label: 'Death Knight' },
  { value: 'demonhunter', label: 'Demon Hunter' },
  { value: 'evoker', label: 'Evoker' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'tank', label: 'Tank' },
  { value: 'healer', label: 'Healer' },
  { value: 'mdps', label: 'Melee DPS' },
  { value: 'rdps', label: 'Ranged DPS' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ahead', label: 'On Track' },
  { value: 'behind', label: 'Behind' },
  { value: 'unknown', label: 'Unknown' },
];

const SORT_OPTIONS = [
  { value: 'ilvl-desc', label: 'Highest iLvl' },
  { value: 'ilvl-asc', label: 'Lowest iLvl' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'status-behind', label: 'Behind First' },
  { value: 'status-ahead', label: 'On Track First' },
];

export function GuildOverviewTable({
  members,
  targetIlvl,
  currentWeek,
  onMemberClick,
  isLoading = false,
}: GuildOverviewTableProps) {
  const [classFilter, setClassFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortValue, setSortValue] = useState('ilvl-desc');
  const [sortBy, setSortBy] = useState<string>('ilvl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSorted = useMemo(() => {
    let result = [...members];

    // Apply filters
    if (classFilter) {
      result = result.filter(m =>
        m.class_name.toLowerCase().replace(/[\s_-]/g, '') === classFilter
      );
    }
    if (roleFilter) {
      result = result.filter(m => normalizeRole(m.role) === roleFilter);
    }
    if (statusFilter) {
      result = result.filter(m => m.status === statusFilter);
    }

    // Apply sorting
    const [sortField, sortDir] = sortValue.split('-');
    result.sort((a, b) => {
      if (sortField === 'ilvl') {
        return sortDir === 'desc'
          ? b.current_ilvl - a.current_ilvl
          : a.current_ilvl - b.current_ilvl;
      }
      if (sortField === 'name') {
        const cmp = a.character_name.localeCompare(b.character_name);
        return sortDir === 'desc' ? -cmp : cmp;
      }
      if (sortField === 'status') {
        const statusOrder: Record<string, number> = { behind: 0, unknown: 1, ahead: 2 };
        const aOrder = statusOrder[a.status] ?? 1;
        const bOrder = statusOrder[b.status] ?? 1;
        return sortDir === 'behind'
          ? aOrder - bOrder
          : bOrder - aOrder;
      }
      return 0;
    });

    return result;
  }, [members, classFilter, roleFilter, statusFilter, sortValue]);

  const rosterMembers: RosterMember[] = filteredAndSorted.map((m, idx) => ({
    id: `${m.character_name}-${idx}`,
    name: m.character_name,
    class: normalizeClassName(m.class_name),
    spec: m.spec || 'Unknown',
    role: normalizeRole(m.role),
    ilvl: m.current_ilvl,
    status: 'online' as const,
    guild: m.realm,
  }));

  const memberLookup = useMemo(() => {
    const map = new Map<string, GuildMemberProgress>();
    filteredAndSorted.forEach((m, idx) => {
      map.set(`${m.character_name}-${idx}`, m);
    });
    return map;
  }, [filteredAndSorted]);

  const handleMemberClick = (rosterMember: RosterMember) => {
    const original = memberLookup.get(rosterMember.id);
    if (original && onMemberClick) {
      onMemberClick(original);
    }
  };

  const handleSort = (column: string, direction: SortDirection) => {
    setSortBy(column);
    setSortDirection(direction);
    if (column === 'ilvl' && direction) {
      setSortValue(`ilvl-${direction}`);
    } else if (column === 'name' && direction) {
      setSortValue(`name-${direction}`);
    }
  };

  const behindCount = members.filter(m => m.status === 'behind').length;
  const aheadCount = members.filter(m => m.status === 'ahead').length;

  return (
    <FadeIn duration={0.4}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="user" size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Guild Roster
            </h3>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              ({filteredAndSorted.length} of {members.length})
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: '#22c55e' }}>{aheadCount} on track</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: '#ef4444' }}>{behindCount} behind</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 140 }}>
            <Select
              options={CLASS_OPTIONS}
              value={classFilter}
              onChange={setClassFilter}
              size="sm"
              label="Class"
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <Select
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={setRoleFilter}
              size="sm"
              label="Role"
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm"
              label="Status"
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <Select
              options={SORT_OPTIONS}
              value={sortValue}
              onChange={setSortValue}
              size="sm"
              label="Sort By"
            />
          </div>
        </div>

        {/* Table */}
        <RosterTable
          members={rosterMembers}
          onMemberClick={handleMemberClick}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={isLoading}
          emptyMessage={
            classFilter || roleFilter || statusFilter
              ? 'No members match your filters. Try adjusting the criteria.'
              : 'No member progress data available yet.'
          }
        />
      </div>
    </FadeIn>
  );
}
