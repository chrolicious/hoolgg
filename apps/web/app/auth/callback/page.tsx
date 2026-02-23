'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, Button, Icon } from '@hool/design-system';

const GUILD_API_URL =
  process.env.NEXT_PUBLIC_GUILD_API_URL || 'http://localhost:5010';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setError('No authorization code received from Blizzard.');
        return;
      }

      try {
        const callbackUrl = new URL('/auth/callback', GUILD_API_URL);
        callbackUrl.searchParams.set('code', code);
        if (state) {
          callbackUrl.searchParams.set('state', state);
        }

        const res = await fetch(callbackUrl.toString(), {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.message || body?.error || `Authentication failed (${res.status})`
          );
        }

        window.location.href = '/roster';
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred.'
        );
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0b12',
          padding: '1rem',
        }}
      >
        <Card padding="lg" variant="elevated">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            <Icon name="alert-circle" size={40} style={{ color: '#ef4444' }} />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Authentication Error
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
              }}
            >
              {error}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.replace('/auth/login')}
              icon={<Icon name="arrow-left" size={16} />}
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e0b12',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
        Completing authentication...
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0e0b12',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
