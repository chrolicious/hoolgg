'use client';

import React from 'react';
import { PlayerCard, ProgressBar, Badge, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import type { PlayerClass, PlayerRole } from '@hool/design-system';

export interface CharacterProgressData {
  character_name: string;
  class_name: string;
  spec: string;
  role: string;
  current_ilvl: number;
  target_ilvl: number;
  status: 'ahead' | 'behind' | 'unknown';
  message?: string;
  realm?: string;
  guild?: string;
}

interface CharacterProgressCardProps {
  character: CharacterProgressData;
  isSelected?: boolean;
  onClick?: () => void;
}

function normalizeClassName(className: string): PlayerClass {
  const normalized = className.toLowerCase().replace(/[\s_-]/g, '');
  const classMap: Record<string, PlayerClass> = {
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
  return classMap[normalized] || 'warrior';
}

function normalizeRole(role: string): PlayerRole {
  const normalized = role.toLowerCase();
  if (normalized === 'tank') return 'tank';
  if (normalized === 'healer' || normalized === 'heal') return 'healer';
  if (normalized === 'mdps' || normalized === 'melee') return 'mdps';
  return 'rdps';
}

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'ahead':
      return 'success';
    case 'behind':
      return 'danger';
    default:
      return 'default';
  }
}

function getProgressVariant(current: number, target: number): 'success' | 'warning' | 'danger' | 'highlight' {
  const ratio = current / target;
  if (ratio >= 1) return 'success';
  if (ratio >= 0.9) return 'highlight';
  if (ratio >= 0.75) return 'warning';
  return 'danger';
}

export function CharacterProgressCard({
  character,
  isSelected,
  onClick,
}: CharacterProgressCardProps) {
  const playerClass = normalizeClassName(character.class_name);
  const playerRole = normalizeRole(character.role);
  const progressVariant = getProgressVariant(character.current_ilvl, character.target_ilvl);
  const statusVariant = getStatusVariant(character.status);

  return (
    <FadeIn duration={0.4}>
      <div
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          border: isSelected ? '2px solid rgba(139, 92, 246, 0.6)' : '2px solid transparent',
          borderRadius: 16,
          transition: 'border-color 0.2s ease',
        }}
      >
        <PlayerCard
          name={character.character_name}
          class={playerClass}
          spec={character.spec || 'Unknown'}
          role={playerRole}
          ilvl={character.current_ilvl}
          realm={character.realm}
          guild={character.guild}
        />
        <div style={{ padding: '0 1rem 1rem' }}>
          <ProgressBar
            label="iLvl Progress"
            value={character.current_ilvl}
            max={character.target_ilvl}
            variant={progressVariant}
            showPercentage
            showValue
            animated
            subtitle={character.message || `Target: ${character.target_ilvl}`}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant={statusVariant === 'default' ? 'secondary' : statusVariant === 'success' ? 'primary' : 'destructive'} size="sm">
              {character.status === 'ahead' ? 'On Track' : character.status === 'behind' ? 'Behind' : 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export { normalizeClassName, normalizeRole, getStatusVariant, getProgressVariant };
