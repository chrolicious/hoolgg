'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

export interface TrackedCharacter {
  id: string;
  guild_id: string;
  bnet_id: number;
  character_name: string;
  realm: string;
  is_main: boolean;
  tracked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseTrackedCharactersResult {
  characters: TrackedCharacter[];
  mainCharacter: TrackedCharacter | null;
  isLoading: boolean;
  error: string | null;
  addCharacter: (name: string, realm: string, isMain?: boolean) => Promise<void>;
  setMainCharacter: (name: string, realm: string) => Promise<void>;
  removeCharacter: (name: string, realm: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTrackedCharacters(guildId: string): UseTrackedCharactersResult {
  const [characters, setCharacters] = useState<TrackedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ characters: TrackedCharacter[] }>(
        `/guilds/${guildId}/tracked-characters`
      );
      setCharacters(response.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch characters');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const addCharacter = useCallback(
    async (name: string, realm: string, isMain = false) => {
      try {
        const response = await api.patch<TrackedCharacter>(
          `/guilds/${guildId}/tracked-characters`,
          {
            character_name: name,
            realm,
            is_main: isMain,
            tracked: true,
          }
        );

        // Update local state
        setCharacters((prev) => {
          const existing = prev.find(
            (c) => c.character_name === name && c.realm === realm
          );
          if (existing) {
            return prev.map((c) =>
              c.character_name === name && c.realm === realm
                ? response
                : isMain
                  ? { ...c, is_main: false }
                  : c
            );
          }
          return [...prev, response];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add character');
        throw err;
      }
    },
    [guildId]
  );

  const setMainCharacter = useCallback(
    async (name: string, realm: string) => {
      await addCharacter(name, realm, true);
    },
    [addCharacter]
  );

  const removeCharacter = useCallback(
    async (name: string, realm: string) => {
      try {
        await api.patch(`/guilds/${guildId}/tracked-characters`, {
          character_name: name,
          realm,
          tracked: false,
        });

        // Update local state
        setCharacters((prev) =>
          prev.filter((c) => !(c.character_name === name && c.realm === realm))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove character');
        throw err;
      }
    },
    [guildId]
  );

  const mainCharacter = characters.find((c) => c.is_main) || null;

  return {
    characters,
    mainCharacter,
    isLoading,
    error,
    addCharacter,
    setMainCharacter,
    removeCharacter,
    refetch: fetchCharacters,
  };
}
