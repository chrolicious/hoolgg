'use client';

import React from 'react';
import { Card, Icon, ProgressBar } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';

export interface GearSlotPriority {
  slot: string;
  current_ilvl: number;
  target_ilvl?: number;
  item_name?: string;
  source?: string;
  upgrade_priority?: 'high' | 'medium' | 'low';
}

interface GearPriorityListProps {
  priorities: GearSlotPriority[];
  characterName: string;
}

const SLOT_DISPLAY_NAMES: Record<string, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder: 'Shoulders',
  back: 'Back',
  chest: 'Chest',
  wrist: 'Wrists',
  hands: 'Hands',
  waist: 'Waist',
  legs: 'Legs',
  feet: 'Feet',
  finger_1: 'Ring 1',
  finger_2: 'Ring 2',
  trinket_1: 'Trinket 1',
  trinket_2: 'Trinket 2',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
};

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
    default:
      return 'rgba(255, 255, 255, 0.4)';
  }
}

function getPriorityLabel(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'Urgent';
    case 'medium':
      return 'Moderate';
    case 'low':
      return 'Low';
    default:
      return 'N/A';
  }
}

function getSlotVariant(currentIlvl: number, targetIlvl: number): 'success' | 'warning' | 'danger' | 'default' {
  if (!targetIlvl) return 'default';
  const ratio = currentIlvl / targetIlvl;
  if (ratio >= 1) return 'success';
  if (ratio >= 0.9) return 'warning';
  return 'danger';
}

export function GearPriorityList({ priorities, characterName }: GearPriorityListProps) {
  if (!priorities || priorities.length === 0) {
    return (
      <FadeIn duration={0.4}>
        <Card padding="md" variant="elevated">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '2rem 1rem',
            textAlign: 'center',
          }}>
            <Icon name="check" size={32} style={{ color: '#22c55e' }} />
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              No gear upgrades needed for {characterName}. All slots are on target.
            </p>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const sortedPriorities = [...priorities].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const aOrder = priorityOrder[a.upgrade_priority || ''] ?? 3;
    const bOrder = priorityOrder[b.upgrade_priority || ''] ?? 3;
    return aOrder - bOrder;
  });

  return (
    <FadeIn duration={0.4}>
      <Card padding="md" variant="elevated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="zap" size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Gear Priorities
            </h3>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.4)',
              marginLeft: 'auto',
            }}>
              {sortedPriorities.length} slot{sortedPriorities.length !== 1 ? 's' : ''} to upgrade
            </span>
          </div>

          <StaggerGroup staggerDelay={0.05}>
            {sortedPriorities.map((slot, index) => {
              const slotName = SLOT_DISPLAY_NAMES[slot.slot] || slot.slot;
              const priorityColor = getPriorityColor(slot.upgrade_priority);
              const targetIlvl = slot.target_ilvl || slot.current_ilvl;

              return (
                <div
                  key={slot.slot}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* Priority indicator */}
                  <div style={{
                    width: 4,
                    height: 32,
                    borderRadius: 2,
                    background: priorityColor,
                    flexShrink: 0,
                  }} />

                  {/* Slot info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#ffffff',
                      }}>
                        {slotName}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: priorityColor,
                        fontWeight: 600,
                      }}>
                        {getPriorityLabel(slot.upgrade_priority)}
                      </span>
                    </div>
                    {slot.item_name && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                        margin: '0 0 0.25rem 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {slot.item_name}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {slot.current_ilvl}
                      </span>
                      <div style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.06)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${Math.min(100, (slot.current_ilvl / targetIlvl) * 100)}%`,
                          height: '100%',
                          borderRadius: 2,
                          background: priorityColor,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {targetIlvl}
                      </span>
                    </div>
                    {slot.source && (
                      <p style={{
                        fontSize: '0.6875rem',
                        color: 'rgba(255, 255, 255, 0.3)',
                        margin: '0.25rem 0 0 0',
                      }}>
                        Source: {slot.source}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </StaggerGroup>
        </div>
      </Card>
    </FadeIn>
  );
}
