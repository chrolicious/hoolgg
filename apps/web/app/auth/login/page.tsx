'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { Button } from '@hool/design-system';

function BattleNetLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.94 8.296C15.9 6.892 11.534 6 7.426 6.332c.206-1.36.714-2.308 1.548-2.508 1.148-.275 2.4.48 3.594 1.854.782.102 1.71.28 2.355.429C12.747 2.013 9.828-.282 7.607.565c-1.688.644-2.553 2.97-2.448 6.094-2.2.468-3.915 1.3-5.013 2.495-.056.065-.181.227-.137.305.034.058.146-.008.194-.04 1.274-.89 2.904-1.373 5.027-1.676.303 3.333 1.713 7.56 4.055 10.952-1.28.502-2.356.536-2.946-.087-.812-.856-.784-2.318-.19-4.04a26.764 26.764 0 0 1-.807-2.254c-2.459 3.934-2.986 7.61-1.143 9.11 1.402 1.14 3.847.725 6.502-.926 1.505 1.672 3.083 2.74 4.667 3.094.084.015.287.043.332-.034.034-.06-.08-.124-.131-.149-1.408-.657-2.64-1.828-3.964-3.515 2.735-1.929 5.691-5.263 7.457-8.988 1.076.86 1.64 1.773 1.398 2.595-.336 1.131-1.615 1.84-3.403 2.185a27.697 27.697 0 0 1-1.548 1.826c4.634.16 8.08-1.22 8.458-3.565.286-1.786-1.295-3.696-4.053-5.17.696-2.139.832-4.04.346-5.588-.029-.08-.106-.27-.196-.27-.068 0-.067.13-.063.187.135 1.547-.263 3.2-1.062 5.19zm-8.533 9.869c-1.96-3.145-3.09-6.849-3.082-10.594 3.702-.124 7.474.748 10.714 2.627-1.743 3.269-4.385 6.1-7.633 7.966h.001z" />
    </svg>
  );
}

function LoginContent() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get('redirect');
      router.replace(redirect || '/roster');
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  if (isLoading || isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0b12' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255, 255, 255, 0.1)', borderTopColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0e0b12' }} />}>
      <LoginContent />
    </Suspense>
  );
}
