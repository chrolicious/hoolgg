import type { Meta, StoryObj } from '@storybook/react-vite';
import { StaggerGroup } from '../components/animation/StaggerGroup';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Badge } from '../components/primitives/Badge';

const meta: Meta<typeof StaggerGroup> = {
  title: 'Animation/StaggerGroup',
  component: StaggerGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    staggerDelay: {
      control: 'number',
      min: 0.05,
      max: 0.5,
      step: 0.05,
    },
    delayStart: {
      control: 'number',
      min: 0,
      max: 1,
      step: 0.1,
    },
    duration: {
      control: 'number',
      min: 0.2,
      max: 1,
      step: 0.1,
    },
  },
};

export default meta;
type Story = StoryObj<typeof StaggerGroup>;

const Item = ({ label }: { label: string }) => (
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
    direction: 'vertical',
    staggerDelay: 0.1,
    delayStart: 0,
    duration: 0.5,
  },
  render: (args) => (
    <Container padding="lg">
      <StaggerGroup {...args} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Item label="Item 1" />
        <Item label="Item 2" />
        <Item label="Item 3" />
        <Item label="Item 4" />
      </StaggerGroup>
    </Container>
  ),
};

export const VerticalStagger: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Vertical stagger (top to bottom)
        </div>
        <StaggerGroup direction="vertical" staggerDelay={0.15} duration={0.6}>
          <Item label="First item" />
          <Item label="Second item" />
          <Item label="Third item" />
          <Item label="Fourth item" />
          <Item label="Fifth item" />
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};

export const HorizontalStagger: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Horizontal stagger (left to right)
        </div>
        <StaggerGroup
          direction="horizontal"
          staggerDelay={0.12}
          duration={0.5}
          style={{ display: 'flex', gap: '12px' }}
        >
          <div style={{ flex: 1 }}>
            <Item label="Item 1" />
          </div>
          <div style={{ flex: 1 }}>
            <Item label="Item 2" />
          </div>
          <div style={{ flex: 1 }}>
            <Item label="Item 3" />
          </div>
          <div style={{ flex: 1 }}>
            <Item label="Item 4" />
          </div>
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};

export const FastStagger: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Fast stagger (0.08s between items)
        </div>
        <StaggerGroup direction="vertical" staggerDelay={0.08} duration={0.4} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Badge variant="primary">Badge 1</Badge>
          <Badge variant="purple">Badge 2</Badge>
          <Badge variant="destructive">Badge 3</Badge>
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};

export const SlowStagger: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Slow stagger (0.3s between items)
        </div>
        <StaggerGroup direction="vertical" staggerDelay={0.3} duration={0.8} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Item label="Item 1" />
          <Item label="Item 2" />
          <Item label="Item 3" />
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Stagger with 0.5s initial delay
        </div>
        <StaggerGroup
          direction="vertical"
          staggerDelay={0.15}
          delayStart={0.5}
          duration={0.6}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <Item label="Item 1" />
          <Item label="Item 2" />
          <Item label="Item 3" />
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};

export const GridStagger: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Stagger effect for grid items
        </div>
        <StaggerGroup
          direction="vertical"
          staggerDelay={0.1}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <Item key={i} label={`Grid ${i + 1}`} />
          ))}
        </StaggerGroup>
      </Stack>
    </Container>
  ),
};
