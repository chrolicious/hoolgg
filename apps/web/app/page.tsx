'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth-context';
import { Button } from '@hool/design-system';

function BattleNetLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.3 2.1c-2.4.3-4 .8-4 .8s2 2.5 3.3 5.8c.6 1.4 1 2.9 1.4 4.3 2.2-.4 4.5-.5 6.8-.3 1.5.1 3 .4 4.4.8C41.4 6.2 35.8 1.7 32.3 2.1zM18.7 7.5c-3.6 2.5-6 5.7-6 5.7s3.2.5 6.7 2c1.5.6 2.9 1.4 4.2 2.2 1.3-1.8 2.9-3.5 4.7-5 1.2-1 2.5-1.8 3.8-2.6-2.8-1.8-7.7-5.4-13.4-2.3zM9.5 21.5c-1.6 4.2-1.5 8.2-1.5 8.2s2.6-1.9 6.1-3.2c1.4-.5 2.9-1 4.3-1.3-.5-2.2-.7-4.5-.5-6.8.1-1.5.4-3 .8-4.4C11.4 17.1 10.5 19 9.5 21.5zM7.9 39.6c1.4 3.9 3.8 6.7 3.8 6.7s.8-3.2 2.7-6.4c.8-1.4 1.7-2.6 2.7-3.8-1.9-1.2-3.7-2.6-5.3-4.3-1-1.1-2-2.3-2.8-3.6-2.3 3.3-3.3 7-1.1 11.4zM18.8 53.6c3.9 1.4 7.6.9 7.6.9s-1.4-3-2.3-6.6c-.4-1.5-.7-3.1-.8-4.6-2.2.6-4.5 1-6.8 1-1.5 0-3-.2-4.5-.5 1.7 4.2 3.6 8.2 6.8 9.8zM33.4 59.3c4.1-.8 6.9-3 6.9-3s-3.1-1.1-6.2-3.2c-1.3-.9-2.5-1.9-3.5-3-1.4 1.7-3 3.3-4.9 4.6-1.2.8-2.5 1.6-3.8 2.1 3.6 1.8 7.7 3.3 11.5 2.5zM48.5 53c2.2-3.5 2.5-7.2 2.5-7.2s-3 1.6-6.5 2.6c-1.5.4-3 .7-4.5.9.7 2.1 1.2 4.4 1.3 6.7.1 1.5 0 3-.2 4.4 3.5-2 6-3.9 7.4-7.4zM56.7 39.3c-.5-4.2-2.4-7.3-2.4-7.3s-1.1 3.1-3.4 6.1c-1 1.3-2.1 2.4-3.3 3.4 1.8 1.3 3.5 2.9 4.9 4.7 1 1.2 1.8 2.4 2.5 3.7 1.6-3.8 2.3-6.8 1.7-10.6zM57.3 24.4c-2.7-3-6.2-4.2-6.2-4.2s1.1 3.1 1.3 6.7c.1 1.5 0 3.1-.2 4.6 2.2-.3 4.5-.4 6.8-.1 1.5.2 2.9.5 4.3 1-1.1-4.3-3-7-6-8z" />
    </svg>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/roster');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0b12' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255, 255, 255, 0.1)', borderTopColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0e0b12', color: '#fff' }}>
      {/* Hero */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh', padding: '2rem 1rem', textAlign: 'center', gap: '2rem',
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
          hool.gg
        </h1>
        <p style={{
          fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '520px',
          lineHeight: 1.6, margin: 0,
        }}>
          Guild Management Dashboard for WoW. Track your roster, find recruits across platforms, and keep your raid team on the same page.
        </p>

        <Button variant="blue" size="lg" onClick={login} icon={<BattleNetLogo />}>
          Login with Battle.net
        </Button>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem', maxWidth: '900px', margin: '0 auto', padding: '0 2rem 4rem',
      }}>
        {[
          {
            title: 'Roster Tracking',
            description: 'Auto-synced character data from Battle.net and Raider.io. Gear, M+ score, raid progress — all in one view.',
          },
          {
            title: 'Weekly Prep',
            description: 'Granular weekly tasks per character. Track vault progress, crest spending, and raid readiness across your alts.',
          },
          {
            title: 'Recruitment Pipeline',
            description: 'Search for players across Raider.io, WoW Progress, and Discord. Track candidates through your recruitment process.',
          },
        ].map((feature) => (
          <div key={feature.title} style={{
            padding: '1.5rem', borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              {feature.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.6, margin: 0 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
