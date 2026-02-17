'use client';

import React from 'react';
import { Card, Button, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  icon?: string;
  title?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  icon = 'alert-circle',
  title = 'Error',
}: ErrorMessageProps) {
  return (
    <FadeIn duration={0.3}>
      <Card padding="lg" variant="elevated">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            padding: '0.5rem',
          }}
        >
          <Icon name={icon} size={36} style={{ color: '#ef4444' }} />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            {message}
          </p>
          {onRetry && (
            <Button variant="primary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </Card>
    </FadeIn>
  );
}
