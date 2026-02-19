'use client';

import { useGuild } from '../../../../lib/guild-context';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { Card, Icon } from '@hool/design-system';

export default function RosterPage() {
  const { guild, guildId } = useGuild();

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          My Roster
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {/* Empty state placeholder */}
      <Card padding="lg" variant="elevated">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <Icon name="user" size={48} style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}
          >
            No Characters Yet
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              maxWidth: 320,
            }}
          >
            Add your characters to start tracking progress
          </p>
        </div>
      </Card>
    </div>
  );
}
