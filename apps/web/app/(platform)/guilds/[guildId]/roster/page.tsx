'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGuild } from '../../../../lib/guild-context';
import { useAuth } from '../../../../lib/auth-context';
import { progressApi } from '../../../../lib/api';
import { Icon, Button } from '@hool/design-system';
import { CharacterCard, formatRelativeTime } from './components/character-card';
import { AddCharacterCard } from './components/add-character-card';
import { PageSkeleton } from '../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../components/error-message';

interface VaultSlotData {
  unlocked: boolean;
  ilvl: number;
}

interface CharacterData {
  id: number;
  character_name: string;
  realm: string;
  class_name: string;
  spec: string;
  role: 'Tank' | 'Healer' | 'DPS';
  current_ilvl: number;
  avatar_url: string | null;
  user_bnet_id: number | null;
  progress?: {
    status: 'ahead' | 'behind' | 'unknown';
    target_ilvl?: number;
    weekly_tasks_completed?: number;
    weekly_tasks_total?: number;
  };
  vault_slots?: {
    raid: VaultSlotData[];
    dungeon: VaultSlotData[];
    world: VaultSlotData[];
  };
  crests?: {
    weathered: number;
    carved: number;
    runed: number;
    gilded: number;
  };
  crests_cumulative?: {
    weathered: number;
    carved: number;
    runed: number;
    gilded: number;
  };
  crest_cap?: number;
  last_gear_sync: string | null;
}

type SortBy = 'custom' | 'name' | 'class' | 'ilvl' | 'weekly';

type DropZone = 'left' | 'right' | 'center' | null;

function getDropZone(e: React.DragEvent, rect: DOMRect): DropZone {
  const relX = (e.clientX - rect.left) / rect.width;
  if (relX < 0.33) return 'left';
  if (relX > 0.67) return 'right';
  return 'center';
}

function DraggableCard({
  char,
  index,
  guildId,
  fetchCharacters,
  draggedIndex,
  onDragStart,
  onDrop,
  dropZone,
  onDragOverCard,
  onDragLeaveCard,
  dragEnabled,
  targetIlvl,
}: {
  char: CharacterData;
  index: number;
  guildId: string;
  fetchCharacters: () => void;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDrop: (targetIndex: number, zone: DropZone) => void;
  dropZone: DropZone;
  onDragOverCard: (index: number, zone: DropZone) => void;
  onDragLeaveCard: (index: number) => void;
  dragEnabled: boolean;
  targetIlvl: number;
}) {
  const isDragged = draggedIndex === index;
  const isTarget = dropZone !== null && draggedIndex !== null && draggedIndex !== index;

  return (
    <motion.div
      layout
      layoutId={`card-${char.id}`}
      transition={{ layout: { type: 'spring', stiffness: 400, damping: 28 } }}
      draggable={dragEnabled}
      onDragStart={(e) => {
        if (!dragEnabled) return;
        // Set drag image with slight offset
        const el = e.currentTarget as HTMLElement;
        if ('dataTransfer' in e) {
          const dt = (e as unknown as React.DragEvent).nativeEvent.dataTransfer;
          if (dt) {
            dt.effectAllowed = 'move';
            dt.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
          }
        }
        onDragStart(index);
      }}
      onDragOver={(e) => {
        if (!dragEnabled) return;
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const zone = getDropZone(e as unknown as React.DragEvent, rect);
        onDragOverCard(index, zone);
      }}
      onDragLeave={() => { if (dragEnabled) onDragLeaveCard(index); }}
      onDrop={(e) => {
        if (!dragEnabled) return;
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const zone = getDropZone(e as unknown as React.DragEvent, rect);
        onDrop(index, zone);
      }}
      onDragEnd={() => {
        // Fires on the dragged element when drag ends (even if dropped outside)
      }}
      style={{
        opacity: isDragged ? 0.4 : 1,
        position: 'relative',
        cursor: dragEnabled ? 'grab' : 'default',
      }}
    >
      {/* Drop zone indicator */}
      {isTarget && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
            borderRadius: '12px',
            ...(dropZone === 'left'
              ? { borderLeft: '3px solid #8b5cf6', background: 'linear-gradient(90deg, rgba(139,92,246,0.15), transparent 40%)' }
              : dropZone === 'right'
              ? { borderRight: '3px solid #8b5cf6', background: 'linear-gradient(-90deg, rgba(139,92,246,0.15), transparent 40%)' }
              : { border: '2px solid #8b5cf6', background: 'rgba(139,92,246,0.08)' }),
          }}
        />
      )}

      <CharacterCard
        guildId={guildId}
        characterId={char.id}
        characterName={char.character_name}
        realm={char.realm}
        avatarUrl={char.avatar_url ?? undefined}
        className={char.class_name}
        spec={char.spec}
        role={char.role}
        currentIlvl={char.current_ilvl}
        targetIlvl={targetIlvl}
        weeklyTasksCompleted={char.progress?.weekly_tasks_completed}
        weeklyTasksTotal={char.progress?.weekly_tasks_total}
        vaultSlots={char.vault_slots}
        crests={char.crests}
        crestsCumulative={char.crests_cumulative}
        crestCap={char.crest_cap}
        lastSynced={char.last_gear_sync}
        onDelete={fetchCharacters}
      />
    </motion.div>
  );
}

