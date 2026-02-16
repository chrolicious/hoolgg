import type { Meta, StoryObj } from '@storybook/react-vite';
import { GuildCard } from '../components/surfaces/GuildCard';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof GuildCard> = {
  title: 'Surfaces/GuildCard',
  component: GuildCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GuildCard>;

export const AllianceRecruiting: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '320px' }}>
      <GuildCard
        name="Knights of Azeroth"
        realm="Area 52"
        faction="alliance"
        memberCount={45}
        maxMembers={50}
        leader="Thrallmaster"
        recruitingStatus="open"
        description="Casual raiders looking for chill players who want to push Mythic+ and raid together."
      />
    </Container>
  ),
};

export const HordeSelectiveRecruiting: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '320px' }}>
      <GuildCard
        name="Eternal Horde Dominion"
        realm="Illidan"
        faction="horde"
        memberCount={48}
        maxMembers={50}
        leader="Warlord Kor"
        recruitingStatus="selective"
        description="Hardcore PvE guild with consistent raid schedule. Min ilvl 500 required."
      />
    </Container>
  ),
};

export const ClosedRecruiting: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '320px' }}>
      <GuildCard
        name="Legacy of the Fall"
        realm="Malganis"
        faction="alliance"
        memberCount={50}
        maxMembers={50}
        leader="Keeper"
        recruitingStatus="closed"
        description="Guild is currently full. Check back soon!"
      />
    </Container>
  ),
};

export const WithoutLeader: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '320px' }}>
      <GuildCard
        name="Casual Couch Potatoes"
        realm="Stormrage"
        faction="alliance"
        memberCount={20}
        maxMembers={50}
        recruitingStatus="open"
      />
    </Container>
  ),
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '24px' }}>
      <GuildCard
        name="Knights of Azeroth"
        realm="Area 52"
        faction="alliance"
        memberCount={45}
        maxMembers={50}
        leader="Thrallmaster"
        recruitingStatus="open"
        description="Casual raiders looking for chill players who want to push Mythic+ and raid together."
      />
      <GuildCard
        name="Eternal Horde Dominion"
        realm="Illidan"
        faction="horde"
        memberCount={48}
        maxMembers={50}
        leader="Warlord Kor"
        recruitingStatus="selective"
        description="Hardcore PvE guild with consistent raid schedule."
      />
      <GuildCard
        name="Legacy of the Fall"
        realm="Malganis"
        faction="alliance"
        memberCount={50}
        maxMembers={50}
        leader="Keeper"
        recruitingStatus="closed"
      />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '320px' }}>
      <GuildCard
        name="Knights of Azeroth"
        realm="Area 52"
        faction="alliance"
        memberCount={45}
        maxMembers={50}
        leader="Thrallmaster"
        recruitingStatus="open"
        description="Casual raiders looking for chill players who want to push Mythic+ and raid together."
        onClick={() => alert('Guild details modal would open')}
      />
    </Container>
  ),
};
