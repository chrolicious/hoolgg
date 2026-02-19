'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard, Icon, Divider } from '@hool/design-system';
import { RoleGate } from '../../../../components/role-gate';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { ErrorMessage } from '../../../../components/error-message';
import { PageSkeleton } from '../../../../components/loading-skeleton';
import { useGuild } from '../../../../lib/guild-context';
import { progressApi, ApiError } from '../../../../lib/api';
import { ExpansionRoadmap } from '../progress/components/expansion-roadmap';
import type { RoadmapWeek } from '../progress/components/expansion-roadmap';
import { GuildOverviewTable } from '../progress/components/guild-overview-table';
import type { GuildMemberProgress } from '../progress/components/guild-overview-table';
import { RealmComparison } from '../progress/components/realm-comparison';

// ── API Response Types ──────────────────────────────────────────

interface MembersResponse {
  guild_id: string;
  members: GuildMemberProgress[];
  target_ilvl: number;
  current_week: number;
}

interface RoadmapResponse {
  expansion_id: number;
  weeks: RoadmapWeek[];
}

// ── Main Team Progress Page ────────────────────────────────────

export default function TeamProgressPage() {
  return (
    <RoleGate minRank={1}>
      <TeamProgressContent />
    </RoleGate>
  );
}

function TeamProgressContent() {
  const { guildId, guild } = useGuild();
  const router = useRouter();

  // Data states
  const [guildOverview, setGuildOverview] = useState<MembersResponse | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        progressApi.get<MembersResponse>(`/guilds/${guildId}/progress/members`),
        progressApi.get<RoadmapResponse>(`/guilds/${guildId}/progress/roadmap`),
      ]);

      // Guild overview
      if (results[0].status === 'fulfilled') {
        setGuildOverview(results[0].value);
      }

      // Roadmap
      if (results[1].status === 'fulfilled') {
        setRoadmap(results[1].value);
      }

      // If all failed, show error
      if (results.every(r => r.status === 'rejected')) {
        const firstError = results[0] as PromiseRejectedResult;
        throw firstError.reason;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load team progress data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed stats
  const stats = useMemo(() => {
    if (!guildOverview?.members) return null;
    const members = guildOverview.members;
    const totalMembers = members.length;
    const avgIlvl = totalMembers > 0
      ? members.reduce((sum, m) => sum + m.current_ilvl, 0) / totalMembers
      : 0;
    const onTrack = members.filter(m => m.status === 'ahead').length;
    const behind = members.filter(m => m.status === 'behind').length;

    return { totalMembers, avgIlvl, onTrack, behind };
  }, [guildOverview]);

  // Handle member click - navigate to character detail
  const handleMemberClick = useCallback((member: GuildMemberProgress) => {
    router.push(`/guilds/${guildId}/roster/${encodeURIComponent(member.character_name)}`);
  }, [guildId, router]);

  // Loading state
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Error state
  if (error && !guildOverview) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <ErrorMessage
          message={error}
          onRetry={fetchData}
          title="Team Progress Data Unavailable"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
          { label: 'Team Progress' },
        ]}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Team Progress
        </h1>
        <p className="text-[0.8125rem] text-white/45">
          Guild-wide progress overview for officers
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <StatCard
            label="Total Members"
            value={stats.totalMembers}
            icon={<Icon name="user" size={20} />}
            variant="default"
            subtitle="In this guild"
          />
          <StatCard
            label="Average iLvl"
            value={stats.avgIlvl.toFixed(1)}
            icon={<Icon name="zap" size={20} />}
            variant="highlighted"
            subtitle="Across all members"
          />
          <StatCard
            label="On Track"
            value={stats.onTrack}
            icon={<Icon name="check" size={20} />}
            variant="success"
            subtitle={`${stats.totalMembers > 0 ? ((stats.onTrack / stats.totalMembers) * 100).toFixed(0) : 0}% of roster`}
          />
          <StatCard
            label="Behind Schedule"
            value={stats.behind}
            icon={<Icon name="alert-circle" size={20} />}
            variant={stats.behind > 0 ? 'danger' : 'default'}
            subtitle={stats.behind > 0 ? 'Need attention' : 'No one behind'}
          />
        </div>
      )}

      {/* Divider */}
      <Divider spacing="md" />

      {/* Expansion Roadmap */}
      <ExpansionRoadmap
        weeks={roadmap?.weeks || []}
        currentWeek={guildOverview?.current_week || 1}
        currentIlvl={stats?.avgIlvl}
        expansionId={roadmap?.expansion_id}
      />

      {/* Divider */}
      <Divider spacing="md" />

      {/* Guild Overview Table */}
      <GuildOverviewTable
        members={guildOverview?.members || []}
        targetIlvl={guildOverview?.target_ilvl || 0}
        currentWeek={guildOverview?.current_week || 1}
        onMemberClick={handleMemberClick}
        isLoading={false}
      />

      {/* Divider */}
      <Divider spacing="md" />

      {/* Realm Comparison */}
      <RealmComparison
        guildId={guildId}
        guildName={guild?.name}
        realm={guild?.realm}
      />
    </div>
  );
}
