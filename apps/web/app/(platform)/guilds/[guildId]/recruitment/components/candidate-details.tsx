'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Icon, Badge, Select, Input } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { recruitmentApi } from '../../../../../lib/api';
import { useGuild } from '../../../../../lib/guild-context';
import type { RecruitmentCandidate } from '../../../../../lib/types';
import { StarRating, getClassVariant, getStatusColor } from './candidate-card';
import { ContactLogModal } from './contact-log-modal';

interface CandidateDetail extends RecruitmentCandidate {
  history?: Array<{
    contacted_date: string;
    method: string;
    message?: string;
    response_received?: boolean;
  }>;
}

interface CandidateDetailsProps {
  candidateId: string;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function CandidateDetails({
  candidateId,
  onClose,
  onUpdated,
  onDeleted,
}: CandidateDetailsProps) {
  const { guildId } = useGuild();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCandidate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruitmentApi.get<CandidateDetail>(
        `/guilds/${guildId}/recruitment/candidates/${candidateId}`
      );
      setCandidate(data);
      setNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate details.');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const handleRatingChange = useCallback(
    async (newRating: number) => {
      if (!candidate) return;
      try {
        await recruitmentApi.put(
          `/guilds/${guildId}/recruitment/candidates/${candidateId}`,
          { rating: newRating }
        );
        setCandidate((prev) => (prev ? { ...prev, rating: newRating } : prev));
        onUpdated();
      } catch {
        // Silent fail for rating
      }
    },
    [guildId, candidateId, candidate, onUpdated]
  );

  const handleSaveNotes = useCallback(async () => {
    setIsSaving(true);
    try {
      await recruitmentApi.put(
        `/guilds/${guildId}/recruitment/candidates/${candidateId}`,
        { notes }
      );
      setCandidate((prev) => (prev ? { ...prev, notes } : prev));
      setEditingNotes(false);
      onUpdated();
    } catch {
      // Silent fail
    } finally {
      setIsSaving(false);
    }
  }, [guildId, candidateId, notes, onUpdated]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!candidate) return;
      try {
        await recruitmentApi.put(
          `/guilds/${guildId}/recruitment/candidates/${candidateId}/status`,
          { status: newStatus }
        );
        setCandidate((prev) => (prev ? { ...prev, status: newStatus } : prev));
        onUpdated();
      } catch {
        // Silent fail
      }
    },
    [guildId, candidateId, candidate, onUpdated]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to remove this candidate?')) return;
    setIsDeleting(true);
    try {
      await recruitmentApi.delete(
        `/guilds/${guildId}/recruitment/candidates/${candidateId}`
      );
      onDeleted();
    } catch {
      setIsDeleting(false);
    }
  }, [guildId, candidateId, onDeleted]);

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'trial', label: 'Trial' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 480,
            background: 'rgba(14, 11, 18, 0.98)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Candidate Details
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              icon={<Icon name="x-mark" size={16} />}
            />
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
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
              <div style={{ padding: '1rem 0' }}>
                <Card padding="md" variant="default">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <Icon name="alert-circle" size={28} style={{ color: '#ef4444' }} />
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0,
                      }}
                    >
                      {error}
                    </p>
                    <Button variant="primary" size="sm" onClick={fetchCandidate}>
                      Retry
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {!isLoading && !error && candidate && (
              <FadeIn duration={0.3}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Profile header */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          margin: 0,
                        }}
                      >
                        {candidate.candidate_name}
                      </h3>
                      {candidate.class_name && (
                        <Badge
                          variant={getClassVariant(candidate.class_name) as any}
                          size="sm"
                        >
                          {candidate.class_name}
                        </Badge>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        fontSize: '0.8125rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {candidate.role && <span>{candidate.role}</span>}
                      {candidate.ilvl > 0 && <span>iLvl {candidate.ilvl}</span>}
                      {candidate.source && <span>Source: {candidate.source}</span>}
                    </div>
                  </div>

                  {/* Rating */}
                  <Card padding="sm" variant="default">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        Rating
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'flex',
                            }}
                            aria-label={`Rate ${star} stars`}
                          >
                            <Icon
                              name="star"
                              size={20}
                              style={{
                                color:
                                  star <= (candidate.rating || 0)
                                    ? '#FFD700'
                                    : 'rgba(255, 255, 255, 0.15)',
                                transition: 'color 0.15s ease',
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Status */}
                  <Card padding="sm" variant="default">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        Status
                      </span>
                      <Select
                        options={statusOptions}
                        value={candidate.status || 'new'}
                        onChange={handleStatusChange}
                        size="sm"
                        variant="secondary"
                      />
                    </div>
                  </Card>

                  {/* Notes */}
                  <Card padding="md" variant="default">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.7)',
                          }}
                        >
                          Notes
                        </span>
                        {!editingNotes && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingNotes(true)}
                            icon={<Icon name="edit" size={12} />}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      {editingNotes ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '0.625rem',
                              borderRadius: 8,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: '#ffffff',
                              fontSize: '0.8125rem',
                              lineHeight: 1.5,
                              resize: 'vertical',
                              outline: 'none',
                              fontFamily: 'inherit',
                            }}
                            placeholder="Add notes about this candidate..."
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingNotes(false);
                                setNotes(candidate.notes || '');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveNotes}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: candidate.notes
                              ? 'rgba(255, 255, 255, 0.6)'
                              : 'rgba(255, 255, 255, 0.3)',
                            margin: 0,
                            lineHeight: 1.6,
                            fontStyle: candidate.notes ? 'normal' : 'italic',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {candidate.notes || 'No notes yet.'}
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Contact History */}
                  <Card padding="md" variant="default">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.7)',
                          }}
                        >
                          Contact History
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowContactModal(true)}
                          icon={<Icon name="mail" size={12} />}
                        >
                          Log Contact
                        </Button>
                      </div>

                      {(!candidate.history || candidate.history.length === 0) && (
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.3)',
                            margin: 0,
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '0.75rem 0',
                          }}
                        >
                          No contact history yet.
                        </p>
                      )}

                      {candidate.history && candidate.history.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          {candidate.history.map((entry, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: 6,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: '#8b5cf6',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {entry.method}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                  }}
                                >
                                  {formatDate(entry.contacted_date)}
                                </span>
                              </div>
                              {entry.message && (
                                <p
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    margin: 0,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {entry.message}
                                </p>
                              )}
                              {entry.response_received !== undefined && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  <Icon
                                    name={entry.response_received ? 'check' : 'clock'}
                                    size={10}
                                    style={{
                                      color: entry.response_received
                                        ? '#22c55e'
                                        : 'rgba(255, 255, 255, 0.3)',
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      color: entry.response_received
                                        ? '#22c55e'
                                        : 'rgba(255, 255, 255, 0.3)',
                                    }}
                                  >
                                    {entry.response_received ? 'Response received' : 'Awaiting response'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Meta info */}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <span>Added: {formatDate(candidate.created_at)}</span>
                    <span>Last updated: {formatDate(candidate.updated_at)}</span>
                  </div>

                  {/* Danger zone */}
                  <div
                    style={{
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      icon={<Icon name="trash" size={14} />}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Removing...' : 'Remove Candidate'}
                    </Button>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 49,
        }}
      />

      {/* Contact Log Modal */}
      {showContactModal && (
        <ContactLogModal
          guildId={guildId}
          candidateId={candidateId}
          onClose={() => setShowContactModal(false)}
          onLogged={() => {
            setShowContactModal(false);
            fetchCandidate();
            onUpdated();
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
