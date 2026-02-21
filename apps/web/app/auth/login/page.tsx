'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0b12', padding: '1rem', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: 400, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>hool.gg</h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0, lineHeight: 1.6 }}>
          Personal WoW Roster Tracker. Sign in with your Battle.net account to get started.
        </p>
      </div>
      <button onClick={login} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
        Login with Battle.net
      </button>
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