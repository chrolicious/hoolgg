import type { Meta, StoryObj } from '@storybook/react-vite';
import { StickerIcon } from '../components/primitives/StickerIcon';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from '../components/primitives/Badge';

const meta: Meta<typeof StickerIcon> = {
  title: 'Primitives/StickerIcon',
  component: StickerIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StickerIcon>;

export const Playground: Story = {
  args: {
    name: 'star',
    size: 48,
  },
};

export const AllStickers: Story = {
  render: () => {
    const stickers = [
      'user', 'warrior', 'mage', 'priest', 'rogue',
      'star', 'sparkle', 'fire', 'lightning', 'magic',
      'gem', 'trophy', 'crown', 'heart', 'shield', 'sword',
      'dice', 'gift', 'celebration', 'party', 'book',
      'treasure', 'chest', 'potion', 'music', 'game',
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px', padding: '24px' }}>
        {stickers.map((sticker) => (
          <div key={sticker} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <StickerIcon name={sticker} size={48} />
            <div style={{ fontSize: '0.75rem', textAlign: 'center', color: '#666' }}>{sticker}</div>
          </div>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      <StickerIcon name="star" size={24} />
      <StickerIcon name="star" size={32} />
      <StickerIcon name="star" size={48} />
      <StickerIcon name="star" size={64} />
    </div>
  ),
};

export const InBadge: Story = {
  render: () => {
    const stickerStyle = {
      textShadow: `
        -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white,
        2px 4px 6px rgba(0, 0, 0, 0.4)
      `,
    };
    return (
      <div style={{ display: 'flex', gap: '24px' }}>
        <Badge variant="primary" profileIcon={<StickerIcon name="gem" size={40} style={stickerStyle} />}>
          <BadgeHeader>Treasure</BadgeHeader>
          <BadgeBody>Rare Item</BadgeBody>
          <BadgeFooter>⭐⭐⭐</BadgeFooter>
        </Badge>
        <Badge variant="purple" profileIcon={<StickerIcon name="trophy" size={40} style={stickerStyle} />}>
          <BadgeHeader>Achievement</BadgeHeader>
          <BadgeBody>Unlocked</BadgeBody>
        </Badge>
        <Badge variant="primary" profileIcon={<StickerIcon name="fire" size={40} style={stickerStyle} />}>
          <BadgeHeader>Hot Deal</BadgeHeader>
          <BadgeBody>Limited Time</BadgeBody>
        </Badge>
      </div>
    );
  },
};
