'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Badge, Icon, Button } from '@hool/design-system';
import { recruitmentApi } from '../../../../../lib/api';
import { useGuild } from '../../../../../lib/guild-context';
import type { RecruitmentCandidate } from '../../../../../lib/types';
import { StarRating, getClassVariant, getStatusColor } from './candidate-card';

interface ComparisonTableProps {
  candidateIds: string[];
  onClose: () => void;
}

export function ComparisonTable({ candidateIds, onClose }: ComparisonTableProps) {
  const { guildId } = useGuild();
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const idsParam = candidateIds.join(',');
      const data = await recruitmentApi.get<{
        candidates: RecruitmentCandidate[];
        count: number;
      }>(`/guilds/${guildId}/recruitment/compare`, {
        params: { candidate_ids: idsParam },
      });
      setCandidates(data.candidates || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison data.');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, candidateIds]);

  useEffect(() => {
    if (candidateIds.length >= 2) {
      fetchComparison();
    }
  }, [fetchComparison, candidateIds.length]);

  const fields: Array<{
    label: string;
    key: string;
    render?: (candidate: RecruitmentCandidate) => React.ReactNode;
  }> = [
    {
      label: 'Class',
      key: 'class_name',
      render: (c) =>
        c.class_name ? (
          <Badge variant={getClassVariant(c.class_name) as any} size="sm">
            {c.class_name}
          </Badge>
        ) : (
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>--</span>
        ),
    },
    { label: 'Role', key: 'role' },
    {
      label: 'iLvl',
      key: 'ilvl',
      render: (c) => (
        <span
          style={{
            fontWeight: 700,
            color: c.ilvl > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {c.ilvl > 0 ? c.ilvl : '--'}
        </span>
      ),
    },
    {
      label: 'Rating',
      key: 'rating',
      render: (c) =>
        c.rating > 0 ? (
          <StarRating rating={c.rating} size={14} />
        ) : (
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Unrated</span>
        ),
    },
    {
      label: 'Status',
      key: 'status',
      render: (c) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: getStatusColor(c.status),
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: getStatusColor(c.status),
            }}
          />
          {c.status}
        </span>
      ),
    },
    { label: 'Source', key: 'source' },
    {
      label: 'Notes',
      key: 'notes',
      render: (c) => (
        <span
          style={{
            fontSize: '0.75rem',
            color: c.notes
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(255, 255, 255, 0.2)',
            fontStyle: c.notes ? 'normal' : 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {c.notes || 'No notes'}
        </span>
      ),
    },
    {
      label: 'Added',
      key: 'created_at',
      render: (c) => (
        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
          {formatShortDate(c.created_at)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Compare Candidates"
      subtitle={`Comparing ${candidateIds.length} candidates`}
      size="xl"
      gradientVariant="blue-purple"
    >
      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '2rem 0',
            textAlign: 'center',
          }}
        >
          <Icon name="alert-circle" size={32} style={{ color: '#ef4444' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>{error}</p>
          <Button variant="primary" size="sm" onClick={fetchComparison}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && candidates.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: candidates.length * 180 + 120,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    position: 'sticky',
                    left: 0,
                    background: 'rgba(14, 11, 18, 0.95)',
                    zIndex: 1,
                    minWidth: 100,
                  }}
                >
                  Field
                </th>
                {candidates.map((candidate) => (
                  <th
                    key={candidate.id}
                    style={{
                      textAlign: 'left',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      minWidth: 160,
                    }}
                  >
                    {candidate.candidate_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => {
                // Highlight best ilvl
                const maxIlvl =
                  field.key === 'ilvl'
                    ? Math.max(...candidates.map((c) => c.ilvl || 0))
                    : 0;
                const maxRating =
                  field.key === 'rating'
                    ? Math.max(...candidates.map((c) => c.rating || 0))
                    : 0;

                return (
                  <tr key={field.key}>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.5)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        position: 'sticky',
                        left: 0,
                        background: 'rgba(14, 11, 18, 0.95)',
                        zIndex: 1,
                      }}
                    >
                      {field.label}
                    </td>
                    {candidates.map((candidate) => {
                      const isBest =
                        (field.key === 'ilvl' &&
                          candidate.ilvl > 0 &&
                          candidate.ilvl === maxIlvl) ||
                        (field.key === 'rating' &&
                          candidate.rating > 0 &&
                          candidate.rating === maxRating);

                      return (
                        <td
                          key={candidate.id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isBest
                              ? 'rgba(139, 92, 246, 0.08)'
                              : 'transparent',
                          }}
                        >
                          {field.render
                            ? field.render(candidate)
                            : (candidate as any)[field.key] || (
                                <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                                  --
                                </span>
                              )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
