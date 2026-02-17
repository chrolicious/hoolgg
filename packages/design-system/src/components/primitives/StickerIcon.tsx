'use client';

import React from 'react';

export interface StickerIconProps {
  /** Sticker name (e.g., 'user', 'star', 'trophy', 'gem', 'heart', 'fire') */
  name: string;
  /** Icon size in pixels — defaults to 32 */
  size?: number | string;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * StickerIcon component using OpenMoji sticker-style emojis
 * Designed specifically for badges to give them a playful, sticker aesthetic
 *
 * Usage: <StickerIcon name="star" size={32} />
 *
 * Available stickers: user, star, trophy, gem, heart, fire, sparkle, crown,
 * shield, sword, flask, book, music, game, dice, party, gift, celebration
 */

const stickerMap: Record<string, string> = {
  // People & roles
  user: '👤',
  warrior: '⚔️',
  mage: '🧙',
  priest: '⛪',
  rogue: '🗡️',

  // Magic & power
  star: '⭐',
  sparkle: '✨',
  fire: '🔥',
  lightning: '⚡',
  magic: '✨',

  // Items & rewards
  gem: '💎',
  trophy: '🏆',
  crown: '👑',
  heart: '❤️',
  shield: '🛡️',
  sword: '⚔️',

  // Special
  dice: '🎲',
  gift: '🎁',
  celebration: '🎉',
  party: '🎊',
  book: '📖',
  treasure: '🗺️',
  chest: '💰',
  potion: '🧪',
  music: '🎵',
  game: '🎮',
};

export const StickerIcon = React.forwardRef<HTMLDivElement, StickerIconProps>(
  ({ name, size = 32, className, style }, ref) => {
    const emoji = stickerMap[name.toLowerCase()] || '⭐';

    const sizeStyle = typeof size === 'number' ? { fontSize: `${size}px` } : { fontSize: size };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center select-none ${className || ''}`.trim()}
        style={{
          ...sizeStyle,
          lineHeight: 1,
          ...style,
        }}
        title={name}
      >
        {emoji}
      </div>
    );
  },
);

StickerIcon.displayName = 'StickerIcon';
