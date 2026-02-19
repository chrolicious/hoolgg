'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGuild } from '../../../../../lib/guild-context';
import { progressApi } from '../../../../../lib/api';
import { Breadcrumb } from '../../../../../components/breadcrumb';
import { Card, Icon } from '@hool/design-system';
import { PageSkeleton } from '../../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../../components/error-message';
import { CharacterProgressCard } from '../../progress/components/character-progress-card';
import type { CharacterProgressData } from '../../progress/components/character-progress-card';
import { IlvlTracker } from '../../progress/components/ilvl-tracker';
import { GearPriorityList } from '../../progress/components/gear-priority-list';
import type { GearSlotPriority } from '../../progress/components/gear-priority-list';

// WoW class colors from official Blizzard palette
const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  Druid: '#FF7C0A',
  Evoker: '#33937F',
  Hunter: '#AAD372',
  Mage: '#3FC7EB',
  Monk: '#00FF98',
  Paladin: '#F48CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF468',
  Shaman: '#0070DD',
  Warlock: '#8788EE',
  Warrior: '#C69B6D',
};

type Tab = 'overview' | 'bis' | 'vault' | 'professions';

interface TabConfig {
  id: Tab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'bis', label: 'BiS List', icon: 'target' },
  { id: 'vault', label: 'Great Vault', icon: 'package' },
  { id: 'professions', label: 'Professions', icon: 'briefcase' },
];

interface CharacterData {
  character_name: string;
  class_name: string;
  spec: string;
  role?: 'Tank' | 'Healer' | 'DPS';
  current_ilvl: number;
  bnet_id: string;
  target_ilvl?: number;
  gear_priorities?: GearSlotPriority[];
  progress?: {
    target_ilvl: number;
    current_week: number;
    status: 'ahead' | 'behind' | 'unknown';
    message?: string;
  };
}

export default function CharacterDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { guild, guildId } = useGuild();

  const characterName = decodeURIComponent(params.characterName as string);
  const activeTab = (searchParams.get('tab') as Tab) || 'overview';

  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster', href: `/guilds/${guildId}/roster` },
    { label: characterName },
  ];

  const fetchCharacterData = useCallback(async () => {
    if (!guildId || !characterName) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch character detail data (includes gear priorities)
      const data = await progressApi.get<{
        character: {
          character_name: string;
          class_name: string;
          spec_name: string;
          current_ilvl: number;
          bnet_id: string;
        };
        target_ilvl: number;
        current_week: number;
        gear_priorities: GearSlotPriority[];
      }>(
        `/guilds/${guildId}/progress/character/${encodeURIComponent(characterName)}`
      );

      // Transform to CharacterData format
      setCharacterData({
        character_name: data.character.character_name,
        class_name: data.character.class_name,
        spec: data.character.spec_name,
        current_ilvl: data.character.current_ilvl,
        bnet_id: data.character.bnet_id,
        target_ilvl: data.target_ilvl,
        gear_priorities: data.gear_priorities || [],
      });
    } catch (err) {
      console.error('Failed to fetch character data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load character data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [guildId, characterName]);

  useEffect(() => {
    fetchCharacterData();
  }, [fetchCharacterData]);

  const handleTabClick = (tabId: Tab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.push(url.pathname + url.search);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb items={breadcrumbItems} />
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage
          title="Failed to Load Character"
          message={error}
          onRetry={fetchCharacterData}
        />
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb items={breadcrumbItems} />
        <Card padding="lg" variant="elevated">
          <div className="flex flex-col items-center gap-3 text-center p-8">
            <Icon name="user" size={48} className="text-white/15" />
            <h3 className="text-base font-bold text-white m-0">
              Character Not Found
            </h3>
            <p className="text-sm text-white/50 m-0 max-w-80">
              The character "{characterName}" could not be found.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const classColor = CLASS_COLORS[characterData.class_name] || '#FFFFFF';

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Character Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2"
      >
        <h1
          className="text-3xl font-bold m-0"
          style={{ color: classColor }}
        >
          {characterData.character_name}
        </h1>
        <div className="flex items-center gap-3 text-white/60">
          <span className="text-sm">
            {characterData.spec} {characterData.class_name}
          </span>
          {characterData.role && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-sm">{characterData.role}</span>
            </>
          )}
          <span className="text-white/30">•</span>
          <div className="flex items-center gap-1.5">
            <Icon name="zap" size={14} />
            <span className="text-sm font-medium">
              {characterData.current_ilvl} ilvl
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-2 p-1 rounded-lg bg-white/5"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md border-none cursor-pointer
                transition-colors flex-1
                ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
              whileHover={!isActive ? { scale: 1.02 } : undefined}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              aria-pressed={isActive}
            >
              <Icon name={tab.icon} size={16} />
              <span className="text-sm">{tab.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,1fr)_minmax(300px,2fr)] gap-4">
            {/* Left column: Character card and ilvl tracker */}
            <div className="flex flex-col gap-4">
              <CharacterProgressCard
                character={{
                  character_name: characterData.character_name,
                  class_name: characterData.class_name,
                  spec: characterData.spec,
                  role: characterData.role || 'DPS',
                  current_ilvl: characterData.current_ilvl,
                  target_ilvl: characterData.target_ilvl || characterData.current_ilvl,
                  status: characterData.progress?.status || 'unknown',
                  message: characterData.progress?.message,
                }}
                isSelected
              />
              <IlvlTracker
                currentIlvl={characterData.current_ilvl}
                targetIlvl={characterData.target_ilvl || characterData.current_ilvl}
                characterName={characterData.character_name}
              />
            </div>

            {/* Right column: Gear priorities */}
            <div>
              <GearPriorityList
                priorities={characterData.gear_priorities || []}
                characterName={characterData.character_name}
              />
            </div>
          </div>
        )}

        {activeTab === 'bis' && (
          <Card padding="lg" variant="elevated">
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <Icon name="target" size={48} className="text-white/15" />
              <h3 className="text-base font-bold text-white m-0">
                BiS List
              </h3>
              <p className="text-sm text-white/50 m-0 max-w-80">
                BiS List coming soon
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'vault' && (
          <Card padding="lg" variant="elevated">
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <Icon name="package" size={48} className="text-white/15" />
              <h3 className="text-base font-bold text-white m-0">
                Great Vault
              </h3>
              <p className="text-sm text-white/50 m-0 max-w-80">
                Vault content coming soon
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'professions' && (
          <Card padding="lg" variant="elevated">
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <Icon name="briefcase" size={48} className="text-white/15" />
              <h3 className="text-base font-bold text-white m-0">
                Professions
              </h3>
              <p className="text-sm text-white/50 m-0 max-w-80">
                Professions content coming soon
              </p>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
