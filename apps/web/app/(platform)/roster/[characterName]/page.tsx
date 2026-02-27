'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { progressApi } from '../../../lib/api';
import { Card, Icon } from '@hool/design-system';
import { PageSkeleton } from '../../../components/loading-skeleton';
import { ErrorMessage } from '../../../components/error-message';
import { CLASS_COLORS } from './utils';
import type {
  CharacterRoster,
  SeasonResponse,
  TasksResponse,
  TasksSummaryResponse,
  VaultResponse,
  CrestsResponse,
  GearResponse,
  BisResponse,
  ProfessionsResponse,
  TalentsResponse,
  ParsesResponse,
} from './types';

// Section components
import { CharacterHeader } from './components/character-header';
import { SeasonTimeline } from './components/season-timeline';
import { WeeklyTasksSection } from './components/weekly-tasks-section';
import { VaultAndCrests } from './components/vault-and-crests';
import { EquipmentGrid } from './components/equipment-grid';
import { RaidParses } from './components/raid-parses';
import { BisTracker } from './components/bis-tracker';
import { ProfessionsSection } from './components/professions-section';
import { TalentBuildsSection } from './components/talent-builds-section';
import { WeeklyProgressGranular } from './components/weekly-progress-granular';

// Section data state — each section can be independently loaded or failed
interface SectionData {
  season: SeasonResponse | null;
  tasks: TasksResponse | null;
  tasksSummary: TasksSummaryResponse | null;
  vault: VaultResponse | null;
  crests: CrestsResponse | null;
  gear: GearResponse | null;
  bis: BisResponse | null;
  professions: ProfessionsResponse | null;
  talents: TalentsResponse | null;
  parses: ParsesResponse | null;
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
    tasksSummary: null,
    vault: null,
    crests: null,
    gear: null,
    bis: null,
    professions: null,
    talents: null,
    parses: null,
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
    if (!characterName || !realm) {
      if (!realm) setError('Realm parameter is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await progressApi.get<{
        characters: CharacterRoster[];
      }>(`/users/me/characters`);

      const match = data.characters.find(
        (c) =>
          c.character_name.toLowerCase() === characterName.toLowerCase() &&
          c.realm.toLowerCase() === realm.toLowerCase()
      );

      if (!match) {
        setError(`Character "${characterName}" on "${realm}" not found in your roster.`);
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
  }, [characterName, realm]);

  useEffect(() => {
    resolveCharacter();
  }, [resolveCharacter]);

  // Phase 2: Fetch all section data in parallel once character is resolved
  const fetchSections = useCallback(async (char: CharacterRoster) => {
    setSectionsLoading(true);
    const cid = char.id;

    // TODO: We need to implement these endpoints on the backend for /users/me/characters/<cid>/...
    // For now, this will fail until the backend supports it, but the UI structure is correct.
    const [
      seasonResult,
      tasksResult,
      tasksSummaryResult,
      vaultResult,
      crestsResult,
      gearResult,
      bisResult,
      professionsResult,
      talentsResult,
      parsesResult,
    ] = await Promise.allSettled([
      progressApi.get<SeasonResponse>(`/users/me/season`), // Global or user-specific season
      progressApi.get<TasksResponse>(`/users/me/characters/${cid}/tasks`),
      progressApi.get<TasksSummaryResponse>(`/users/me/characters/${cid}/tasks/summary`),
      progressApi.get<VaultResponse>(`/users/me/characters/${cid}/vault`),
      progressApi.get<CrestsResponse>(`/users/me/characters/${cid}/crests`),
      progressApi.get<GearResponse>(`/users/me/characters/${cid}/gear`),
      progressApi.get<BisResponse>(`/users/me/characters/${cid}/bis`),
      progressApi.get<ProfessionsResponse>(`/users/me/characters/${cid}/professions`),
      progressApi.get<TalentsResponse>(`/users/me/characters/${cid}/talents`),
      progressApi.get<ParsesResponse>(`/users/me/characters/${cid}/parses`),
    ]);

    // Log failures for debugging
    const results = { seasonResult, tasksResult, tasksSummaryResult, vaultResult, crestsResult, gearResult, bisResult, professionsResult, talentsResult, parsesResult };
    for (const [name, result] of Object.entries(results)) {
      if (result.status === 'rejected') {
        console.error(`[CharacterDetail] ${name} failed:`, result.reason);
      }
    }

    setSections({
      season: seasonResult.status === 'fulfilled' ? seasonResult.value : null,
      tasks: tasksResult.status === 'fulfilled' ? tasksResult.value : null,
      tasksSummary: tasksSummaryResult.status === 'fulfilled' ? tasksSummaryResult.value : null,
      vault: vaultResult.status === 'fulfilled' ? vaultResult.value : null,
      crests: crestsResult.status === 'fulfilled' ? crestsResult.value : null,
      gear: gearResult.status === 'fulfilled' ? gearResult.value : null,
      bis: bisResult.status === 'fulfilled' ? bisResult.value : null,
      professions: professionsResult.status === 'fulfilled' ? professionsResult.value : null,
      talents: talentsResult.status === 'fulfilled' ? talentsResult.value : null,
      parses: parsesResult.status === 'fulfilled' ? parsesResult.value : null,
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
  }, []);

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
    router.push(`/roster`);
  }, [router]);

