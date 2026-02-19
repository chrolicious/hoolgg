'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuild } from '../../../lib/guild-context';

export default function GuildRootPage() {
  const router = useRouter();
  const { isOfficer, guildId } = useGuild();

  // Role-based redirect
  useEffect(() => {
    if (isOfficer) {
      // Officers+ land on dashboard
      router.push(`/guilds/${guildId}/dashboard`);
    } else {
      // Raiders land on roster
      router.push(`/guilds/${guildId}/roster`);
    }
  }, [isOfficer, guildId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-white/50">Redirecting...</div>
    </div>
  );
}
