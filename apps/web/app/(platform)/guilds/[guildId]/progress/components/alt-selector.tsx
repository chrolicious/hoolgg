'use client';

import React from 'react';
import { Badge, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import { motion } from 'framer-motion';
import type { PlayerClass } from '@hool/design-system';

export interface AltCharacter {
  character_name: string;
  class_name: string;
  spec?: string;
  current_ilvl?: number;
  realm?: string;
}

interface AltSelectorProps {
  characters: AltCharacter[];
  selectedCharacter: string;
  onSelect: (characterName: string) => void;
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

const CLASS_COLORS: Record<PlayerClass, string> = {
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

export function AltSelector({
  characters,
  selectedCharacter,
  onSelect,
}: AltSelectorProps) {
  if (characters.length <= 1) return null;

  return (
    <FadeIn duration={0.3}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Icon name="user" size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Your Characters ({characters.length})
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          {characters.map((char) => {
            const playerClass = normalizeClassName(char.class_name);
            const isSelected = char.character_name === selectedCharacter;
            const classColor = CLASS_COLORS[playerClass];

            return (
              <motion.button
                key={char.character_name}
                onClick={() => onSelect(char.character_name)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 10,
                  border: isSelected
                    ? `2px solid ${classColor}`
                    : '2px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected
                    ? `${classColor}10`
                    : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Class color dot */}
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: classColor,
                  flexShrink: 0,
                }} />

                {/* Character info */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? classColor : 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.2,
                  }}>
                    {char.character_name}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    lineHeight: 1.2,
                  }}>
                    {char.spec || playerClass}{char.current_ilvl ? ` - ${char.current_ilvl}` : ''}
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <Icon name="check" size={14} style={{ color: classColor }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
