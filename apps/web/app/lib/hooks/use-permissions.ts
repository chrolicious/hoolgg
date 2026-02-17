'use client';

import { useGuild } from '../guild-context';

export function usePermissions() {
  const { canAccess, isGM, isOfficer, userRank } = useGuild();

  return {
    canAccess,
    isGM,
    isOfficer,
    userRank,
  };
}
