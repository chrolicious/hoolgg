import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { AchievementGrid } from '../components/data-display/AchievementGrid';
import { Leaderboard } from '../components/data-display/Leaderboard';
import { ProgressBar } from '../components/data-display/ProgressBar';
import { StatCard } from '../components/data-display/StatCard';

// ============================================================================
// AchievementGrid Stories
// ============================================================================

const AchievementGridMeta: Meta<typeof AchievementGrid> = {
  title: 'Data Display/AchievementGrid',
  component: AchievementGrid,
  parameters: {
    layout: 'padded',
  },
};

const mockAchievements = [
  { id: '1', name: 'First Steps', description: 'Complete your first dungeon', earned: true, earnedDate: '2024-01-15' },
  { id: '2', name: 'Speed Runner', description: 'Complete a dungeon in under 20 minutes', earned: true, earnedDate: '2024-02-01' },
  { id: '3', name: 'Raid Master', description: 'Complete all raids', earned: false },
  { id: '4', name: 'PvP Champion', description: 'Win 100 PvP matches', earned: false },
  { id: '5', name: 'Collector', description: 'Collect all epic items', earned: true, earnedDate: '2024-01-20' },
  { id: '6', name: 'Explorer', description: 'Discover all locations', earned: false },
];

export const AchievementGridDefault: StoryObj<typeof AchievementGrid> = {
  render: () => <AchievementGrid achievements={mockAchievements} />,
};

export const AchievementGrid3Columns: StoryObj<typeof AchievementGrid> = {
  render: () => <AchievementGrid achievements={mockAchievements} columns={3} />,
};

export const AchievementGrid6Columns: StoryObj<typeof AchievementGrid> = {
  render: () => <AchievementGrid achievements={mockAchievements} columns={6} />,
};

// ============================================================================
// Leaderboard Stories
// ============================================================================

const LeaderboardMeta: Meta<typeof Leaderboard> = {
  title: 'Data Display/Leaderboard',
  component: Leaderboard,
  parameters: {
    layout: 'padded',
  },
};

const mockLeaderboardData = [
  { rank: 1, name: 'ShadowAssassin', value: '15,000 DPS' },
  { rank: 2, name: 'IceWizard', value: '14,200 DPS', highlight: true },
  { rank: 3, name: 'FireDragon', value: '13,800 DPS' },
  { rank: 4, name: 'VoidKnight', value: '12,500 DPS' },
  { rank: 5, name: 'StormCaller', value: '11,900 DPS' },
  { rank: 6, name: 'SunSentinel', value: '10,300 DPS' },
];

export const LeaderboardDefault: StoryObj<typeof Leaderboard> = {
  render: () => <Leaderboard title="Top DPS" entries={mockLeaderboardData} />,
};

export const LeaderboardHighlight: StoryObj<typeof Leaderboard> = {
  render: () => <Leaderboard title="Top DPS" entries={mockLeaderboardData} />,
};

// ============================================================================
// ProgressBar Stories
// ============================================================================

const ProgressBarMeta: Meta<typeof ProgressBar> = {
  title: 'Data Display/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
};

export const ProgressBarDefault: StoryObj<typeof ProgressBar> = {
  render: () => <ProgressBar value={65} max={100} label="Experience" />,
};

export const ProgressBarVariants: StoryObj<typeof ProgressBar> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <ProgressBar value={25} max={100} label="Health" variant="success" />
      <ProgressBar value={50} max={100} label="Mana" variant="default" />
      <ProgressBar value={75} max={100} label="Energy" variant="warning" />
      <ProgressBar value={90} max={100} label="Progress" variant="danger" />
    </div>
  ),
};

export const ProgressBarAnimated: StoryObj<typeof ProgressBar> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <ProgressBar value={33} max={100} label="Level 1" animated />
      <ProgressBar value={66} max={100} label="Level 2" animated />
      <ProgressBar value={100} max={100} label="Complete" animated />
    </div>
  ),
};

// ============================================================================
// StatCard Stories
// ============================================================================

const StatCardMeta: Meta<typeof StatCard> = {
  title: 'Data Display/StatCard',
  component: StatCard,
  parameters: {
    layout: 'padded',
  },
};

export const StatCardDefault: StoryObj<typeof StatCard> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <StatCard icon="⚔️" label="Damage" value="2,450" />
      <StatCard icon="🛡️" label="Defense" value="1,200" />
      <StatCard icon="❤️" label="Health" value="5,000" />
      <StatCard icon="⚡" label="Speed" value="180" />
    </div>
  ),
};

export const StatCardWithTrend: StoryObj<typeof StatCard> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <StatCard
        icon="📈"
        label="Revenue"
        value="$12,500"
        trend={{ direction: 'up', percentage: 12.5 }}
        variant="success"
      />
      <StatCard
        icon="👥"
        label="Players"
        value="1,247"
        trend={{ direction: 'down', percentage: 2.1 }}
        variant="warning"
      />
      <StatCard
        icon="🎯"
        label="Win Rate"
        value="62%"
        trend={{ direction: 'up', percentage: 5 }}
        variant="highlighted"
      />
    </div>
  ),
};

export default AchievementGridMeta;
