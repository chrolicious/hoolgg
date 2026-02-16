import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../components/layout/Stack';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const Item = ({ label }: { label: string }) => (
  <div
    style={{
      padding: '12px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      minWidth: '80px',
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    gap: 'md',
  },
  render: (args) => (
    <Container padding="lg">
      <Stack {...args}>
        <Item label="Item 1" />
        <Item label="Item 2" />
        <Item label="Item 3" />
      </Stack>
    </Container>
  ),
};

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    gap: 'md',
  },
  render: (args) => (
    <Container padding="lg">
      <Stack {...args}>
        <Item label="Item 1" />
        <Item label="Item 2" />
        <Item label="Item 3" />
      </Stack>
    </Container>
  ),
};

export const GapVariants: Story = {
  render: () => (
    <Stack direction="vertical" gap="lg">
      <Container padding="md">
        <Stack gap="xs">
          <Item label="xs" />
          <Item label="xs" />
          <Item label="xs" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack gap="sm">
          <Item label="sm" />
          <Item label="sm" />
          <Item label="sm" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack gap="md">
          <Item label="md" />
          <Item label="md" />
          <Item label="md" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack gap="lg">
          <Item label="lg" />
          <Item label="lg" />
          <Item label="lg" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack gap="xl">
          <Item label="xl" />
          <Item label="xl" />
          <Item label="xl" />
        </Stack>
      </Container>
    </Stack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <Stack direction="vertical" gap="lg">
      <Container padding="md">
        <Stack align="start" style={{ minHeight: '120px' }}>
          <Item label="start" />
          <Item label="start" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack align="center" style={{ minHeight: '120px' }}>
          <Item label="center" />
          <Item label="center" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack align="end" style={{ minHeight: '120px' }}>
          <Item label="end" />
          <Item label="end" />
        </Stack>
      </Container>
    </Stack>
  ),
};

export const Justification: Story = {
  render: () => (
    <Stack direction="vertical" gap="lg">
      <Container padding="md">
        <Stack justify="start" style={{ minWidth: '300px' }}>
          <Item label="start" />
          <Item label="start" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack justify="center" style={{ minWidth: '300px' }}>
          <Item label="center" />
          <Item label="center" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack justify="end" style={{ minWidth: '300px' }}>
          <Item label="end" />
          <Item label="end" />
        </Stack>
      </Container>
      <Container padding="md">
        <Stack justify="space-between" style={{ minWidth: '300px' }}>
          <Item label="space" />
          <Item label="between" />
        </Stack>
      </Container>
    </Stack>
  ),
};

export const NestedStacks: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        <div style={{ color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>Vertical Stack</div>
        <Stack direction="horizontal" gap="md">
          <Item label="H1" />
          <Item label="H2" />
          <Item label="H3" />
        </Stack>
        <Stack direction="horizontal" gap="md">
          <Item label="H4" />
          <Item label="H5" />
          <Item label="H6" />
        </Stack>
      </Stack>
    </Container>
  ),
};
