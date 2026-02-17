'use client';

import React, { useState } from 'react';
import { Button, Icon, Select, Input } from '@hool/design-system';
import { motion, AnimatePresence } from 'framer-motion';

const CLASS_OPTIONS = [
  { value: '', label: 'All Classes' },
  { value: 'Warrior', label: 'Warrior' },
  { value: 'Paladin', label: 'Paladin' },
  { value: 'Hunter', label: 'Hunter' },
  { value: 'Rogue', label: 'Rogue' },
  { value: 'Priest', label: 'Priest' },
  { value: 'Shaman', label: 'Shaman' },
  { value: 'Mage', label: 'Mage' },
  { value: 'Warlock', label: 'Warlock' },
  { value: 'Druid', label: 'Druid' },
  { value: 'Death Knight', label: 'Death Knight' },
  { value: 'Demon Hunter', label: 'Demon Hunter' },
  { value: 'Evoker', label: 'Evoker' },
  { value: 'Monk', label: 'Monk' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'Tank', label: 'Tank' },
  { value: 'Healer', label: 'Healer' },
  { value: 'Melee DPS', label: 'Melee DPS' },
  { value: 'Ranged DPS', label: 'Ranged DPS' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'trial', label: 'Trial' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'candidate_name', label: 'Name' },
  { value: 'ilvl', label: 'iLvl' },
  { value: 'rating', label: 'Rating' },
  { value: 'class_name', label: 'Class' },
  { value: 'role', label: 'Role' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

export interface FilterState {
  role: string;
  class: string;
  status: string;
  minIlvl: string;
  maxIlvl: string;
  sortBy: string;
  sortOrder: string;
}

interface CandidateFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  candidateCount: number;
}

export function CandidateFilters({
  filters,
  onChange,
  candidateCount,
}: CandidateFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.role !== '' ||
    filters.class !== '' ||
    filters.status !== '' ||
    filters.minIlvl !== '' ||
    filters.maxIlvl !== '';

  const activeFilterCount = [
    filters.role,
    filters.class,
    filters.status,
    filters.minIlvl,
    filters.maxIlvl,
  ].filter(Boolean).length;

  const handleChange = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onChange({
      role: '',
      class: '',
      status: '',
      minIlvl: '',
      maxIlvl: '',
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Top controls bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant={hasActiveFilters ? 'purple' : 'secondary'}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            icon={<Icon name="filter" size={14} />}
          >
            Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              icon={<Icon name="x-mark" size={14} />}
            >
              Clear
            </Button>
          )}

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.4)',
              marginLeft: '0.25rem',
            }}
          >
            {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Sort controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="sort" size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <Select
            options={SORT_OPTIONS}
            value={filters.sortBy}
            onChange={(val) => handleChange('sortBy', val)}
            size="sm"
            variant="secondary"
          />
          <Select
            options={SORT_ORDER_OPTIONS}
            value={filters.sortOrder}
            onChange={(val) => handleChange('sortOrder', val)}
            size="sm"
            variant="secondary"
          />
        </div>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Role
                </label>
                <Select
                  options={ROLE_OPTIONS}
                  value={filters.role}
                  onChange={(val) => handleChange('role', val)}
                  size="sm"
                  variant="secondary"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Class
                </label>
                <Select
                  options={CLASS_OPTIONS}
                  value={filters.class}
                  onChange={(val) => handleChange('class', val)}
                  size="sm"
                  variant="secondary"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Status
                </label>
                <Select
                  options={STATUS_OPTIONS}
                  value={filters.status}
                  onChange={(val) => handleChange('status', val)}
                  size="sm"
                  variant="secondary"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Min iLvl
                </label>
                <Input
                  variant="default"
                  size="sm"
                  type="number"
                  placeholder="Min"
                  value={filters.minIlvl}
                  onChange={(e) => handleChange('minIlvl', e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    display: 'block',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Max iLvl
                </label>
                <Input
                  variant="default"
                  size="sm"
                  type="number"
                  placeholder="Max"
                  value={filters.maxIlvl}
                  onChange={(e) => handleChange('maxIlvl', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
