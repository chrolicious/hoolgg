'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProgressRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;

  useEffect(() => {
    // Redirect old /progress route to new /roster route
    router.replace(`/guilds/${guildId}/roster`);
  }, [guildId, router]);

  return null;
}
