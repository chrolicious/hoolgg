import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spacer } from '../components/layout/Spacer';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';

const meta: Meta<typeof Spacer> = {
  title: 'Layout/Spacer',
  component: Spacer,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spacer>;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      padding: '12px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

export const Vertical: Story = {
  args: {
    size: 'md',
    direction: 'vertical',
  },
  render: (args) => (
    <Container padding="lg">
      <Stack direction="vertical">
        <Box label="Box 1" />
        <Spacer {...args} />
        <Box label="Box 2" />
        <Spacer {...args} />
        <Box label="Box 3" />
      </Stack>
    </Container>
  ),
};

export const Horizontal: Story = {
  args: {
    size: 'md',
    direction: 'horizontal',
  },
  render: (args) => (
    <Container padding="lg">
      <Stack direction="horizontal">
        <Box label="Box 1" />
        <Spacer {...args} />
        <Box label="Box 2" />
        <Spacer {...args} />
        <Box label="Box 3" />
      </Stack>
    </Container>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>XS (4px)</div>
        <Box label="Box 1" />
        <Spacer size="xs" />
        <Box label="Box 2" />

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '20px',
          }}
        >
          SM (8px)
        </div>
        <Box label="Box 1" />
        <Spacer size="sm" />
        <Box label="Box 2" />

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '20px',
          }}
        >
          MD (16px)
        </div>
        <Box label="Box 1" />
        <Spacer size="md" />
        <Box label="Box 2" />

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '20px',
          }}
        >
          LG (24px)
        </div>
        <Box label="Box 1" />
        <Spacer size="lg" />
        <Box label="Box 2" />

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '20px',
          }}
        >
          XL (32px)
        </div>
        <Box label="Box 1" />
        <Spacer size="xl" />
        <Box label="Box 2" />
      </Stack>
    </Container>
  ),
};
