export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const borderWidth = {
  thin: '1px',
  medium: '2px',
  thick: '3px',
} as const;

export type BorderRadius = typeof borderRadius;
export type BorderWidth = typeof borderWidth;
