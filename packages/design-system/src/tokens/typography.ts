export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
} as const;

export const fontSize = {
  display: ['3rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '900' }],
  h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '800' }],
  h2: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.3px', fontWeight: '800' }],
  h3: ['1.125rem', { lineHeight: '1.2', letterSpacing: '-0.3px', fontWeight: '700' }],
  body: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  'body-strong': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
  small: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
  tiny: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '600' }],
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
