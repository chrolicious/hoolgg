import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from './Badge';
import { StickerIcon } from './StickerIcon';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="trophy" size={48} />,
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Guild Name</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Realm Name</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Character Name</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>650 ilvl</div>
        <div>Weekly Progress: 75%</div>
      </BadgeBody>
      <BadgeFooter>
        <button>View Details</button>
      </BadgeFooter>
    </Badge>
  ),
};

export const HorizontalFullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="shield" size={48} />,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <Badge {...args}>
        <BadgeHeader>
          <div>Epic Guild</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Illidan-US</div>
        </BadgeHeader>
        <BadgeBody>
          <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Team Overview</div>
          <div>Avg ilvl: 645 ↑</div>
          <div>32/45 on track</div>
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ 8 need attention</div>
        </BadgeBody>
        <BadgeFooter>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button>←</button>
            <div>•○</div>
            <button>→</button>
          </div>
        </BadgeFooter>
      </Badge>
    </div>
  ),
};
