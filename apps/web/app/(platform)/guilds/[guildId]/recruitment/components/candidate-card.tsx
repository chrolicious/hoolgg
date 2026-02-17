'use client';

import React from 'react';
import { Card, Badge, Icon, Checkbox, Tooltip } from '@hool/design-system';
import { motion } from 'framer-motion';
import type { RecruitmentCandidate } from '../../../../../lib/types';

// WoW class name → design system badge variant mapping
const CLASS_VARIANT_MAP: Record<string, string> = {
  warrior: 'warrior',
  paladin: 'paladin',
  hunter: 'hunter',
  rogue: 'rogue',
  priest: 'priest',
  shaman: 'shaman',
  mage: 'mage',
  warlock: 'warlock',
  druid: 'druid',
  'death knight': 'deathknight',
  deathknight: 'deathknight',
  'demon hunter': 'demonhunter',
  demonhunter: 'demonhunter',
  evoker: 'evoker',
  monk: 'primary',
};

const ROLE_ICONS: Record<string, string> = {
  tank: 'shield',
  healer: 'plus',
  'melee dps': 'target',
  'ranged dps': 'target',
  dps: 'target',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  interviewing: '#8b5cf6',
  trial: '#06b6d4',
  accepted: '#22c55e',
  declined: '#ef4444',
  rejected: '#ef4444',
  archived: '#6b7280',
};

function getClassVariant(className: string): string {
  const normalized = className?.toLowerCase().trim() || '';
  return CLASS_VARIANT_MAP[normalized] || 'secondary';
}

function getRoleIcon(role: string): string {
  const normalized = role?.toLowerCase().trim() || '';
  return ROLE_ICONS[normalized] || 'user';
}

function getStatusColor(status: string): string {
  const normalized = status?.toLowerCase().trim() || '';
  return STATUS_COLORS[normalized] || '#6b7280';
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          style={{
            color: star <= rating ? '#FFD700' : 'rgba(255, 255, 255, 0.15)',
          }}
        />
      ))}
    </div>
  );
}

interface CandidateCardProps {
  candidate: RecruitmentCandidate;
  onClick: (candidate: RecruitmentCandidate) => void;
  isSelected?: boolean;
  onSelectToggle?: (candidateId: string) => void;
  compact?: boolean;
}

export function CandidateCard({
  candidate,
  onClick,
  isSelected = false,
  onSelectToggle,
  compact = false,
}: CandidateCardProps) {
  const classVariant = getClassVariant(candidate.class_name);
  const roleIcon = getRoleIcon(candidate.role);
  const statusColor = getStatusColor(candidate.status);

  const timeAgo = getTimeAgo(candidate.created_at);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ cursor: 'pointer' }}
    >
      <Card padding={compact ? 'sm' : 'md'} variant="elevated">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          {/* Checkbox for comparison */}
          {onSelectToggle && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{ flexShrink: 0, marginTop: 2 }}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => onSelectToggle(candidate.id)}
                size="sm"
                variant="primary"
              />
            </div>
          )}

          {/* Main content */}
          <div
            style={{ flex: 1, minWidth: 0 }}
            onClick={() => onClick(candidate)}
          >
            {/* Top row: name + class badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '0.375rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {candidate.candidate_name}
              </span>
              {candidate.class_name && (
                <Badge variant={classVariant as any} size="sm">
                  {candidate.class_name}
                </Badge>
              )}
            </div>

            {/* Info row: role, ilvl, source */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '0.375rem',
              }}
            >
              {candidate.role && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Icon name={roleIcon} size={14} />
                  {candidate.role}
                </span>
              )}
              {candidate.ilvl > 0 && (
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  iLvl {candidate.ilvl}
                </span>
              )}
              {candidate.source && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  via {candidate.source}
                </span>
              )}
            </div>

            {/* Bottom row: rating + status + time */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {candidate.rating > 0 && (
                  <StarRating rating={candidate.rating} size={12} />
                )}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: statusColor,
                    textTransform: 'capitalize',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: statusColor,
                      flexShrink: 0,
                    }}
                  />
                  {candidate.status}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'rgba(255, 255, 255, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {timeAgo}
              </span>
            </div>

            {/* Notes preview */}
            {!compact && candidate.notes && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  margin: '0.375rem 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}
              >
                {candidate.notes}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Kanban-optimized mini card for pipeline view
export function CandidateKanbanCard({
  candidate,
  onClick,
}: {
  candidate: RecruitmentCandidate;
  onClick: (candidate: RecruitmentCandidate) => void;
}) {
  const classVariant = getClassVariant(candidate.class_name);
  const roleIcon = getRoleIcon(candidate.role);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onClick(candidate)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          padding: '0.625rem 0.75rem',
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#ffffff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {candidate.candidate_name}
          </span>
          {candidate.ilvl > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                whiteSpace: 'nowrap',
              }}
            >
              {candidate.ilvl}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {candidate.class_name && (
            <Badge variant={classVariant as any} size="sm">
              {candidate.class_name}
            </Badge>
          )}
          {candidate.role && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.125rem',
                fontSize: '0.6875rem',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Icon name={roleIcon} size={10} />
              {candidate.role}
            </span>
          )}
        </div>
        {candidate.rating > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
            <StarRating rating={candidate.rating} size={10} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { StarRating, getClassVariant, getStatusColor, getRoleIcon };

function getTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}
