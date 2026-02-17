'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';
import { useGuild } from '../lib/guild-context';

interface ProtectedRouteProps {
  toolName: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ toolName, children }: ProtectedRouteProps) {
  const { canAccess, guildId, permissions, userRank, isLoading } = useGuild();
  const router = useRouter();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
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
    );
  }

  if (!canAccess(toolName)) {
    const permission = permissions.find((p) => p.tool_name === toolName);
    const requiredRank = permission?.min_rank_id ?? 0;
    const isDisabled = permission && !permission.enabled;

    return (
      <FadeIn duration={0.4}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
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
                maxWidth: 360,
              }}
            >
              <Icon
                name="shield"
                size={48}
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Access Restricted
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {isDisabled
                  ? `The ${toolName} tool is not enabled for this guild. Contact your Guild Master to enable it.`
                  : `You need rank ${requiredRank} or higher to access ${toolName}. Your current rank is ${userRank ?? 'unknown'}.`}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/guilds/${guildId}`)}
                icon={<Icon name="home" size={16} />}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </FadeIn>
    );
  }

  return <>{children}</>;
}
