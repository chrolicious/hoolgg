'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StatCard, Card, Icon, Divider } from '@hool/design-system';
import { ProtectedRoute } from '../../../../components/protected-route';
import { RoleGate } from '../../../../components/role-gate';
import { ErrorMessage } from '../../../../components/error-message';
import {
  PageSkeleton,
  StatCardSkeleton,
  CardSkeleton,
} from '../../../../components/loading-skeleton';
import { useGuild } from '../../../../lib/guild-context';
import { useAuth } from '../../../../lib/auth-context';
import { progressApi, ApiError } from '../../../../lib/api';
import { CharacterProgressCard } from './components/character-progress-card';
import type { CharacterProgressData } from './components/character-progress-card';
import { IlvlTracker } from './components/ilvl-tracker';
import { GearPriorityList } from './components/gear-priority-list';
import type { GearSlotPriority } from './components/gear-priority-list';
import { GuildOverviewTable } from './components/guild-overview-table';
import type { GuildMemberProgress } from './components/guild-overview-table';
import { WeeklyMessage } from './components/weekly-message';
import { ExpansionRoadmap } from './components/expansion-roadmap';
import type { RoadmapWeek } from './components/expansion-roadmap';
import { RealmComparison } from './components/realm-comparison';
import { AltSelector } from './components/alt-selector';
import type { AltCharacter } from './components/alt-selector';
import { ExportPdfButton } from './components/export-pdf-button';

// ── API Response Types ──────────────────────────────────────────

interface CharactersResponse {
  guild_id: string;
  characters: Array<{
    character_name: string;
    guild_id: string;
    current_ilvl: number;
    gear_details: Record<string, unknown>;
    class_name: string;
    spec: string;
    role: string;
    progress: {
      target_ilvl: number;
      current_week: number;
      status: 'ahead' | 'behind' | 'unknown';
      message?: string;
    };
  }>;
  expansion: string;
  current_week: number;
}

interface MessageResponse {
  guild_id: string;
  gm_message: string;
  updated_at: string;
}

interface RoadmapResponse {
  expansion_id: number;
  weeks: RoadmapWeek[];
}

interface CharacterDetailResponse {
  character: {
    character_name: string;
    guild_id: string;
    current_ilvl: number;
    gear_details: Record<string, unknown>;
    class_name: string;
    spec_name: string;
    last_updated?: string;
  };
  target_ilvl: number;
  current_week: number;
  gear_priorities: GearSlotPriority[];
}

interface MembersResponse {
  guild_id: string;
  members: GuildMemberProgress[];
  target_ilvl: number;
  current_week: number;
}

// ── Main Progress Page ──────────────────────────────────────────

export default function ProgressPage() {
  return (
    <ProtectedRoute toolName="progress">
      <ProgressContent />
    </ProtectedRoute>
  );
}