  const handleTasksChange = useCallback((tasks: TasksResponse) => {
    setSections((prev) => {
      // Optimistically update the tasks summary for the current week
      const weekKey = String(tasks.current_week);
      const allTasks = [...tasks.weekly, ...tasks.daily];
      const completed = allTasks.filter((t) => t.done).length;
      const total = allTasks.length;

      const updatedSummary = prev.tasksSummary ? {
        ...prev.tasksSummary,
        weeks: {
          ...prev.tasksSummary.weeks,
          [weekKey]: { completed, total, all_done: total > 0 && completed >= total },
        },
      } : null;

      return { ...prev, tasks, tasksSummary: updatedSummary };
    });
  }, []);

  const handleVaultUpdate = useCallback(async () => {
    if (!character) return;
    try {
      const vault = await progressApi.get<VaultResponse>(
        `/users/me/characters/${character.id}/vault`
      );
      setSections((prev) => ({ ...prev, vault }));
    } catch {
      // silently fail — user will see stale data
    }
  }, [character]);

  const handleCrestsUpdate = useCallback(async () => {
    if (!character) return;
    try {
      const crests = await progressApi.get<CrestsResponse>(
        `/users/me/characters/${character.id}/crests`
      );
      setSections((prev) => ({ ...prev, crests }));
    } catch {
      // silently fail — user will see stale data
    }
  }, [character]);

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
        strategy="afterInteractive"
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
              <div id="section-timeline">
                <SeasonTimeline
                  seasonData={sections.season}
                  currentIlvl={character.current_ilvl}
                  selectedWeek={selectedWeek}
                  onWeekSelect={setSelectedWeek}
                  tasksSummary={sections.tasksSummary}
                />
              </div>
            ) : sectionErrors.season ? (
              <SectionError label="Season Timeline" error={sectionErrors.season} />
            ) : null}

            {/* 3. Weekly Tasks */}
            {sections.tasks ? (
              <div id="section-tasks">
                <WeeklyTasksSection
                  tasksData={sections.tasks}
                  characterId={character.id}
                  classColor={classColor}
                  selectedWeek={selectedWeek}
                  onTasksChange={handleTasksChange}
                />
              </div>
            ) : sectionErrors.tasks ? (
              <SectionError label="Weekly Tasks" error={sectionErrors.tasks} />
            ) : null}

            {/* 4. Great Vault + Crests (side-by-side) */}
            <div id="section-vault-crests">
              <VaultAndCrests
                vaultData={sections.vault}
                crestsData={sections.crests}
                characterId={character.id}
                currentWeek={currentWeek}
                selectedWeek={selectedWeek}
                onCrestsUpdate={handleCrestsUpdate}
              />
            </div>

            {/* 5. Weekly Progress Granular */}
            <WeeklyProgressGranular
              vaultData={sections.vault}
              characterId={character.id}
              currentWeek={currentWeek}
              classColor={classColor}
              onVaultUpdate={handleVaultUpdate}
            />

            {/* 6. Equipment Grid */}
            <EquipmentGrid
              gearData={sections.gear}
              renderUrl={character.render_url}
            />

            {/* 7. Raid Performance (WCL Parses) */}
            <RaidParses parsesData={sections.parses} />

            {/* 8. BiS Tracker */}
            <BisTracker
              bisData={sections.bis}
              characterId={character.id}
              classColor={classColor}
            />

            {/* 9. Professions */}
            <ProfessionsSection
              professionsData={sections.professions}
              characterId={character.id}
              currentWeek={currentWeek}
              classColor={classColor}
            />

            {/* 10. Talent Builds */}
            <TalentBuildsSection
              talentsData={sections.talents}
              characterId={character.id}
              classColor={classColor}
            />
          </>
        )}
      </div>
    </>
  );
}
