'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  Guild,
  GuildPermission,
  GuildSettingsResponse,
  GuildMember,
  GuildMembersResponse,
} from './types';
import { api, ApiError } from './api';
import { useAuth } from './auth-context';

interface GuildContextValue {
  guildId: string;
  guild: Guild | null;
  userRank: number | null;
  permissions: GuildPermission[];
  members: GuildMember[];
  memberCount: number;
  isGM: boolean;
  isOfficer: boolean;
  isLoading: boolean;
  error: string | null;
  canAccess: (toolName: string) => boolean;
  refetch: () => Promise<void>;
}

const GuildContext = createContext<GuildContextValue | null>(null);

// WoW guild ranks: 0 = Guild Master, 1 = Officer, 2-9 = members
const GM_RANK = 0;
const OFFICER_RANK = 1;

export function GuildProvider({
  guildId,
  children,
}: {
  guildId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [permissions, setPermissions] = useState<GuildPermission[]>([]);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuildData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [settingsData, membersData] = await Promise.all([
        api.get<GuildSettingsResponse>(`/guilds/${guildId}/settings`),
        api.get<GuildMembersResponse>(`/guilds/${guildId}/members`),
      ]);

      setGuild(settingsData.guild);
      setPermissions(settingsData.permissions);
      setMemberCount(settingsData.member_count);
      setMembers(membersData.members);

      // Find the current user's rank from the member list
      if (user) {
        const userMember = membersData.members.find(
          (m) => m.bnet_id === user.bnet_id
        );
        setUserRank(userMember ? userMember.rank_id : null);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load guild data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [guildId, user]);

  useEffect(() => {
    fetchGuildData();
  }, [fetchGuildData]);

  const isGM = userRank === GM_RANK;
  const isOfficer = userRank !== null && userRank <= OFFICER_RANK;

  const canAccess = useCallback(
    (toolName: string): boolean => {
      if (userRank === null) return false;
      const perm = permissions.find((p) => p.tool_name === toolName);
      if (!perm) return false;
      if (!perm.enabled) return false;
      // Lower rank_id = higher rank. User can access if their rank_id <= min_rank_id
      return userRank <= perm.min_rank_id;
    },
    [userRank, permissions]
  );

  return (
    <GuildContext.Provider
      value={{
        guildId,
        guild,
        userRank,
        permissions,
        members,
        memberCount,
        isGM,
        isOfficer,
        isLoading,
        error,
        canAccess,
        refetch: fetchGuildData,
      }}
    >
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild(): GuildContextValue {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
}
