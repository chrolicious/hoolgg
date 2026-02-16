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
    offset: {
      control: 'number',
      min: 10,
      max: 200,
      step: 10,
    },
    direction: {
      control: 'select',
      options: ['up', 'down'],
    },
    speed: {
      control: 'number',
      min: 0.1,
      max: 1,
      step: 0.1,
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
    offset: 50,
    direction: 'up',
    speed: 0.5,
    enableOnScroll: true,
  },
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Scroll down to see parallax effect (scrolls slower than page)
          </div>

          <ParallaxScroll offset={50} direction="up" speed={0.5}>
            <ScrollPlaceholder label="Item 1 - Parallax Moving Up" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll offset={50} direction="down" speed={0.5}>
            <ScrollPlaceholder label="Item 2 - Parallax Moving Down" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of scroll area" />
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
            Parallax moving upward with scroll
          </div>

          <ParallaxScroll direction="up" speed={0.3}>
            <ScrollPlaceholder label="Moving Up (Slow)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="up" speed={0.6}>
            <ScrollPlaceholder label="Moving Up (Fast)" />
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
            Parallax moving downward with scroll
          </div>

          <ParallaxScroll direction="down" speed={0.3}>
            <ScrollPlaceholder label="Moving Down (Slow)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="down" speed={0.6}>
            <ScrollPlaceholder label="Moving Down (Fast)" />
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
            Different parallax speeds (0.2, 0.5, 0.8)
          </div>

          <ParallaxScroll direction="up" speed={0.2}>
            <ScrollPlaceholder label="Speed: 0.2 (Very Slow)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="up" speed={0.5}>
            <ScrollPlaceholder label="Speed: 0.5 (Medium)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ParallaxScroll direction="up" speed={0.8}>
            <ScrollPlaceholder label="Speed: 0.8 (Fast)" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of scroll area" />
        </Stack>
      </Container>
    </div>
  ),
};

export const DisabledEffect: Story = {
  render: () => (
    <div style={{ minHeight: '200vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Parallax effect disabled (stays fixed)
          </div>

          <ParallaxScroll enableOnScroll={false} direction="up" speed={0.5}>
            <ScrollPlaceholder label="Parallax Disabled - Stays Still" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of content" />
        </Stack>
      </Container>
    </div>
  ),
};

export const MultipleElements: Story = {
  render: () => (
    <div style={{ minHeight: '300vh', paddingTop: '100px' }}>
      <Container padding="lg">
        <Stack direction="vertical" gap="xl">
          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
            Multiple parallax elements at different speeds
          </div>

          <ParallaxScroll direction="up" speed={0.2}>
            <ScrollPlaceholder label="Layer 1 - Speed 0.2" />
          </ParallaxScroll>

          <ParallaxScroll direction="down" speed={0.4}>
            <ScrollPlaceholder label="Layer 2 - Speed 0.4 Down" />
          </ParallaxScroll>

          <div style={{ height: '200px' }} />

          <ParallaxScroll direction="up" speed={0.6}>
            <ScrollPlaceholder label="Layer 3 - Speed 0.6" />
          </ParallaxScroll>

          <div style={{ height: '200px' }} />

          <ParallaxScroll direction="down" speed={0.3}>
            <ScrollPlaceholder label="Layer 4 - Speed 0.3 Down" />
          </ParallaxScroll>

          <div style={{ height: '300px' }} />

          <ScrollPlaceholder label="End of parallax demo" />
        </Stack>
      </Container>
    </div>
  ),
};
