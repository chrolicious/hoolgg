'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Icon, Input, Divider } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { ProtectedRoute } from '../../../../../components/protected-route';
import { RoleGate } from '../../../../../components/role-gate';
import { ErrorMessage } from '../../../../../components/error-message';
import { CardSkeleton } from '../../../../../components/loading-skeleton';
import { useGuild } from '../../../../../lib/guild-context';
import { progressApi, ApiError } from '../../../../../lib/api';

// ── Types ────────────────────────────────────────────────────────

interface MessageResponse {
  guild_id: string;
  gm_message: string;
  updated_at: string;
}

interface RoadmapWeek {
  expansion_id: number;
  week: number;
  ilvl_target: number;
}

interface RoadmapResponse {
  expansion_id: number;
  weeks: RoadmapWeek[];
}

// ── GM Settings Page ─────────────────────────────────────────────

export default function ProgressSettingsPage() {
  return (
    <ProtectedRoute toolName="progress">
      <RoleGate
        minRank={0}
        fallback={
          <div style={{
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}>
            <ErrorMessage
              message="Only the Guild Master can access progress settings."
              title="Access Restricted"
              icon="shield"
            />
          </div>
        }
      >
        <SettingsContent />
      </RoleGate>
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { guildId, guild } = useGuild();

  // Message state
  const [message, setMessage] = useState('');
  const [originalMessage, setOriginalMessage] = useState('');
  const [messageUpdatedAt, setMessageUpdatedAt] = useState<string | null>(null);
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [messageSaved, setMessageSaved] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Roadmap state
  const [roadmapWeeks, setRoadmapWeeks] = useState<RoadmapWeek[]>([]);
  const [expansionId, setExpansionId] = useState<number>(1);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);
  const [roadmapSaved, setRoadmapSaved] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch existing data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        progressApi.get<MessageResponse>(`/guilds/${guildId}/progress/message`),
        progressApi.get<RoadmapResponse>(`/guilds/${guildId}/progress/roadmap`),
      ]);

      if (results[0].status === 'fulfilled') {
        const msgData = results[0].value;
        setMessage(msgData.gm_message || '');
        setOriginalMessage(msgData.gm_message || '');
        setMessageUpdatedAt(msgData.updated_at);
      }

      if (results[1].status === 'fulfilled') {
        const rmData = results[1].value;
        setRoadmapWeeks(rmData.weeks || []);
        setExpansionId(rmData.expansion_id || 1);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(err.message);
      } else {
        setLoadError('Failed to load settings data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save message
  const handleSaveMessage = useCallback(async () => {
    setIsSavingMessage(true);
    setMessageError(null);
    setMessageSaved(false);

    try {
      await progressApi.put(`/guilds/${guildId}/progress/message`, {
        message: message,
      });
      setOriginalMessage(message);
      setMessageSaved(true);
      setMessageUpdatedAt(new Date().toISOString());
      setTimeout(() => setMessageSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setMessageError(err.message);
      } else {
        setMessageError('Failed to save message.');
      }
    } finally {
      setIsSavingMessage(false);
    }
  }, [guildId, message]);

  // Roadmap management
  const handleAddWeek = useCallback(() => {
    const nextWeek = roadmapWeeks.length > 0
      ? Math.max(...roadmapWeeks.map(w => w.week)) + 1
      : 1;
    const lastTarget = roadmapWeeks.length > 0
      ? roadmapWeeks[roadmapWeeks.length - 1].ilvl_target
      : 580;

    setRoadmapWeeks(prev => [
      ...prev,
      { expansion_id: expansionId, week: nextWeek, ilvl_target: lastTarget + 3 },
    ]);
  }, [roadmapWeeks, expansionId]);

  const handleRemoveWeek = useCallback((weekNumber: number) => {
    setRoadmapWeeks(prev => prev.filter(w => w.week !== weekNumber));
  }, []);

  const handleUpdateWeekTarget = useCallback((weekNumber: number, newTarget: number) => {
    setRoadmapWeeks(prev =>
      prev.map(w =>
        w.week === weekNumber ? { ...w, ilvl_target: newTarget } : w
      )
    );
  }, []);

  const handleUpdateWeekNumber = useCallback((oldWeek: number, newWeek: number) => {
    setRoadmapWeeks(prev =>
      prev.map(w =>
        w.week === oldWeek ? { ...w, week: newWeek } : w
      )
    );
  }, []);

  const handleSaveRoadmap = useCallback(async () => {
    setIsSavingRoadmap(true);
    setRoadmapError(null);
    setRoadmapSaved(false);

    try {
      await progressApi.put(`/guilds/${guildId}/progress/roadmap`, {
        expansion_id: expansionId,
        weeks: roadmapWeeks,
      });
      setRoadmapSaved(true);
      setTimeout(() => setRoadmapSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setRoadmapError(err.message);
      } else {
        setRoadmapError('Failed to save roadmap.');
      }
    } finally {
      setIsSavingRoadmap(false);
    }
  }, [guildId, expansionId, roadmapWeeks]);

  // Loading
  if (isLoading) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Error
  if (loadError) {
    return (
      <div style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
      }}>
        <ErrorMessage
          message={loadError}
          onRetry={fetchData}
          title="Failed to Load Settings"
        />
      </div>
    );
  }

  const messageHasChanges = message !== originalMessage;
  const sortedWeeks = [...roadmapWeeks].sort((a, b) => a.week - b.week);

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: 800,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Header */}
      <FadeIn duration={0.4}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <a
                href={`/guilds/${guildId}/progress`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  textDecoration: 'none',
                }}
              >
                <Icon name="arrow-left" size={12} />
                Back to Progress
              </a>
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}>
              Progress Settings
            </h1>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.45)',
              margin: '0.25rem 0 0 0',
            }}>
              {guild?.name || 'Guild'} &mdash; Guild Master Tools
            </p>
          </div>
        </div>
      </FadeIn>

      {/* GM Message Editor */}
      <FadeIn duration={0.4} delay={0.05}>
        <Card padding="lg" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="crown" size={18} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: 0,
                }}>
                  Weekly Guidance Message
                </h2>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  margin: 0,
                }}>
                  This message is displayed to all guild members on the progress page.
                </p>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a weekly message for your guild members. Share raid priorities, gear focus, upcoming events, or encouragement..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />

            {messageError && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                <Icon name="alert-circle" size={14} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{messageError}</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{
                fontSize: '0.6875rem',
                color: 'rgba(255, 255, 255, 0.3)',
              }}>
                {messageUpdatedAt && (
                  <span>Last updated: {new Date(messageUpdatedAt).toLocaleString()}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {messageSaved && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <Icon name="check" size={14} />
                    Saved
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveMessage}
                  loading={isSavingMessage}
                  disabled={!messageHasChanges}
                >
                  Save Message
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <Divider spacing="md" />

      {/* Expansion Roadmap Editor */}
      <FadeIn duration={0.4} delay={0.1}>
        <Card padding="lg" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="chart" size={18} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    margin: 0,
                  }}>
                    Expansion Roadmap
                  </h2>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    margin: 0,
                  }}>
                    Set weekly iLvl targets for your guild to follow throughout the expansion.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddWeek}
                icon={<Icon name="plus" size={14} />}
              >
                Add Week
              </Button>
            </div>

            {/* Expansion ID input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                whiteSpace: 'nowrap',
              }}>
                Expansion ID:
              </label>
              <Input
                variant="default"
                size="sm"
                type="number"
                value={String(expansionId)}
                onChange={(e) => setExpansionId(parseInt(e.target.value) || 1)}
                style={{ width: 80 }}
              />
            </div>

            {/* Week rows */}
            {sortedWeeks.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  margin: 0,
                }}>
                  No weekly targets set yet. Click "Add Week" to start building your roadmap.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 40px',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.6875rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                }}>
                  <span>Week</span>
                  <span>Target iLvl</span>
                  <span></span>
                </div>

                <StaggerGroup staggerDelay={0.03}>
                  {sortedWeeks.map((week) => (
                    <div
                      key={week.week}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 40px',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        alignItems: 'center',
                      }}
                    >
                      <Input
                        variant="simple"
                        size="sm"
                        type="number"
                        value={String(week.week)}
                        onChange={(e) => handleUpdateWeekNumber(week.week, parseInt(e.target.value) || 0)}
                        style={{ textAlign: 'center' }}
                      />
                      <Input
                        variant="simple"
                        size="sm"
                        type="number"
                        value={String(week.ilvl_target)}
                        onChange={(e) => handleUpdateWeekTarget(week.week, parseInt(e.target.value) || 0)}
                      />
                      <button
                        onClick={() => handleRemoveWeek(week.week)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          background: 'rgba(239, 68, 68, 0.06)',
                          cursor: 'pointer',
                          color: '#ef4444',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                        }}
                        title="Remove week"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  ))}
                </StaggerGroup>
              </div>
            )}

            {roadmapError && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}>
                <Icon name="alert-circle" size={14} style={{ color: '#ef4444' }} />
                <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>{roadmapError}</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}>
              {roadmapSaved && (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <Icon name="check" size={14} />
                  Saved
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveRoadmap}
                loading={isSavingRoadmap}
                disabled={sortedWeeks.length === 0}
              >
                Save Roadmap
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
