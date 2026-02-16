import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from './StatusIndicator';
import { Avatar } from './Avatar';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Primitives/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    status: 'online',
    title: 'Online',
  },
};

export const Away: Story = {
  args: {
    status: 'away',
    title: 'Away',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
    title: 'Offline',
  },
};

export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <StatusIndicator status="online" title="Online" />
      <StatusIndicator status="away" title="Away" />
      <StatusIndicator status="offline" title="Offline" />
    </div>
  ),
};

export const WithAvatarOnline: Story = {
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

export const WithAvatarAway: Story = {
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

export const WithAvatarOffline: Story = {
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

export const AvatarGroup: Story = {
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
