import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from './StatusIndicator';

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

export const WithAvatar: Story = {
  render: () => {
    const { Avatar } = require('./Avatar');
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Avatar fallback="JD" size="lg" />
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            zIndex: 10,
          }}
        >
          <StatusIndicator status="online" title="Online" />
        </div>
      </div>
    );
  },
};
