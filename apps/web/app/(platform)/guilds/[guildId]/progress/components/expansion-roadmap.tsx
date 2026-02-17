'use client';

import React from 'react';
import { Card, Icon, ProgressBar } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import { motion } from 'framer-motion';

export interface RoadmapWeek {
  expansion_id: number;
  week: number;
  ilvl_target: number;
}

interface ExpansionRoadmapProps {
  weeks: RoadmapWeek[];
  currentWeek: number;
  currentIlvl?: number;
  expansionId?: number;
}

export function ExpansionRoadmap({
  weeks,
  currentWeek,
  currentIlvl,
  expansionId,
}: ExpansionRoadmapProps) {
  if (!weeks || weeks.length === 0) {
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
            <Icon name="chart" size={32} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              No expansion roadmap data available. Your Guild Master can set weekly iLvl targets in the settings.
            </p>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const sortedWeeks = [...weeks].sort((a, b) => a.week - b.week);
  const maxIlvl = Math.max(...sortedWeeks.map(w => w.ilvl_target));
  const minIlvl = Math.min(...sortedWeeks.map(w => w.ilvl_target));
  const ilvlRange = maxIlvl - minIlvl || 1;

  const currentTarget = sortedWeeks.find(w => w.week === currentWeek);

  return (
    <FadeIn duration={0.4}>
      <Card padding="md" variant="elevated">
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
              <Icon name="chart" size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Expansion Roadmap
              </h3>
            </div>
            {currentTarget && (
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Week {currentWeek} Target: {currentTarget.ilvl_target} iLvl
              </span>
            )}
          </div>

          {/* Current week progress */}
          {currentTarget && currentIlvl !== undefined && (
            <ProgressBar
              label={`Week ${currentWeek} Progress`}
              value={currentIlvl}
              max={currentTarget.ilvl_target}
              variant={currentIlvl >= currentTarget.ilvl_target ? 'success' : currentIlvl >= currentTarget.ilvl_target * 0.9 ? 'warning' : 'danger'}
              showPercentage
              showValue
              animated
            />
          )}

          {/* Roadmap visualization */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
            height: 120,
            padding: '0 0.25rem',
          }}>
            {sortedWeeks.map((week, index) => {
              const heightPercent = ((week.ilvl_target - minIlvl) / ilvlRange) * 80 + 20;
              const isCurrent = week.week === currentWeek;
              const isPast = week.week < currentWeek;
              const isFuture = week.week > currentWeek;

              let barColor = 'rgba(255, 255, 255, 0.08)';
              if (isCurrent) barColor = '#8b5cf6';
              else if (isPast) barColor = 'rgba(139, 92, 246, 0.3)';
              else barColor = 'rgba(255, 255, 255, 0.06)';

              return (
                <div
                  key={week.week}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 0,
                  }}
                >
                  {/* iLvl label on hover area */}
                  {isCurrent && (
                    <span style={{
                      fontSize: '0.625rem',
                      color: '#a78bfa',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {week.ilvl_target}
                    </span>
                  )}

                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: index * 0.03, ease: 'easeOut' }}
                    style={{
                      width: '100%',
                      borderRadius: 4,
                      background: barColor,
                      position: 'relative',
                      minHeight: 4,
                      border: isCurrent ? '1px solid rgba(139, 92, 246, 0.4)' : 'none',
                    }}
                  >
                    {/* Current week indicator dot */}
                    {isCurrent && currentIlvl !== undefined && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                        style={{
                          position: 'absolute',
                          top: `${Math.max(0, Math.min(100, 100 - ((currentIlvl - minIlvl) / ilvlRange) * 100))}%`,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: currentIlvl >= week.ilvl_target ? '#22c55e' : '#ef4444',
                          border: '2px solid rgba(0, 0, 0, 0.3)',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Week label */}
                  <span style={{
                    fontSize: '0.5625rem',
                    color: isCurrent ? '#a78bfa' : 'rgba(255, 255, 255, 0.3)',
                    fontWeight: isCurrent ? 700 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    W{week.week}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            fontSize: '0.6875rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(139, 92, 246, 0.3)' }} />
              <span>Past</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#8b5cf6' }} />
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255, 255, 255, 0.06)' }} />
              <span>Future</span>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
