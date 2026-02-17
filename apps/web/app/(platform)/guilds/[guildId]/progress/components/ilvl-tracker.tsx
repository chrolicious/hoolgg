'use client';

import React from 'react';
import { ProgressBar, Card, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';

interface IlvlTrackerProps {
  currentIlvl: number;
  targetIlvl: number;
  characterName: string;
  className?: string;
}

function getProgressVariant(current: number, target: number): 'success' | 'warning' | 'danger' | 'highlight' {
  const ratio = current / target;
  if (ratio >= 1) return 'success';
  if (ratio >= 0.9) return 'highlight';
  if (ratio >= 0.75) return 'warning';
  return 'danger';
}

export function IlvlTracker({
  currentIlvl,
  targetIlvl,
  characterName,
  className,
}: IlvlTrackerProps) {
  const variant = getProgressVariant(currentIlvl, targetIlvl);
  const difference = currentIlvl - targetIlvl;
  const isAhead = difference >= 0;

  return (
    <FadeIn duration={0.4}>
      <Card padding="md" variant="elevated" className={className}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="target" size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                iLvl Tracker
              </h3>
            </div>
            <span style={{
              fontSize: '0.75rem',
              color: isAhead ? '#22c55e' : '#ef4444',
              fontWeight: 600,
            }}>
              {isAhead ? '+' : ''}{difference} iLvl
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
                {currentIlvl}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '0.25rem' }}>
                current
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
                {targetIlvl}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginLeft: '0.25rem' }}>
                target
              </span>
            </div>
          </div>

          <ProgressBar
            label={`${characterName} Progress`}
            value={currentIlvl}
            max={targetIlvl}
            variant={variant}
            showPercentage
            showValue={false}
            animated
          />
        </div>
      </Card>
    </FadeIn>
  );
}
