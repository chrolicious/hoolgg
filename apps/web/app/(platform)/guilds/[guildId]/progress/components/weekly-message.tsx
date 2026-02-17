'use client';

import React from 'react';
import { Card, Icon } from '@hool/design-system';
import { FadeIn } from '@hool/design-system';

interface WeeklyMessageProps {
  message: string | null;
  updatedAt?: string;
}

export function WeeklyMessage({ message, updatedAt }: WeeklyMessageProps) {
  if (!message) return null;

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <FadeIn duration={0.5}>
      <Card padding="md" variant="elevated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="crown" size={18} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
              }}>
                Guild Master Message
              </h3>
              {formattedDate && (
                <p style={{
                  fontSize: '0.6875rem',
                  color: 'rgba(255, 255, 255, 0.35)',
                  margin: 0,
                }}>
                  Updated {formattedDate}
                </p>
              )}
            </div>
          </div>

          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            background: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.12)',
          }}>
            <p style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {message}
            </p>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
