import type { Meta, StoryObj } from '@storybook/react-vite';
import { FadeIn } from '../components/animation/FadeIn';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';

const meta: Meta<typeof FadeIn> = {
  title: 'Animation/FadeIn',
  component: FadeIn,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    duration: {
      control: 'number',
      min: 0.1,
      max: 2,
      step: 0.1,
    },
    delay: {
      control: 'number',
      min: 0,
      max: 1,
      step: 0.1,
    },
    triggerOnce: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FadeIn>;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      padding: '16px 24px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      textAlign: 'center',
      minHeight: '60px',
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
    duration: 0.6,
    delay: 0,
    triggerOnce: true,
  },
  render: (args) => (
    <Container padding="lg">
      <FadeIn {...args}>
        <Box label="This fades in when visible" />
      </FadeIn>
    </Container>
  ),
};

export const DurationVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>0.3s</div>
        <FadeIn duration={0.3}>
          <Box label="Quick fade (0.3s)" />
        </FadeIn>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>0.6s</div>
        <FadeIn duration={0.6}>
          <Box label="Normal fade (0.6s)" />
        </FadeIn>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>1.2s</div>
        <FadeIn duration={1.2}>
          <Box label="Slow fade (1.2s)" />
        </FadeIn>
      </Stack>
    </Container>
  ),
};

export const DelayVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <FadeIn delay={0}>
          <Box label="No delay" />
        </FadeIn>

        <FadeIn delay={0.2}>
          <Box label="0.2s delay" />
        </FadeIn>

        <FadeIn delay={0.4}>
          <Box label="0.4s delay" />
        </FadeIn>

        <FadeIn delay={0.6}>
          <Box label="0.6s delay" />
        </FadeIn>
      </Stack>
    </Container>
  ),
};

export const List: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        {Array.from({ length: 5 }).map((_, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <Box label={`Item ${i + 1}`} />
          </FadeIn>
        ))}
      </Stack>
    </Container>
  ),
};

export const Pop: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <FadeIn effect="pop" duration={0.5}>
          <Box label="Pop in!" />
        </FadeIn>

        <FadeIn effect="pop" duration={0.5} delay={0.2}>
          <Box label="Pop in (delayed)" />
        </FadeIn>

        <FadeIn effect="pop" duration={0.5} delay={0.4}>
          <Box label="Pop in (more delayed)" />
        </FadeIn>
      </Stack>
    </Container>
  ),
};

export const Effects: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <Container padding="lg">
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginBottom: '12px',
          }}
        >
          Fade Effect (Scroll)
        </div>
        <FadeIn effect="fade" trigger="scroll">
          <Box label="Smooth fade in" />
        </FadeIn>
      </Container>

      <Container padding="lg">
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginBottom: '12px',
          }}
        >
          Pop Effect (Scroll)
        </div>
        <FadeIn effect="pop" trigger="scroll">
          <Box label="Bouncy pop in" />
        </FadeIn>
      </Container>

      <div style={{ height: '300px' }} />
    </div>
  ),
};

export const HoverPop: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
          }}
        >
          Hover over these to see the pop effect:
        </div>
        <FadeIn effect="pop" trigger="hover">
          <Box label="Hover me!" />
        </FadeIn>

        <FadeIn effect="pop" trigger="hover">
          <Box label="Pop on hover!" />
        </FadeIn>

        <FadeIn effect="pop" trigger="hover">
          <Box label="Growing scale!" />
        </FadeIn>
      </Stack>
    </Container>
  ),
};
