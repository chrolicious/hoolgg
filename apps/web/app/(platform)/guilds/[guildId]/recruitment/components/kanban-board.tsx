'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Icon, Select, Badge } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { recruitmentApi } from '../../../../../lib/api';
import { useGuild } from '../../../../../lib/guild-context';
import { ErrorMessage } from '../../../../../components/error-message';
import { ListSkeleton, StatCardSkeleton } from '../../../../../components/loading-skeleton';
import type { RecruitmentCandidate, RecruitmentCategory } from '../../../../../lib/types';
import { CandidateKanbanCard, getClassVariant } from './candidate-card';

interface PipelineColumn {
  category: {
    id: string;
    category_name: string;
    custom: boolean;
  };
  candidates: RecruitmentCandidate[];
  count: number;
}

interface PipelineResponse {
  pipeline: PipelineColumn[];
}

interface KanbanBoardProps {
  onCandidateClick: (candidate: RecruitmentCandidate) => void;
  refreshTrigger: number;
}

const COLUMN_COLORS: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  interviewing: '#8b5cf6',
  trial: '#06b6d4',
  accepted: '#22c55e',
  declined: '#ef4444',
  rejected: '#ef4444',
  archived: '#6b7280',
};

function getColumnColor(categoryName: string): string {
  const normalized = categoryName?.toLowerCase().trim() || '';
  return COLUMN_COLORS[normalized] || '#8b5cf6';
}

export function KanbanBoard({ onCandidateClick, refreshTrigger }: KanbanBoardProps) {
  const { guildId } = useGuild();

  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingCandidate, setMovingCandidate] = useState<{
    candidateId: string;
    currentColumn: string;
  } | null>(null);
  const [targetCategory, setTargetCategory] = useState('');

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruitmentApi.get<PipelineResponse>(
        `/guilds/${guildId}/recruitment/pipeline`
      );
      setPipeline(data.pipeline || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pipeline.');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline, refreshTrigger]);

  const handleMoveCandidate = useCallback(
    async (candidateId: string, categoryId: string) => {
      try {
        await recruitmentApi.put(
          `/guilds/${guildId}/recruitment/candidates/${candidateId}/status`,
          { category_id: categoryId }
        );
        await fetchPipeline();
      } catch {
        // Silent fail
      }
      setMovingCandidate(null);
      setTargetCategory('');
    },
    [guildId, fetchPipeline]
  );

  if (isLoading) {
    return (
      <FadeIn duration={0.3}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <StatCardSkeleton />
              <div style={{ marginTop: '0.5rem' }}>
                <ListSkeleton items={3} />
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPipeline} />;
  }

  if (pipeline.length === 0) {
    return (
      <FadeIn duration={0.3}>
        <Card padding="lg" variant="default">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'center',
              padding: '2rem 0',
            }}
          >
            <Icon name="chart" size={36} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
              }}
            >
              No pipeline categories found. Set up categories in recruitment settings.
            </p>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const categoryOptions = pipeline.map((col) => ({
    value: col.category.id,
    label: col.category.category_name,
  }));

  return (
    <FadeIn duration={0.4}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          minHeight: 400,
        }}
      >
        {pipeline.map((column) => {
          const color = getColumnColor(column.category.category_name);

          return (
            <div
              key={column.category.id}
              style={{
                minWidth: 280,
                maxWidth: 320,
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: '10px 10px 0 0',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderBottom: `2px solid ${color}`,
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
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      textTransform: 'capitalize',
                    }}
                  >
                    {column.category.category_name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 10,
                  }}
                >
                  {column.count}
                </span>
              </div>

              {/* Column body */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0 0 10px 10px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderTop: 'none',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  overflowY: 'auto',
                  maxHeight: 500,
                }}
              >
                {column.candidates.length === 0 && (
                  <div
                    style={{
                      padding: '1.5rem 0.75rem',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.2)',
                      fontStyle: 'italic',
                    }}
                  >
                    No candidates
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {column.candidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ position: 'relative' }}>
                        <CandidateKanbanCard
                          candidate={candidate}
                          onClick={onCandidateClick}
                        />

                        {/* Move button */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                          }}
                        >
                          {movingCandidate?.candidateId === candidate.id ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Select
                                options={categoryOptions.filter(
                                  (o) => o.value !== column.category.id
                                )}
                                value={targetCategory}
                                onChange={(val) => {
                                  setTargetCategory(val);
                                  handleMoveCandidate(candidate.id, val);
                                }}
                                size="sm"
                                variant="primary"
                                placeholder="Move to..."
                              />
                              <button
                                onClick={() => setMovingCandidate(null)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  border: 'none',
                                  borderRadius: 4,
                                  padding: '2px 4px',
                                  cursor: 'pointer',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  fontSize: '0.6875rem',
                                }}
                              >
                                <Icon name="x-mark" size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMovingCandidate({
                                  candidateId: candidate.id,
                                  currentColumn: column.category.id,
                                });
                                setTargetCategory('');
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                borderRadius: 4,
                                padding: '3px 5px',
                                cursor: 'pointer',
                                color: 'rgba(255, 255, 255, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                              }}
                              aria-label="Move candidate"
                            >
                              <Icon name="arrow-right" size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
