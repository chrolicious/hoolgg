import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlowEffect } from '../components/animation/GlowEffect';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Button } from '../components/primitives/Button';
import { Badge } from '../components/primitives/Badge';

const meta: Meta<typeof GlowEffect> = {
  title: 'Animation/GlowEffect',
  component: GlowEffect,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'purple', 'cyan', 'pink', 'amber'],
    },
    intensity: {
      control: 'select',
      options: ['subtle', 'medium', 'intense'],
    },
    animate: {
      control: 'boolean',
    },
    size: {
      control: 'number',
      min: 100,
      max: 400,
      step: 50,
    },
  },
};

export default meta;
type Story = StoryObj<typeof GlowEffect>;

export const Default: Story = {
  args: {
    color: 'primary',
    intensity: 'medium',
    animate: true,
    size: 200,
  },
  render: (args) => (
    <Container padding="lg">
      <GlowEffect {...args}>
        <Button variant="primary" size="lg">
          Glowing Button
        </Button>
      </GlowEffect>
    </Container>
  ),
};

export const AllColors: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          All glow colors
        </div>

        <GlowEffect color="primary" intensity="medium">
          <Button variant="primary">Primary Glow</Button>
        </GlowEffect>

        <GlowEffect color="purple" intensity="medium">
          <Button variant="purple">Purple Glow</Button>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="medium">
          <Button variant="primary-soft">Cyan Glow</Button>
        </GlowEffect>

        <GlowEffect color="pink" intensity="medium">
          <Button variant="destructive">Pink Glow</Button>
        </GlowEffect>

        <GlowEffect color="amber" intensity="medium">
          <Button variant="secondary">Amber Glow</Button>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};

export const Intensities: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Glow intensity levels
        </div>

        <GlowEffect color="cyan" intensity="subtle">
          <Button variant="primary">Subtle Glow</Button>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="medium">
          <Button variant="primary">Medium Glow</Button>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="intense">
          <Button variant="primary">Intense Glow</Button>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};

export const StaticGlow: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Static glow (no animation)
        </div>

        <GlowEffect color="primary" intensity="medium" animate={false}>
          <Button variant="primary">Static Glow</Button>
        </GlowEffect>

        <GlowEffect color="purple" intensity="intense" animate={false}>
          <Button variant="purple">Static Intense</Button>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Glow effects on badges
        </div>

        <GlowEffect color="primary" intensity="medium" size={150}>
          <Badge variant="primary">Featured</Badge>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="medium" size={150}>
          <Badge variant="primary">New</Badge>
        </GlowEffect>

        <GlowEffect color="pink" intensity="medium" size={150}>
          <Badge variant="destructive">Hot</Badge>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Different glow sizes
        </div>

        <GlowEffect color="cyan" intensity="medium" size={100}>
          <Button variant="primary" size="sm">
            Small Glow
          </Button>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="medium" size={200}>
          <Button variant="primary">Medium Glow</Button>
        </GlowEffect>

        <GlowEffect color="cyan" intensity="medium" size={300}>
          <Button variant="primary" size="xl">
            Large Glow
          </Button>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};

export const HoverInteraction: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Hover to boost glow intensity
        </div>

        <GlowEffect color="primary" intensity="subtle" animate={true} size={180}>
          <Button variant="primary" size="lg">
            Hover Me
          </Button>
        </GlowEffect>

        <GlowEffect
          color="cyan"
          intensity="subtle"
          animate={true}
          size={180}
        >
          <Button variant="primary" size="lg">
            Hover Me
          </Button>
        </GlowEffect>
      </Stack>
    </Container>
  ),
};
