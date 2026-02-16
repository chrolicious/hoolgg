import type { Meta, StoryObj } from '@storybook/react-vite';
import { ParallaxScroll } from '../components/animation/ParallaxScroll';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';

const meta: Meta<typeof ParallaxScroll> = {
  title: 'Animation/ParallaxScroll',
  component: ParallaxScroll,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    speed: {
      control: 'number',
      min: 0.1,
      max: 1,
      step: 0.1,
    },
    direction: {
      control: 'select',
      options: ['up', 'down'],
    },
    enableOnScroll: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ParallaxScroll>;

const ScrollPlaceholder = ({ label }: { label: string }) => (
  <div
    style={{
      padding: '32px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      textAlign: 'center',
      minHeight: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label}
  </div>
);

export const Default: Story = {
  args: {
    speed: 0.5,
    direction: 'up',
    enableOnScroll: true,
  },
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Scroll to see smooth parallax effect
          </div>

          <ParallaxScroll speed={0.3}>
            <ScrollPlaceholder label="Moving slower (0.3x)" />
          </ParallaxScroll>

          <div style={{ height: '400px' }} />

          <ParallaxScroll speed={0.5}>
            <ScrollPlaceholder label="Medium speed (0.5x)" />
          </ParallaxScroll>

          <div style={{ height: '400px' }} />

          <ParallaxScroll speed={0.7}>
            <ScrollPlaceholder label="Faster speed (0.7x)" />
          </ParallaxScroll>

          <div style={{ height: '200px' }} />
        </Stack>
      </Container>
    </div>
  ),
};

export const UpDirection: Story = {
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Parallax moves upward with scroll
          </div>

          <ParallaxScroll direction="up" speed={0.4}>
            <ScrollPlaceholder label="Moving up - Slow (0.4x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="up" speed={0.6}>
            <ScrollPlaceholder label="Moving up - Fast (0.6x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of content" />
        </Stack>
      </Container>
    </div>
  ),
};

export const DownDirection: Story = {
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Parallax moves downward with scroll
          </div>

          <ParallaxScroll direction="down" speed={0.4}>
            <ScrollPlaceholder label="Moving down - Slow (0.4x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="down" speed={0.6}>
            <ScrollPlaceholder label="Moving down - Fast (0.6x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of content" />
        </Stack>
      </Container>
    </div>
  ),
};

export const SpeedVariants: Story = {
  render: () => (
    <div style={{ minHeight: '250vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Different parallax speeds for comparison
          </div>

          <ParallaxScroll speed={0.2}>
            <ScrollPlaceholder label="Slowest (0.2x speed)" />
          </ParallaxScroll>

          <div style={{ height: '250px' }} />

          <ParallaxScroll speed={0.4}>
            <ScrollPlaceholder label="Slow (0.4x speed)" />
          </ParallaxScroll>

          <div style={{ height: '250px' }} />

          <ParallaxScroll speed={0.6}>
            <ScrollPlaceholder label="Medium (0.6x speed)" />
          </ParallaxScroll>

          <div style={{ height: '250px' }} />

          <ParallaxScroll speed={0.8}>
            <ScrollPlaceholder label="Fast (0.8x speed)" />
          </ParallaxScroll>

          <div style={{ height: '250px' }} />

          <ScrollPlaceholder label="End of parallax demo" />
        </Stack>
      </Container>
    </div>
  ),
};

export const LayeredParallax: Story = {
  render: () => (
    <div style={{ minHeight: '300vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Multiple layers with different speeds create depth
          </div>

          <ParallaxScroll direction="up" speed={0.15}>
            <ScrollPlaceholder label="Background layer (0.15x) - moves slowest" />
          </ParallaxScroll>

          <ParallaxScroll direction="up" speed={0.35}>
            <ScrollPlaceholder label="Middle layer (0.35x)" />
          </ParallaxScroll>

          <div style={{ height: '200px' }} />

          <ParallaxScroll direction="up" speed={0.55}>
            <ScrollPlaceholder label="Foreground layer (0.55x) - moves fastest" />
          </ParallaxScroll>

          <div style={{ height: '200px' }} />

          <ParallaxScroll direction="down" speed={0.4}>
            <ScrollPlaceholder label="Opposite direction (0.4x down)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of layered parallax" />
        </Stack>
      </Container>
    </div>
  ),
};

export const SubtleEffect: Story = {
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Subtle parallax for refined effect
          </div>

          <ParallaxScroll speed={0.15}>
            <ScrollPlaceholder label="Very subtle (0.15x)" />
          </ParallaxScroll>

          <div style={{ height: '400px' }} />

          <ParallaxScroll speed={0.2}>
            <ScrollPlaceholder label="Subtle (0.2x)" />
          </ParallaxScroll>

          <div style={{ height: '400px' }} />

          <ScrollPlaceholder label="End of subtle parallax" />
        </Stack>
      </Container>
    </div>
  ),
};

export const DramaticEffect: Story = {
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Dramatic parallax for high impact
          </div>

          <ParallaxScroll speed={0.8}>
            <ScrollPlaceholder label="Dramatic (0.8x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll speed={0.9}>
            <ScrollPlaceholder label="Very dramatic (0.9x)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of dramatic parallax" />
        </Stack>
      </Container>
    </div>
  ),
};
