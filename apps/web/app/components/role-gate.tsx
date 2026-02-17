'use client';

import React from 'react';
import { useGuild } from '../lib/guild-context';

interface RoleGateProps {
  /** Minimum rank required (0 = GM, 1 = Officer). User rank must be <= minRank. */
  minRank: number;
  children: React.ReactNode;
  /** Optional fallback to render when user doesn't meet rank requirement */
  fallback?: React.ReactNode;
}

/**
 * RoleGate — Conditionally renders children based on the user's guild rank.
 *
 * WoW guild ranks: 0 = Guild Master, 1 = Officer, etc.
 * Lower rank_id = higher authority. User can see content if their rank_id <= minRank.
 *
 * Usage:
 * <RoleGate minRank={1}>
 *   <Button>Officer-only action</Button>
 * </RoleGate>
 */
export function RoleGate({ minRank, children, fallback = null }: RoleGateProps) {
  const { userRank } = useGuild();

  if (userRank === null || userRank > minRank) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
