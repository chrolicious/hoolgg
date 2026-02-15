export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
  md: '0 4px 16px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
  'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
  'glow-gold': '0 0 20px rgba(212, 160, 23, 0.3)',
} as const;

export type Shadows = typeof shadows;
