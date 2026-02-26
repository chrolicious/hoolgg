'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth-context';
import { Button } from '@hool/design-system';

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

        <Button variant="blue" size="lg" onClick={login}>
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
