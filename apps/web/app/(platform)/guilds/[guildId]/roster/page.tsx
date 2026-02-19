'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGuild } from '../../../../lib/guild-context';
import { useAuth } from '../../../../lib/auth-context';
import { progressApi } from '../../../../lib/api';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { CharacterCard } from './components/character-card';
import { PageSkeleton } from '../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../components/error-message';
import { Card, Icon } from '@hool/design-system';

interface CharacterData {
  character_name: string;
  class_name: string;
  spec: string;
  role: 'Tank' | 'Healer' | 'DPS';
  current_ilvl: number;
  bnet_id: string;
  progress?: {
    status: 'ahead' | 'behind' | 'unknown';
  };
}

export default function RosterPage() {
  const { guild, guildId } = useGuild();
  const { user } = useAuth();
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster' },
  ];

  const fetchCharacters = useCallback(async () => {
    if (!guildId || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await progressApi.get<CharacterData[]>(
        `/guilds/${guildId}/progress/characters`
      );

      // Filter to user's characters based on bnet_id match
      const userCharacters = data.filter((char) => char.bnet_id === user.id);
      setCharacters(userCharacters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load characters'
      );
    } finally {
      setIsLoading(false);
    }
  }, [guildId, user]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

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
          title="Failed to Load Characters"
          message={error}
          onRetry={fetchCharacters}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-2xl font-bold text-white m-0">My Roster</h1>
        <p className="text-white/45 mt-1" style={{ fontSize: '0.8125rem' }}>
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {characters.map((char) => (
            <CharacterCard
              key={char.character_name}
              guildId={guildId}
              characterName={char.character_name}
              className={char.class_name}
              spec={char.spec}
              role={char.role}
              currentIlvl={char.current_ilvl}
              status={char.progress?.status || 'unknown'}
            />
          ))}
        </div>
      ) : (
        <Card padding="lg" variant="elevated">
          <div className="flex flex-col items-center gap-3 text-center p-8">
            <Icon name="user" size={48} className="text-white/15" />
            <h3 className="text-base font-bold text-white m-0">
              No Characters Yet
            </h3>
            <p className="text-sm text-white/50 m-0 max-w-80">
              Add your characters to start tracking progress
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
