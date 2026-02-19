'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon, StatCard, Card } from '@hool/design-system';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../../../../components/protected-route';
import { RoleGate } from '../../../../components/role-gate';
import { ErrorMessage } from '../../../../components/error-message';
import { PageSkeleton, StatCardSkeleton } from '../../../../components/loading-skeleton';
import { useGuild } from '../../../../lib/guild-context';
import { recruitmentApi } from '../../../../lib/api';
import type { RecruitmentCandidate } from '../../../../lib/types';
import { CandidateCard } from './components/candidate-card';
import { CandidateSearch } from './components/candidate-search';
import { CandidateDetails } from './components/candidate-details';
import { CandidateFilters, type FilterState } from './components/candidate-filters';
import { ComparisonTable } from './components/comparison-table';
import { KanbanBoard } from './components/kanban-board';
import { RaidComposition } from './components/raid-composition';

type Tab = 'candidates' | 'pipeline' | 'search' | 'composition';

interface CandidatesResponse {
  candidates: RecruitmentCandidate[];
  count: number;
}

export default function RecruitmentPage() {
  return (
    <ProtectedRoute toolName="recruitment">
      <RecruitmentContent />
    </ProtectedRoute>
  );
}

function RecruitmentContent() {
  const { guildId, isGM } = useGuild();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('candidates');

  // Candidates tab state
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    role: '',
    class: '',
    status: '',
    minIlvl: '',
    maxIlvl: '',
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  // Selected candidate for details
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Comparison
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Refresh trigger for child components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Fetch candidates (tab: candidates) ──────────────────────
  const fetchCandidates = useCallback(async () => {
    setIsLoadingCandidates(true);
    setCandidatesError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.role) params.role = filters.role;
      if (filters.class) params.class = filters.class;
      if (filters.status) params.status = filters.status;
      if (filters.minIlvl) params.min_ilvl = filters.minIlvl;
      if (filters.maxIlvl) params.max_ilvl = filters.maxIlvl;
      if (filters.sortBy) params.sort_by = filters.sortBy;
      if (filters.sortOrder) params.sort_order = filters.sortOrder;

      const data = await recruitmentApi.get<CandidatesResponse>(
        `/guilds/${guildId}/recruitment/candidates`,
        { params }
      );
      setCandidates(data.candidates || []);
      setCandidateCount(data.count || 0);
    } catch (err: any) {
      setCandidatesError(err.message || 'Failed to load candidates.');
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [guildId, filters]);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
  }, [fetchCandidates, activeTab]);

  // ── Stats (quick overview) ──────────────────────────────────
  const stats = useMemo(() => {
    const roleBreakdown: Record<string, number> = {};
    candidates.forEach((c) => {
      const role = c.role || 'Unknown';
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });

    const recentCount = candidates.filter((c) => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length;

    return { roleBreakdown, recentCount };
  }, [candidates]);

  // ── Handlers ────────────────────────────────────────────────
  const handleCandidateClick = useCallback(
    (candidate: RecruitmentCandidate) => {
      setSelectedCandidateId(candidate.id);
    },
    []
  );

  const handleSelectToggle = useCallback((candidateId: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  }, []);

  const handleCandidateUpdated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    fetchCandidates();
  }, [fetchCandidates]);

  const handleCandidateDeleted = useCallback(() => {
    setSelectedCandidateId(null);
    setRefreshTrigger((prev) => prev + 1);
    fetchCandidates();
  }, [fetchCandidates]);

  const handleCandidateAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    fetchCandidates();
  }, [fetchCandidates]);

  // ── Tab bar ─────────────────────────────────────────────────
  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'candidates', label: 'Candidates', icon: 'user' },
    { id: 'pipeline', label: 'Pipeline', icon: 'chart' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'composition', label: 'Composition', icon: 'target' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Recruitment
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '0.25rem 0 0',
            }}
          >
            Find, evaluate, and manage recruitment candidates
          </p>
        </div>

        <RoleGate minRank={0}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              router.push(`/guilds/${guildId}/recruitment/settings`)
            }
            icon={<Icon name="settings" size={16} />}
          >
            Settings
          </Button>
        </RoleGate>
      </div>

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.25rem',
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflow: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: isActive
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }
              }}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats row (visible on all tabs) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <StatCard
          label="Total Candidates"
          value={candidateCount}
          icon={<Icon name="user" size={20} style={{ color: '#8b5cf6' }} />}
        />
        <StatCard
          label="New This Week"
          value={stats.recentCount}
          icon={<Icon name="clock" size={20} style={{ color: '#3b82f6' }} />}
        />
        {Object.entries(stats.roleBreakdown)
          .slice(0, 2)
          .map(([role, count]) => (
            <StatCard
              key={role}
              label={role}
              value={count}
              icon={
                <Icon
                  name={role.toLowerCase().includes('tank') ? 'shield' : role.toLowerCase().includes('heal') ? 'plus' : 'target'}
                  size={20}
                  style={{ color: '#f59e0b' }}
                />
              }
            />
          ))}
      </div>

      {/* Tab content */}
      <div>
          {/* ── Candidates tab ─────────────────────────── */}
          {activeTab === 'candidates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Filters */}
              <CandidateFilters
                filters={filters}
                onChange={setFilters}
                candidateCount={candidateCount}
              />

              {/* Comparison bar */}
              <AnimatePresence>
                {comparedIds.size >= 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 1rem',
                        borderRadius: 10,
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {comparedIds.size} candidate{comparedIds.size !== 1 ? 's' : ''} selected
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setComparedIds(new Set())}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="purple"
                          size="sm"
                          onClick={() => setShowComparison(true)}
                          icon={<Icon name="chart" size={14} />}
                        >
                          Compare
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading */}
              {isLoadingCandidates && <PageSkeleton />}

              {/* Error */}
              {candidatesError && (
                <ErrorMessage
                  message={candidatesError}
                  onRetry={fetchCandidates}
                />
              )}

              {/* Empty state */}
              {!isLoadingCandidates &&
                !candidatesError &&
                candidates.length === 0 && (
                  <Card padding="lg" variant="elevated">
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
                        <Icon
                          name="search"
                          size={48}
                          style={{ color: 'rgba(255, 255, 255, 0.15)' }}
                        />
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: 0,
                          }}
                        >
                          No Candidates Yet
                        </h3>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: 0,
                            maxWidth: 320,
                          }}
                        >
                          Start by searching for candidates or add them manually.
                        </p>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setActiveTab('search')}
                          icon={<Icon name="search" size={16} />}
                        >
                          Search Candidates
                        </Button>
                      </div>
                    </Card>
                )}

              {/* Candidate list */}
              {!isLoadingCandidates &&
                !candidatesError &&
                candidates.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {candidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onClick={handleCandidateClick}
                        isSelected={comparedIds.has(candidate.id)}
                        onSelectToggle={handleSelectToggle}
                      />
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* ── Pipeline tab ───────────────────────────── */}
          {activeTab === 'pipeline' && (
            <KanbanBoard
              onCandidateClick={handleCandidateClick}
              refreshTrigger={refreshTrigger}
            />
          )}

          {/* ── Search tab ─────────────────────────────── */}
          {activeTab === 'search' && (
            <CandidateSearch onCandidateAdded={handleCandidateAdded} />
          )}

          {/* ── Composition tab ────────────────────────── */}
          {activeTab === 'composition' && (
            <RaidComposition
              onCandidateClick={handleCandidateClick}
              refreshTrigger={refreshTrigger}
            />
          )}
      </div>

      {/* ── Candidate Detail Panel (slide-in from right) ───── */}
      <AnimatePresence>
        {selectedCandidateId && (
          <CandidateDetails
            candidateId={selectedCandidateId}
            onClose={() => setSelectedCandidateId(null)}
            onUpdated={handleCandidateUpdated}
            onDeleted={handleCandidateDeleted}
          />
        )}
      </AnimatePresence>

      {/* ── Comparison Modal ───────────────────────────────── */}
      {showComparison && comparedIds.size >= 2 && (
        <ComparisonTable
          candidateIds={Array.from(comparedIds)}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
