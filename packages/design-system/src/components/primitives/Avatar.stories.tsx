import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import { StatusIndicator } from './StatusIndicator';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    fallback: 'JD',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    fallback: 'JD',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    fallback: 'JD',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    fallback: 'JD',
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar fallback="JD" size="sm" />
      <Avatar fallback="JD" size="md" />
      <Avatar fallback="JD" size="lg" />
      <Avatar fallback="JD" size="xl" />
    </div>
  ),
};

export const WithImageUrl: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    alt: 'John Doe',
    size: 'lg',
  },
};

export const WithStatusOnline: Story = {
  render: () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar fallback="JD" size="lg" />
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          zIndex: 10,
        }}
      >
        <StatusIndicator status="online" title="Online" />
      </div>
    </div>
  ),
};

export const WithStatusAway: Story = {
  render: () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar fallback="JD" size="lg" />
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          zIndex: 10,
        }}
      >
        <StatusIndicator status="away" title="Away" />
      </div>
    </div>
  ),
};

export const WithStatusOffline: Story = {
  render: () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Avatar fallback="JD" size="lg" />
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          zIndex: 10,
        }}
      >
        <StatusIndicator status="offline" title="Offline" />
      </div>
    </div>
  ),
};

export const StatusGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Avatar fallback="JD" size="lg" />
        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', zIndex: 10 }}>
          <StatusIndicator status="online" title="Online" />
        </div>
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Avatar fallback="AB" size="lg" />
        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', zIndex: 10 }}>
          <StatusIndicator status="away" title="Away" />
        </div>
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Avatar fallback="XY" size="lg" />
        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', zIndex: 10 }}>
          <StatusIndicator status="offline" title="Offline" />
        </div>
      </div>
    </div>
  ),
};