function ProgressContent() {
  const { guildId, guild, members: guildMembers, isGM, isOfficer } = useGuild();
  const { user } = useAuth();

  // Data states
  const [characters, setCharacters] = useState<CharactersResponse | null>(null);
  const [gmMessage, setGmMessage] = useState<MessageResponse | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [guildOverview, setGuildOverview] = useState<MembersResponse | null>(null);
  const [selectedCharDetail, setSelectedCharDetail] = useState<CharacterDetailResponse | null>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Identify user's characters in this guild
  const userCharacters = useMemo<AltCharacter[]>(() => {
    if (!user || !characters?.characters) return [];

    // Find the user's bnet_id from guild members
    const userGuildMembers = guildMembers.filter(m => m.bnet_id === user.bnet_id);
    const userCharNames = new Set(userGuildMembers.map(m => m.character_name.toLowerCase()));

    return characters.characters
      .filter(c => userCharNames.has(c.character_name.toLowerCase()))
      .map(c => ({
        character_name: c.character_name,
        class_name: c.class_name,
        spec: c.spec,
        current_ilvl: c.current_ilvl,
      }));
  }, [user, characters, guildMembers]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        progressApi.get<CharactersResponse>(`/guilds/${guildId}/progress/characters`),
        progressApi.get<MessageResponse>(`/guilds/${guildId}/progress/message`),
        progressApi.get<RoadmapResponse>(`/guilds/${guildId}/progress/roadmap`),
      ]);

      // Characters
      if (results[0].status === 'fulfilled') {
        setCharacters(results[0].value);
      }

      // Message (may be empty / 404)
      if (results[1].status === 'fulfilled') {
        setGmMessage(results[1].value);
      }

      // Roadmap
      if (results[2].status === 'fulfilled') {
        setRoadmap(results[2].value);
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
        setError('Failed to load progress data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  // Fetch guild overview (officer+ only)
  const fetchOverview = useCallback(async () => {
    if (!isOfficer) return;
    setIsLoadingOverview(true);

    try {
      const data = await progressApi.get<MembersResponse>(
        `/guilds/${guildId}/progress/members`
      );
      setGuildOverview(data);
    } catch {
      // Non-critical, silently fail
    } finally {
      setIsLoadingOverview(false);
    }
  }, [guildId, isOfficer]);

  // Fetch character detail
  const fetchCharacterDetail = useCallback(async (characterName: string) => {
    setIsLoadingDetail(true);

    try {
      const data = await progressApi.get<CharacterDetailResponse>(
        `/guilds/${guildId}/progress/character/${encodeURIComponent(characterName)}`
      );
      setSelectedCharDetail(data);
    } catch {
      setSelectedCharDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [guildId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    fetchOverview();
  }, [fetchData, fetchOverview]);

  // Auto-select first user character
  useEffect(() => {
    if (userCharacters.length > 0 && !selectedCharacter) {
      setSelectedCharacter(userCharacters[0].character_name);
    } else if (characters?.characters?.length && !selectedCharacter && userCharacters.length === 0) {
      setSelectedCharacter(characters.characters[0].character_name);
    }
  }, [userCharacters, characters, selectedCharacter]);

  // Fetch detail when selection changes
  useEffect(() => {
    if (selectedCharacter) {
      fetchCharacterDetail(selectedCharacter);
    }
  }, [selectedCharacter, fetchCharacterDetail]);

  // Computed stats
  const stats = useMemo(() => {
    if (!characters?.characters) return null;
    const chars = characters.characters;
    const totalChars = chars.length;
    const avgIlvl = totalChars > 0
      ? chars.reduce((sum, c) => sum + c.current_ilvl, 0) / totalChars
      : 0;
    const onTrack = chars.filter(c => c.progress?.status === 'ahead').length;
    const behind = chars.filter(c => c.progress?.status === 'behind').length;

    return { totalChars, avgIlvl, onTrack, behind };
  }, [characters]);

  // Selected character data
  const selectedCharData = useMemo<CharacterProgressData | null>(() => {
    if (!characters?.characters || !selectedCharacter) return null;
    const char = characters.characters.find(
      c => c.character_name === selectedCharacter
    );
    if (!char) return null;

    return {
      character_name: char.character_name,
      class_name: char.class_name,
      spec: char.spec,
      role: char.role,
      current_ilvl: char.current_ilvl,
      target_ilvl: char.progress?.target_ilvl || char.current_ilvl,
      status: char.progress?.status || 'unknown',
      message: char.progress?.message,
    };
  }, [characters, selectedCharacter]);

  // Handle character selection from alt selector
  const handleAltSelect = useCallback((characterName: string) => {
    setSelectedCharacter(characterName);
  }, []);

  // Handle member click in guild overview
  const handleMemberClick = useCallback((member: GuildMemberProgress) => {
    setSelectedCharacter(member.character_name);
    // Scroll to character detail section
    document.getElementById('character-detail')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div>
        <PageSkeleton />
      </div>
    );
  }

  // Error state
  if (error && !characters) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
      }}>
        <ErrorMessage
          message={error}
          onRetry={fetchData}
          title="Progress Data Unavailable"
        />
      </div>
    );
  }

  return (
    <div
      data-print-area
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}>
            Progress Tracker
          </h1>
          <p style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}>
            {guild?.name || 'Guild'} &mdash; {characters?.expansion || 'Current Expansion'}
            {characters?.current_week ? `, Week ${characters.current_week}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} data-no-print>
          <ExportPdfButton
            characterName={selectedCharacter}
            guildName={guild?.name}
          />
          <RoleGate minRank={0}>
            <a
              href={`/guilds/${guildId}/progress/settings`}
              style={{ textDecoration: 'none' }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="settings" size={14} />
                Settings
              </span>
            </a>
          </RoleGate>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <StatCard
            label="Total Characters"
            value={stats.totalChars}
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
            subtitle={`${stats.totalChars > 0 ? ((stats.onTrack / stats.totalChars) * 100).toFixed(0) : 0}% of roster`}
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

      {/* Weekly GM Message */}
      {gmMessage?.gm_message && (
        <WeeklyMessage
          message={gmMessage.gm_message}
          updatedAt={gmMessage.updated_at}
        />
      )}

      {/* Alt Selector */}
      {userCharacters.length > 1 && (
        <AltSelector
          characters={userCharacters}
          selectedCharacter={selectedCharacter}
          onSelect={handleAltSelect}
        />
      )}

      {/* Character Detail Section */}
      <div id="character-detail">
        {selectedCharData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(300px, 2fr)',
            gap: '1rem',
          }}>
            {/* Left: Character Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CharacterProgressCard
                character={selectedCharData}
                isSelected
              />
              <IlvlTracker
                currentIlvl={selectedCharData.current_ilvl}
                targetIlvl={selectedCharData.target_ilvl}
                characterName={selectedCharData.character_name}
              />
            </div>

            {/* Right: Gear Priorities */}
            <div>
              {isLoadingDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : (
                <GearPriorityList
                  priorities={selectedCharDetail?.gear_priorities || []}
                  characterName={selectedCharData.character_name}
                />
              )}
            </div>
          </div>
        )}

        {/* No character selected */}
        {!selectedCharData && !isLoading && (
          <Card padding="lg" variant="elevated">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <Icon name="user" size={40} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
              }}>
                No Character Data
              </h3>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.4)',
                margin: 0,
                maxWidth: 360,
              }}>
                Character progress data is not yet available. Make sure characters are synced with the guild.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Divider */}
      <Divider spacing="md" />

      {/* Expansion Roadmap */}
      <ExpansionRoadmap
        weeks={roadmap?.weeks || []}
        currentWeek={characters?.current_week || 1}
        currentIlvl={selectedCharData?.current_ilvl}
        expansionId={roadmap?.expansion_id}
      />

      {/* Guild Overview Table (Officer+ can see all members) */}
      <RoleGate minRank={1}>
        <Divider spacing="md" />
        <GuildOverviewTable
          members={guildOverview?.members || []}
          targetIlvl={guildOverview?.target_ilvl || 0}
          currentWeek={guildOverview?.current_week || 1}
          onMemberClick={handleMemberClick}
          isLoading={isLoadingOverview}
        />
      </RoleGate>

      {/* WarcraftLogs Comparison */}
      <Divider spacing="md" />
      <RealmComparison
        guildId={guildId}
        guildName={guild?.name}
        realm={guild?.realm}
      />

      {/* Responsive CSS override for mobile */}
      <style>{`
        @media (max-width: 768px) {
          #character-detail > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
