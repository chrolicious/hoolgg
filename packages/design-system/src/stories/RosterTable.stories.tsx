import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RosterTable, type RosterMember, type SortDirection } from '../components/data-display/RosterTable';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof RosterTable> = {
  title: 'Data Display/RosterTable',
  component: RosterTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RosterTable>;

const mockMembers: RosterMember[] = [
  {
    id: '1',
    name: 'Thorgrim',
    class: 'warrior',
    spec: 'Protection',
    role: 'tank',
    ilvl: 489,
    achievements: 87,
    status: 'online',
    joinedDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Lightbringer',
    class: 'priest',
    spec: 'Holy',
    role: 'healer',
    ilvl: 486,
    achievements: 92,
    status: 'online',
    joinedDate: '2023-03-22',
  },
  {
    id: '3',
    name: 'Shadowstrike',
    class: 'rogue',
    spec: 'Assassination',
    role: 'mdps',
    ilvl: 492,
    achievements: 105,
    status: 'away',
    joinedDate: '2022-11-08',
  },
  {
    id: '4',
    name: 'Wildshot',
    class: 'hunter',
    spec: 'Marksmanship',
    role: 'rdps',
    ilvl: 483,
    achievements: 56,
    status: 'offline',
    joinedDate: '2023-06-10',
  },
  {
    id: '5',
    name: 'Frostmage',
    class: 'mage',
    spec: 'Frost',
    role: 'rdps',
    ilvl: 489,
    achievements: 78,
    status: 'online',
    joinedDate: '2023-02-14',
  },
  {
    id: '6',
    name: 'Healgrove',
    class: 'druid',
    spec: 'Restoration',
    role: 'healer',
    ilvl: 486,
    achievements: 88,
    status: 'online',
    joinedDate: '2023-04-05',
  },
  {
    id: '7',
    name: 'Dreadblade',
    class: 'deathknight',
    spec: 'Blood',
    role: 'tank',
    ilvl: 483,
    achievements: 71,
    status: 'offline',
    joinedDate: '2023-07-22',
  },
  {
    id: '8',
    name: 'Arcanus',
    class: 'warlock',
    spec: 'Destruction',
    role: 'rdps',
    ilvl: 486,
    achievements: 82,
    status: 'online',
    joinedDate: '2023-05-18',
  },
];

export const Default: Story = {
  render: () => (
    <Container padding="lg" style={{ minHeight: '500px' }}>
      <RosterTable members={mockMembers} />
    </Container>
  ),
};

export const WithSorting: Story = {
  render: () => {
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const sortedMembers = [...mockMembers].sort((a, b) => {
      if (!sortDirection) return 0;

      let aVal: any = a[sortBy as keyof RosterMember];
      let bVal: any = b[sortBy as keyof RosterMember];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return (
      <Container padding="lg" style={{ minHeight: '500px' }}>
        <RosterTable
          members={sortedMembers}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={(column, direction) => {
            setSortBy(column);
            setSortDirection(direction);
          }}
        />
      </Container>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [selectedMember, setSelectedMember] = useState<RosterMember | null>(null);

    const sortedMembers = [...mockMembers].sort((a, b) => {
      if (!sortDirection) return 0;

      let aVal: any = a[sortBy as keyof RosterMember];
      let bVal: any = b[sortBy as keyof RosterMember];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return (
      <Container padding="lg" style={{ minHeight: '500px' }}>
        <div style={{ display: 'flex', gap: '24px', minHeight: 'inherit' }}>
          <div style={{ flex: 1 }}>
            <RosterTable
              members={sortedMembers}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={(column, direction) => {
                setSortBy(column);
                setSortDirection(direction);
              }}
              onMemberClick={(member) => setSelectedMember(member)}
            />
          </div>
          {selectedMember && (
            <div
              style={{
                flex: '0 0 300px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>{selectedMember.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                <div>
                  <strong>Class:</strong> {selectedMember.class}
                </div>
                <div>
                  <strong>Spec:</strong> {selectedMember.spec}
                </div>
                <div>
                  <strong>Role:</strong> {selectedMember.role.toUpperCase()}
                </div>
                <div>
                  <strong>iLvl:</strong> {selectedMember.ilvl}
                </div>
                {selectedMember.achievements !== undefined && (
                  <div>
                    <strong>Achievements:</strong> {selectedMember.achievements}
                  </div>
                )}
                <div>
                  <strong>Status:</strong> {selectedMember.status}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <Container padding="lg" style={{ minHeight: '500px' }}>
      <RosterTable members={[]} emptyMessage="This guild has no members yet" />
    </Container>
  ),
};

export const Loading: Story = {
  render: () => (
    <Container padding="lg" style={{ minHeight: '500px' }}>
      <RosterTable members={mockMembers} loading={true} />
    </Container>
  ),
};
