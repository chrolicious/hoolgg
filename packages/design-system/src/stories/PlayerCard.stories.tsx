import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayerCard } from '../components/surfaces/PlayerCard';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof PlayerCard> = {
  title: 'Surfaces/PlayerCard',
  component: PlayerCard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PlayerCard>;

// Simple avatar placeholder
const AvatarPlaceholder = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px',
    }}
  >
    ⚔️
  </div>
);

export const TankWarrior: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Thorgrim"
        class="warrior"
        spec="Protection"
        role="tank"
        ilvl={489}
        guild="Knights of Azeroth"
        realm="Area 52"
        achievements={87}
        avatar={<AvatarPlaceholder />}
      />
    </Container>
  ),
};

export const HealerPriest: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Lightbringer"
        class="priest"
        spec="Holy"
        role="healer"
        ilvl={486}
        guild="Eternal Horde Dominion"
        realm="Illidan"
        achievements={92}
        avatar={<AvatarPlaceholder />}
      />
    </Container>
  ),
};

export const MeleeDPSRogue: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Shadowstrike"
        class="rogue"
        spec="Assassination"
        role="mdps"
        ilvl={492}
        guild="Legacy of the Fall"
        realm="Malganis"
        achievements={105}
        avatar={<AvatarPlaceholder />}
      />
    </Container>
  ),
};

export const RangedDPSHunter: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Wildshot"
        class="hunter"
        spec="Marksmanship"
        role="rdps"
        ilvl={483}
        guild="Casual Couch Potatoes"
        realm="Stormrage"
        achievements={56}
        avatar={<AvatarPlaceholder />}
      />
    </Container>
  ),
};

export const WithoutAvatar: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Frostmage"
        class="mage"
        spec="Frost"
        role="rdps"
        ilvl={489}
        guild="Arcane Circle"
        realm="Area 52"
      />
    </Container>
  ),
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '24px' }}>
      <div>
        <PlayerCard
          name="Thorgrim"
          class="warrior"
          spec="Protection"
          role="tank"
          ilvl={489}
          guild="Knights"
          avatar={<AvatarPlaceholder />}
        />
      </div>
      <div>
        <PlayerCard
          name="Lightbringer"
          class="priest"
          spec="Holy"
          role="healer"
          ilvl={486}
          guild="Horde Dom"
          avatar={<AvatarPlaceholder />}
        />
      </div>
      <div>
        <PlayerCard
          name="Shadowstrike"
          class="rogue"
          spec="Assassination"
          role="mdps"
          ilvl={492}
          guild="Legacy"
          avatar={<AvatarPlaceholder />}
        />
      </div>
      <div>
        <PlayerCard
          name="Wildshot"
          class="hunter"
          spec="Marksmanship"
          role="rdps"
          ilvl={483}
          guild="Casuals"
          avatar={<AvatarPlaceholder />}
        />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Container padding="lg" style={{ maxWidth: '300px' }}>
      <PlayerCard
        name="Thorgrim"
        class="warrior"
        spec="Protection"
        role="tank"
        ilvl={489}
        guild="Knights of Azeroth"
        realm="Area 52"
        achievements={87}
        avatar={<AvatarPlaceholder />}
        onClick={() => alert('Player profile modal would open')}
      />
    </Container>
  ),
};
