'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { useGuild } from '../../../../../lib/guild-context';
import { progressApi } from '../../../../../lib/api';
import { Card, Icon } from '@hool/design-system';
import { PageSkeleton } from '../../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../../components/error-message';
import { CLASS_COLORS } from './utils';
import type {
  CharacterRoster,
  SeasonResponse,
  TasksResponse,
  VaultResponse,
  CrestsResponse,
  GearResponse,
  BisResponse,
  ProfessionsResponse,
  TalentsResponse,
} from './types';

// Section components
import { CharacterHeader } from './components/character-header';
import { SeasonTimeline } from './components/season-timeline';
import { WeeklyTasksSection } from './components/weekly-tasks-section';
import { VaultAndCrests } from './components/vault-and-crests';
import { EquipmentGrid } from './components/equipment-grid';
import { BisTracker } from './components/bis-tracker';
import { ProfessionsSection } from './components/professions-section';
import { TalentBuildsSection } from './components/talent-builds-section';
import { WeeklyProgressGranular } from './components/weekly-progress-granular';

// Section data state — each section can be independently loaded or failed
interface SectionData {
  season: SeasonResponse | null;
  tasks: TasksResponse | null;
  vault: VaultResponse | null;
  crests: CrestsResponse | null;
  gear: GearResponse | null;
  bis: BisResponse | null;
  professions: ProfessionsResponse | null;
  talents: TalentsResponse | null;
}

interface SectionErrors {
  season: string | null;
  tasks: string | null;
  vault: string | null;
  crests: string | null;
  gear: string | null;
  bis: string | null;
  professions: string | null;
  talents: string | null;
}

function SectionError({ label, error }: { label: string; error: string }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Icon name="warning" size={16} className="text-red-400" />
      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
        <strong style={{ color: '#f87171' }}>{label}</strong> — {error}
      </span>
    </div>
  );
}

function extractError(result: PromiseSettledResult<unknown>): string | null {
  if (result.status === 'fulfilled') return null;
  const reason = result.reason;
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'string') return reason;
  return 'Failed to load';
}

