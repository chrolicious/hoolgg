import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard, ProgressBar, Leaderboard, AchievementGrid } from '../components/data-display';
import { Container } from '../components/layout/Container';

// ============================================================================
// StatCard Stories
// ============================================================================

const StatCardMeta: Meta<typeof StatCard> = {
  title: 'Data Display/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
};

export default StatCardMeta;
type StatCardStory = StoryObj<typeof StatCard>;

export const DefaultStat: StatCardStory = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <StatCard
        label="Active Members"
        value={45}
        icon="👥"
        subtitle="Currently online"
      />
    </Container>
  ),
};

export const WithTrendUp: StatCardStory = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <StatCard
        label="Guild Members"
        value={48}
        icon="🏛️"
        variant="success"
        trend={{ direction: 'up', percentage: 8 }}
        subtitle="This month"
      />
    </Container>
  ),
};

export const WithTrendDown: StatCardStory = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <StatCard
        label="Available Slots"
        value={2}
        icon="📭"
        variant="danger"
        trend={{ direction: 'down', percentage: 12 }}
        subtitle="Guild nearly full"
      />
    </Container>
  ),
};

export const StatGridLayout: StatCardStory = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '24px' }}>
      <StatCard
        label="Total Members"
        value={48}
        icon="👥"
        variant="highlighted"
      />
      <StatCard
        label="Avg iLvl"
        value={489}
        icon="⚔️"
        variant="success"
      />
      <StatCard
        label="Raids This Month"
        value={12}
        icon="🗡️"
        variant="warning"
      />
      <StatCard
        label="DPS Specialists"
        value={28}
        icon="🔥"
        trend={{ direction: 'up', percentage: 5 }}
      />
      <StatCard
        label="Healers"
        value={12}
        icon="💚"
        trend={{ direction: 'neutral', percentage: 0 }}
      />
      <StatCard
        label="Tanks"
        value={8}
        icon="🛡️"
        variant="danger"
      />
    </div>
  ),
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

export const DefaultProgress: StoryObj<typeof ProgressBar> = {
  render: () => (
    <Container padding="lg">
      <ProgressBar
        label="Guild Member Capacity"
        value={45}
        max={50}
        variant="default"
        showPercentage
        showValue
      />
    </Container>
  ),
  decorators: [(Story) => <div style={{ maxWidth: '500px' }}><Story /></div>],
};

export const ProgressVariants: StoryObj<typeof ProgressBar> = {
  render: () => (
    <Container padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ProgressBar
        label="Default Progress"
        value={65}
        max={100}
        variant="default"
      />
      <ProgressBar
        label="Success Progress"
        value={80}
        max={100}
        variant="success"
      />
      <ProgressBar
        label="Warning Progress"
        value={40}
        max={100}
        variant="warning"
      />
      <ProgressBar
        label="Danger Progress"
        value={20}
        max={100}
        variant="danger"
      />
      <ProgressBar
        label="Highlight Progress"
        value={95}
        max={100}
        variant="highlight"
      />
    </Container>
  ),
  decorators: [(Story) => <div style={{ maxWidth: '500px' }}><Story /></div>],
};

export const RecruitmentProgress: StoryObj<typeof ProgressBar> = {
  render: () => (
    <Container padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ProgressBar
        label="Guild Members"
        value={45}
        max={50}
        variant="default"
        subtitle="Current recruitment status"
      />
      <ProgressBar
        label="DPS Needed"
        value={3}
        max={5}
        variant="warning"
        subtitle="Target: 5 DPS specialists"
      />
      <ProgressBar
        label="Healers"
        value={12}
        max={10}
        variant="success"
        subtitle="Fully staffed"
      />
    </Container>
  ),
  decorators: [(Story) => <div style={{ maxWidth: '500px' }}><Story /></div>],
};

// ============================================================================
// Leaderboard Stories
// ============================================================================

const LeaderboardMeta: Meta<typeof Leaderboard> = {
  title: 'Data Display/Leaderboard',
  component: Leaderboard,
  parameters: {
    layout: 'centered',
  },
};

const mockGuilds = [
  { rank: 1, name: 'Knights of Azeroth', value: 48, highlight: false },
  { rank: 2, name: 'Eternal Dominion', value: 46, highlight: false },
  { rank: 3, name: 'Legacy Guild', value: 45, highlight: false },
  { rank: 4, name: 'Rising Phoenix', value: 42, highlight: true },
  { rank: 5, name: 'Shadow Collective', value: 40, highlight: false },
  { rank: 6, name: 'Mystic Order', value: 38, highlight: false },
];

export const GuildLeaderboard: StoryObj<typeof Leaderboard> = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '400px' }}>
      <Leaderboard
        title="Top Guilds"
        metric="Members"
        entries={mockGuilds}
      />
    </Container>
  ),
};

export const DPSLeaderboard: StoryObj<typeof Leaderboard> = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '400px' }}>
      <Leaderboard
        title="Top DPS Players"
        metric="Damage Per Second"
        entries={[
          { rank: 1, name: 'Shadowblade', value: '2.4M', icon: '🔥' },
          { rank: 2, name: 'Frostmage', value: '2.2M', icon: '❄️' },
          { rank: 3, name: 'Infernalist', value: '2.1M', icon: '🌪️' },
          { rank: 4, name: 'Thunderbolt', value: '1.9M', icon: '⚡', highlight: true },
          { rank: 5, name: 'Wildstrike', value: '1.8M', icon: '🏹' },
        ]}
      />
    </Container>
  ),
};

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
  {
    id: '1',
    name: 'First Blood',
    description: 'Defeat your first raid boss',
    earned: true,
    earnedDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Guild Leader',
    description: 'Create or lead a guild',
    earned: true,
    earnedDate: '2023-02-10',
  },
  {
    id: '3',
    name: 'Legendary',
    description: 'Reach max level',
    earned: true,
    earnedDate: '2023-03-05',
  },
  {
    id: '4',
    name: 'Mythic Master',
    description: 'Complete 50 Mythic+ dungeons',
    earned: false,
  },
  {
    id: '5',
    name: 'World Breaker',
    description: 'Defeat all raid bosses on Mythic',
    earned: false,
  },
  {
    id: '6',
    name: 'Master Crafter',
    description: 'Reach max profession level',
    earned: true,
    earnedDate: '2023-04-20',
  },
  {
    id: '7',
    name: 'PvP Champion',
    description: 'Win 100 PvP battles',
    earned: false,
  },
  {
    id: '8',
    name: 'Treasure Hunter',
    description: 'Find 50 hidden treasures',
    earned: false,
  },
];

export const EarnedAchievements: StoryObj<typeof AchievementGrid> = {
  render: () => (
    <Container padding="lg">
      <AchievementGrid
        title="Guild Achievements"
        achievements={mockAchievements}
        showLocked={false}
        columns={5}
      />
    </Container>
  ),
};

export const AllAchievements: StoryObj<typeof AchievementGrid> = {
  render: () => (
    <Container padding="lg">
      <AchievementGrid
        title="All Achievements"
        achievements={mockAchievements}
        showLocked={true}
        columns={4}
      />
    </Container>
  ),
};

export const CompactLayout: StoryObj<typeof AchievementGrid> = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '600px' }}>
      <AchievementGrid
        title="Recent Achievements"
        achievements={mockAchievements.slice(0, 6)}
        columns={3}
      />
    </Container>
  ),
};