// Class sort order (tanks first, then healers, then DPS)
const CLASS_SORT_ORDER: Record<string, number> = {
  'Death Knight': 0, 'Warrior': 1, 'Paladin': 2, 'Monk': 3,
  'Druid': 4, 'Demon Hunter': 5, 'Evoker': 6, 'Priest': 7,
  'Shaman': 8, 'Mage': 9, 'Hunter': 10, 'Warlock': 11, 'Rogue': 12,
};

function sortCharacters(chars: CharacterData[], sortBy: SortBy): CharacterData[] {
  if (sortBy === 'custom') return chars;
  const sorted = [...chars];
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.character_name.localeCompare(b.character_name));
      break;
    case 'class':
      sorted.sort((a, b) => (CLASS_SORT_ORDER[a.class_name] ?? 99) - (CLASS_SORT_ORDER[b.class_name] ?? 99));
      break;
    case 'ilvl':
      sorted.sort((a, b) => (b.current_ilvl ?? 0) - (a.current_ilvl ?? 0));
      break;
    case 'weekly': {
      const pct = (c: CharacterData) => {
        const total = c.progress?.weekly_tasks_total ?? 0;
        if (total === 0) return 0;
        return (c.progress?.weekly_tasks_completed ?? 0) / total;
      };
      sorted.sort((a, b) => pct(b) - pct(a));
      break;
    }
  }
  return sorted;
}

function getMostRecentSync(chars: CharacterData[]): string | null {
  let latest: string | null = null;
  for (const c of chars) {
    if (c.last_gear_sync && (!latest || c.last_gear_sync > latest)) {
      latest = c.last_gear_sync;
    }
  }
  return latest;
}

