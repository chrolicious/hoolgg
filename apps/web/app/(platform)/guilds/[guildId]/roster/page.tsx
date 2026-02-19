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
    <div className="flex flex-col gap-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1 className="text-2xl font-bold text-white m-0">
          My Roster
        </h1>
        <p className="text-white/45 mt-1" style={{ fontSize: '0.8125rem' }}>
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {/* Empty state placeholder */}
      <Card padding="lg" variant="elevated">
        <div className="flex flex-col items-center gap-3 text-center p-8">
          <Icon name="user" size={48} className="text-white/15" />
          <h3 className="text-base font-bold text-white m-0">
            No Characters Yet
          </h3>
          <p className="text-sm text-white/50 m-0 max-w-80">
            Add your characters to start tracking progress
          </p>
        </div>
      </Card>
    </div>
  );
}
