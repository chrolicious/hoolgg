'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/guilds');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
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
            width: 24,
            height: 24,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
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
        padding: '1rem',
        gap: '2rem',
      }}
    >
      <FadeIn duration={0.6}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            hool.gg
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Guild management tools for World of Warcraft.
            Sign in with your Battle.net account to get started.
          </p>
        </div>
      </FadeIn>

      <FadeIn duration={0.6} delay={0.2}>
        <Button
          variant="primary"
          size="lg"
          onClick={login}
          icon={<Icon name="shield" size={20} />}
        >
          Login with Battle.net
        </Button>
      </FadeIn>
    </div>
  );
}