export default function RosterPage() {
  const { guild, guildId, members: guildMembers } = useGuild();
  const { user } = useAuth();
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('custom');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [targetIlvl, setTargetIlvl] = useState<number>(0);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ index: number; zone: DropZone } | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!guildId || !user || !guildMembers) return;

    setIsLoading(true);
    setError(null);

    try {
      const [data, seasonData] = await Promise.all([
        progressApi.get<{
          characters: Array<Record<string, any>>;
          guild_id: number;
          current_week?: number;
        }>(`/guilds/${guildId}/characters`),
        progressApi.get<{ current_target_ilvl: number }>(`/guilds/${guildId}/season`).catch(() => null),
      ]);

      if (seasonData?.current_target_ilvl) {
        setTargetIlvl(seasonData.current_target_ilvl);
      }

      const userGuildMembers = guildMembers.filter(
        (m) => m.bnet_id === user.bnet_id
      );

      const userCharNames = new Set(
        userGuildMembers.map((m) => m.character_name.toLowerCase())
      );

      // Map API response to CharacterData shape
      const mapped: CharacterData[] = data.characters
        .filter((c) =>
          c.user_bnet_id === user.bnet_id || userCharNames.has((c.character_name as string).toLowerCase())
        )
        .map((c) => {
          const vaultSummary = c.vault_summary as Record<string, any> | null;
          const crestsSummary = c.crests_summary as { week: Record<string, number> | null; cumulative: Record<string, number> | null; cap: number } | null;
          const calcSlots = vaultSummary?.calculated_slots as Record<string, any[]> | undefined;

          const toSlotArray = (key: string, count: number): VaultSlotData[] => {
            const src = calcSlots?.[key] ?? [];
            return Array.from({ length: count }, (_, i) => ({
              unlocked: src[i]?.unlocked ?? false,
              ilvl: src[i]?.ilvl ?? 0,
            }));
          };

          return {
            id: c.id,
            character_name: c.character_name,
            realm: c.realm,
            class_name: c.class_name ?? '',
            spec: c.spec ?? '',
            role: c.role ?? 'DPS',
            current_ilvl: c.current_ilvl,
            avatar_url: c.avatar_url ?? null,
            user_bnet_id: c.user_bnet_id ?? null,
            last_gear_sync: c.last_gear_sync ?? null,
            progress: {
              status: 'unknown' as const,
              weekly_tasks_completed: c.weekly_tasks_completed ?? 0,
              weekly_tasks_total: c.weekly_tasks_total ?? 0,
            },
            vault_slots: vaultSummary ? {
              raid: toSlotArray('raid_slots', 3),
              dungeon: toSlotArray('dungeon_slots', 3),
              world: toSlotArray('world_slots', 3),
            } : undefined,
            crests: crestsSummary?.week ? {
              weathered: crestsSummary.week.Weathered ?? 0,
              carved: crestsSummary.week.Carved ?? 0,
              runed: crestsSummary.week.Runed ?? 0,
              gilded: crestsSummary.week.Gilded ?? 0,
            } : undefined,
            crests_cumulative: crestsSummary?.cumulative ? {
              weathered: crestsSummary.cumulative.Weathered ?? 0,
              carved: crestsSummary.cumulative.Carved ?? 0,
              runed: crestsSummary.cumulative.Runed ?? 0,
              gilded: crestsSummary.cumulative.Gilded ?? 0,
            } : undefined,
            crest_cap: crestsSummary?.cap ?? 0,
          };
        });

      setCharacters(mapped);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load characters'
      );
    } finally {
      setIsLoading(false);
    }
  }, [guildId, user, guildMembers]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
    setHoverTarget(null);
  }, []);

  const handleDragOverCard = useCallback((index: number, zone: DropZone) => {
    setHoverTarget((prev) => {
      if (prev && prev.index === index && prev.zone === zone) return prev;
      return { index, zone };
    });
  }, []);

  const handleDragLeaveCard = useCallback((index: number) => {
    setHoverTarget((prev) => {
      if (prev && prev.index === index) return null;
      return prev;
    });
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number, zone: DropZone) => {
      if (draggedIndex === null || draggedIndex === targetIndex) {
        setDraggedIndex(null);
        setHoverTarget(null);
        return;
      }

      setCharacters((prev) => {
        const next = [...prev];
        const dragged = next[draggedIndex];

        if (zone === 'center') {
          // Swap
          next[draggedIndex] = next[targetIndex];
          next[targetIndex] = dragged;
        } else {
          // Remove dragged
          next.splice(draggedIndex, 1);
          // Find adjusted target index
          let insertAt = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
          if (zone === 'right') insertAt++;
          next.splice(insertAt, 0, dragged);
        }

        // Persist order
        setTimeout(async () => {
          try {
            await progressApi.post(`/guilds/${guildId}/characters/reorder`, {
              order: next.map((c, i) => ({ id: c.id, display_order: i })),
            });
          } catch (err) {
            console.error('Failed to save character order:', err);
          }
        }, 100);

        return next;
      });

      setDraggedIndex(null);
      setHoverTarget(null);
    },
    [draggedIndex, guildId],
  );

  const handleSyncAll = useCallback(async () => {
    if (isSyncingAll || characters.length === 0) return;
    setIsSyncingAll(true);
    try {
      await progressApi.post(`/guilds/${guildId}/characters/${characters[0].id}/gear/sync-all`);
      await fetchCharacters();
    } catch (err) {
      console.error('Failed to sync all characters:', err);
    } finally {
      setIsSyncingAll(false);
    }
  }, [isSyncingAll, characters, guildId, fetchCharacters]);

  const mostRecentSync = getMostRecentSync(characters);
  const displayCharacters = sortCharacters(characters, sortBy);
  const dragEnabled = sortBy === 'custom';

  // Clear drag state if drag ends without a drop (e.g. pressed Escape)
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedIndex(null);
      setHoverTarget(null);
    };
    document.addEventListener('dragend', handleDragEnd);
    return () => document.removeEventListener('dragend', handleDragEnd);
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Characters"
        message={error}
        onRetry={fetchCharacters}
      />
    );
  }

  const sortOptions: { key: SortBy; label: string; icon: string }[] = [
    { key: 'custom', label: 'Custom', icon: 'grip-vertical' },
    { key: 'name', label: 'Name', icon: 'arrow-up-down' },
    { key: 'class', label: 'Class', icon: 'shield' },
    { key: 'ilvl', label: 'iLvl', icon: 'arrow-down' },
    { key: 'weekly', label: 'Weekly', icon: 'check' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1 className="text-2xl font-bold text-white m-0">My Roster</h1>
        <p className="text-white/45 mt-1" style={{ fontSize: '0.8125rem' }}>
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sortOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '9999px',
                fontSize: '12px', fontWeight: 600,
                border: sortBy === key ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                background: sortBy === key ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                color: sortBy === key ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name={icon} size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Right side: Sync All + Last synced */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {mostRecentSync && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
              Last synced {formatRelativeTime(mostRecentSync)}
            </span>
          )}
          <Button
            variant="glass"
            size="sm"
            icon={<Icon name="refresh" size={14} animation={isSyncingAll ? 'spin' : 'spin-once'} />}
            onClick={handleSyncAll}
            disabled={isSyncingAll || characters.length === 0}
          >
            {isSyncingAll ? 'Syncing...' : 'Sync All'}
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))',
          gap: '40px 16px',
        }}
      >
        {displayCharacters.map((char, i) => (
          <DraggableCard
            key={char.id}
            char={char}
            index={i}
            guildId={guildId}
            fetchCharacters={fetchCharacters}
            draggedIndex={draggedIndex}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            dropZone={hoverTarget?.index === i ? hoverTarget.zone : null}
            onDragOverCard={handleDragOverCard}
            onDragLeaveCard={handleDragLeaveCard}
            dragEnabled={dragEnabled}
            targetIlvl={targetIlvl}
          />
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AddCharacterCard
            guildId={guildId}
            onCharacterAdded={fetchCharacters}
          />
        </div>
      </div>
    </div>
  );
}