export default function CharacterDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { guild, guildId } = useGuild();

  const characterName = decodeURIComponent(params.characterName as string);
  const realm = searchParams.get('realm');

  // Phase 1: resolve character from roster
  const [character, setCharacter] = useState<CharacterRoster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 2: section data
  const [sections, setSections] = useState<SectionData>({
    season: null,
    tasks: null,
    vault: null,
    crests: null,
    gear: null,
    bis: null,
    professions: null,
    talents: null,
  });
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>({
    season: null,
    tasks: null,
    vault: null,
    crests: null,
    gear: null,
    bis: null,
    professions: null,
    talents: null,
  });
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Week selection state for timeline ↔ tasks interaction
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);

  // Phase 1: Resolve characterId from roster list
  const resolveCharacter = useCallback(async () => {
    if (!guildId || !characterName || !realm) {
      if (!realm) setError('Realm parameter is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await progressApi.get<{
        characters: CharacterRoster[];
      }>(`/guilds/${guildId}/characters`);

      const match = data.characters.find(
        (c) =>
          c.character_name.toLowerCase() === characterName.toLowerCase() &&
          c.realm.toLowerCase() === realm.toLowerCase()
      );

      if (!match) {
        setError(`Character "${characterName}" on "${realm}" not found in this guild's roster.`);
        setIsLoading(false);
        return;
      }

      setCharacter(match);
    } catch (err) {
      console.error('Failed to resolve character:', err);
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, characterName, realm]);

  useEffect(() => {
    resolveCharacter();
  }, [resolveCharacter]);

  // Phase 2: Fetch all section data in parallel once character is resolved
  const fetchSections = useCallback(async (char: CharacterRoster) => {
    if (!guildId) return;

    setSectionsLoading(true);
    const cid = char.id;

    const [
      seasonResult,
      tasksResult,
      vaultResult,
      crestsResult,
      gearResult,
      bisResult,
      professionsResult,
      talentsResult,
    ] = await Promise.allSettled([
      progressApi.get<SeasonResponse>(`/guilds/${guildId}/season`),
      progressApi.get<TasksResponse>(`/guilds/${guildId}/characters/${cid}/tasks`),
      progressApi.get<VaultResponse>(`/guilds/${guildId}/characters/${cid}/vault`),
      progressApi.get<CrestsResponse>(`/guilds/${guildId}/characters/${cid}/crests`),
      progressApi.get<GearResponse>(`/guilds/${guildId}/characters/${cid}/gear`),
      progressApi.get<BisResponse>(`/guilds/${guildId}/characters/${cid}/bis`),
      progressApi.get<ProfessionsResponse>(`/guilds/${guildId}/characters/${cid}/professions`),
      progressApi.get<TalentsResponse>(`/guilds/${guildId}/characters/${cid}/talents`),
    ]);

    // Log failures for debugging
    const results = { seasonResult, tasksResult, vaultResult, crestsResult, gearResult, bisResult, professionsResult, talentsResult };
    for (const [name, result] of Object.entries(results)) {
      if (result.status === 'rejected') {
        console.error(`[CharacterDetail] ${name} failed:`, result.reason);
      }
    }

    setSections({
      season: seasonResult.status === 'fulfilled' ? seasonResult.value : null,
      tasks: tasksResult.status === 'fulfilled' ? tasksResult.value : null,
      vault: vaultResult.status === 'fulfilled' ? vaultResult.value : null,
      crests: crestsResult.status === 'fulfilled' ? crestsResult.value : null,
      gear: gearResult.status === 'fulfilled' ? gearResult.value : null,
      bis: bisResult.status === 'fulfilled' ? bisResult.value : null,
      professions: professionsResult.status === 'fulfilled' ? professionsResult.value : null,
      talents: talentsResult.status === 'fulfilled' ? talentsResult.value : null,
    });

    setSectionErrors({
      season: extractError(seasonResult),
      tasks: extractError(tasksResult),
      vault: extractError(vaultResult),
      crests: extractError(crestsResult),
      gear: extractError(gearResult),
      bis: extractError(bisResult),
      professions: extractError(professionsResult),
      talents: extractError(talentsResult),
    });

    setSectionsLoading(false);
  }, [guildId]);

  useEffect(() => {
    if (character) {
      fetchSections(character);
    }
  }, [character, fetchSections]);

  // Callbacks for cross-section updates
  const handleSync = useCallback(() => {
    if (character) fetchSections(character);
  }, [character, fetchSections]);

  const handleDelete = useCallback(() => {
    router.push(`/guilds/${guildId}/roster`);
  }, [router, guildId]);

  const handleVaultUpdate = useCallback(async () => {
    if (!guildId || !character) return;
    try {
      const vault = await progressApi.get<VaultResponse>(
        `/guilds/${guildId}/characters/${character.id}/vault`
      );
      setSections((prev) => ({ ...prev, vault }));
    } catch {
      // silently fail — user will see stale data
    }
  }, [guildId, character]);

  // Loading state
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Character"
        message={error}
        onRetry={resolveCharacter}
      />
    );
  }

  // Not found state
  if (!character) {
    return (
      <div className="flex flex-col gap-6">
        <Card padding="lg" variant="elevated">
          <div className="flex flex-col items-center gap-3 text-center p-8">
            <Icon name="user" size={48} className="text-white/15" />
            <h3 className="text-base font-bold text-white m-0">
              Character Not Found
            </h3>
            <p className="text-sm text-white/50 m-0 max-w-80">
              The character &ldquo;{characterName}&rdquo; could not be found.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const classColor = CLASS_COLORS[character.class_name ?? ''] || '#FFFFFF';
  const currentWeek = sections.season?.current_week ?? 0;

  return (
    <>
      {/* Wowhead tooltip script — lazy-loaded for equipment grid */}
      <Script
        id="wowhead-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `var whTooltips = {colorLinks: false, iconizeLinks: false, renameLinks: false};`,
        }}
      />
      <Script
        src="https://wow.zamimg.com/js/tooltips.js"
        strategy="lazyOnload"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Character Header */}
        <CharacterHeader
          character={character}
          gearData={sections.gear}
          vaultData={sections.vault}
          crestsData={sections.crests}
          tasksData={sections.tasks}
          seasonData={sections.season}
          guildId={guildId}
          onSync={handleSync}
          onDelete={handleDelete}
          onRefresh={handleSync}
        />

        {sectionsLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <Icon name="refresh" size={24} animation="spin" className="text-white/30" />
          </div>
        ) : (
          <>
            {/* 2. Season Timeline */}
            {sections.season ? (
              <SeasonTimeline
                seasonData={sections.season}
                currentIlvl={character.current_ilvl}
                selectedWeek={selectedWeek}
                onWeekSelect={setSelectedWeek}
              />
            ) : sectionErrors.season ? (
              <SectionError label="Season Timeline" error={sectionErrors.season} />
            ) : null}

            {/* 3. Weekly Tasks */}
            {sections.tasks ? (
              <WeeklyTasksSection
                tasksData={sections.tasks}
                characterId={character.id}
                guildId={guildId}
                classColor={classColor}
                selectedWeek={selectedWeek}
              />
            ) : sectionErrors.tasks ? (
              <SectionError label="Weekly Tasks" error={sectionErrors.tasks} />
            ) : null}

            {/* 4. Great Vault + Crests (side-by-side) */}
            <VaultAndCrests
              vaultData={sections.vault}
              crestsData={sections.crests}
              characterId={character.id}
              guildId={guildId}
              currentWeek={currentWeek}
            />

            {/* 5. Equipment Grid */}
            <EquipmentGrid gearData={sections.gear} />

            {/* 6. BiS Tracker */}
            <BisTracker
              bisData={sections.bis}
              characterId={character.id}
              guildId={guildId}
              classColor={classColor}
            />

            {/* 7. Professions */}
            <ProfessionsSection
              professionsData={sections.professions}
              characterId={character.id}
              guildId={guildId}
              currentWeek={currentWeek}
            />

            {/* 8. Talent Builds */}
            <TalentBuildsSection
              talentsData={sections.talents}
              characterId={character.id}
              guildId={guildId}
            />

            {/* 9. Weekly Progress Granular */}
            <WeeklyProgressGranular
              vaultData={sections.vault}
              characterId={character.id}
              guildId={guildId}
              currentWeek={currentWeek}
              onVaultUpdate={handleVaultUpdate}
            />
          </>
        )}
      </div>
    </>
  );
}
