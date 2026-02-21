'use client';

import { useEffect } from 'react';
import { Card, Button, Icon } from '@hool/design-system';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e0b12',
        padding: '2rem',
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
          <Icon name="alert-circle" size={48} style={{ color: '#ef4444' }} />
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" size="md" onClick={reset}>
              Retry
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => (window.location.href = '/roster')}
            >
              Go to Roster
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
