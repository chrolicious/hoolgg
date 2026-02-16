export const colors = {
  bg: {
    base: '#0e0b12',
    surface: '#19151e',
    elevated: '#221d29',
    overlay: '#2c2535',
  },

  purple: {
    900: '#4C1D95',
    700: '#7C3AED',
    500: '#A855F7',
    400: '#C084FC',
    200: '#DDD6FE',
  },

  gold: {
    900: '#6B4F10',
    700: '#8B6914',
    500: '#D4A017',
    400: '#E8B82A',
    200: '#F5D060',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A8A3B3',
    muted: '#6B6578',
    onGold: '#1a1400',
    onPurple: '#FFFFFF',
  },

  slate: {
    500: '#64748B',
    400: '#7C8DA2',
  },

  cream: '#F5F0E8',

  sticker: {
    border: '#1d2119',
    outline: '#FFFFFF',
  },

  semantic: {
    success: '#22C55E',
    error: '#EF4444',
    info: '#3B82F6',
    warning: '#F59E0B',
  },

  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    muted: 'rgba(255, 255, 255, 0.12)',
    default: 'rgba(255, 255, 255, 0.2)',
  },

  // WoW Class Colors
  class: {
    warrior: '#C79C6E',
    paladin: '#F58CBA',
    hunter: '#ABD473',
    rogue: '#FFF569',
    priest: '#FFFFFF',
    mage: '#69CCF0',
    warlock: '#9482CA',
    monk: '#00D9FF',
    demonhunter: '#A335EE',
  },

  // Item Rarity Colors
  rarity: {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#1E8FFF',
    epic: '#A855F7',
    legendary: '#FFD700',
    mythic: '#FF6644',
  },

  // Additional UI Colors
  ui: {
    black: '#000000',
    white: '#FFFFFF',
    red: '#EF4444',
    orange: '#FF8000',
    yellow: '#FFD700',
    green: '#00FF96',
  },
} as const;

export type Colors = typeof colors;
