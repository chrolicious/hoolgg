'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Icon, ProgressBar, StatCard } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { motion } from 'framer-motion';
import { recruitmentApi } from '../../../../../lib/api';
import { useGuild } from '../../../../../lib/guild-context';
import { ErrorMessage } from '../../../../../components/error-message';
import { StatCardSkeleton, ListSkeleton } from '../../../../../components/loading-skeleton';
import type { RecruitmentCandidate } from '../../../../../lib/types';
import { getClassVariant, StarRating } from './candidate-card';

interface CompositionResponse {
  composition: Record<string, RecruitmentCandidate[]>;
  summary: Record<string, number>;
  total_candidates: number;
}

// Recommended raid comp targets for a 20-person raid
const ROLE_TARGETS: Record<string, { target: number; icon: string; color: string }> = {
  Tank: { target: 2, icon: 'shield', color: '#3b82f6' },
  Healer: { target: 4, icon: 'plus', color: '#22c55e' },
  'Melee DPS': { target: 7, icon: 'target', color: '#ef4444' },
  'Ranged DPS': { target: 7, icon: 'target', color: '#f59e0b' },
};

interface RaidCompositionProps {
  onCandidateClick: (candidate: RecruitmentCandidate) => void;
  refreshTrigger: number;
}

export function RaidComposition({
  onCandidateClick,
  refreshTrigger,
}: RaidCompositionProps) {
  const { guildId } = useGuild();

  const [composition, setComposition] = useState<Record<string, RecruitmentCandidate[]>>({});
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComposition = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruitmentApi.get<CompositionResponse>(
        `/guilds/${guildId}/recruitment/composition`
      );
      setComposition(data.composition || {});
      setSummary(data.summary || {});
      setTotalCandidates(data.total_candidates || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load raid composition.');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchComposition();
  }, [fetchComposition, refreshTrigger]);

  if (isLoading) {
    return (
      <FadeIn duration={0.3}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <ListSkeleton items={4} />
        </div>
      </FadeIn>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchComposition} />;
  }

  const roles = Object.keys(ROLE_TARGETS);

  return (
    <FadeIn duration={0.4}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Role summary stats */}
        <StaggerGroup staggerDelay={0.08}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {roles.map((role) => {
              const config = ROLE_TARGETS[role];
              const count = summary[role] || 0;
              const isFilled = count >= config.target;

              return (
                <StatCard
                  key={role}
                  label={role}
                  value={`${count} / ${config.target}`}
                  icon={
                    <Icon
                      name={config.icon}
                      size={20}
                      style={{ color: config.color }}
                    />
                  }
                  variant={isFilled ? 'success' : count > 0 ? 'warning' : 'danger'}
                  subtitle={
                    isFilled
                      ? 'Filled'
                      : `Need ${config.target - count} more`
                  }
                />
              );
            })}
          </div>
        </StaggerGroup>

        {/* Overall progress */}
        <Card padding="md" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Raid Roster Coverage
              </h3>
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {totalCandidates} total candidates
              </span>
            </div>

            {roles.map((role) => {
              const config = ROLE_TARGETS[role];
              const count = summary[role] || 0;
              const variant =
                count >= config.target
                  ? 'success'
                  : count > 0
                  ? 'warning'
                  : 'danger';

              return (
                <ProgressBar
                  key={role}
                  label={role}
                  value={count}
                  max={config.target}
                  variant={variant as any}
                  showPercentage
                  showValue
                  animated
                />
              );
            })}
          </div>
        </Card>

        {/* Detailed composition per role */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {roles.map((role) => {
            const config = ROLE_TARGETS[role];
            const candidates = composition[role] || [];
            const gapCount = Math.max(0, config.target - candidates.length);

            return (
              <Card key={role} padding="md" variant="default">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Role header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: `${config.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name={config.icon} size={16} style={{ color: config.color }} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {role}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color:
                          candidates.length >= config.target
                            ? '#22c55e'
                            : 'rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      {candidates.length}/{config.target}
                    </span>
                  </div>

                  {/* Candidate list */}
                  {candidates.length === 0 && (
                    <div
                      style={{
                        padding: '1rem 0',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.2)',
                        fontStyle: 'italic',
                      }}
                    >
                      No candidates for this role
                    </div>
                  )}

                  {candidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      onClick={() => onCandidateClick(candidate)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {candidate.candidate_name}
                        </span>
                        {candidate.class_name && (
                          <Badge
                            variant={getClassVariant(candidate.class_name) as any}
                            size="sm"
                          >
                            {candidate.class_name}
                          </Badge>
                        )}
                        {candidate.ilvl > 0 && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: 'rgba(255, 255, 255, 0.4)',
                            }}
                          >
                            {candidate.ilvl}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Show gaps as placeholder slots */}
                  {gapCount > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {Array.from({ length: gapCount }).map((_, i) => (
                        <div
                          key={`gap-${i}`}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 6,
                            border: '1px dashed rgba(255, 255, 255, 0.08)',
                            textAlign: 'center',
                            fontSize: '0.6875rem',
                            color: 'rgba(255, 255, 255, 0.15)',
                            fontStyle: 'italic',
                          }}
                        >
                          Open slot
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
