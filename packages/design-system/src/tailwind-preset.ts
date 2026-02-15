import type { Config } from 'tailwindcss';
import { colors } from './tokens/colors';
import { borderRadius } from './tokens/borders';
import { shadows } from './tokens/shadows';
import { spacing } from './tokens/spacing';

const hoolPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        hool: {
          'bg-base': colors.bg.base,
          'bg-surface': colors.bg.surface,
          'bg-elevated': colors.bg.elevated,
          'bg-overlay': colors.bg.overlay,

          'purple-900': colors.purple[900],
          'purple-700': colors.purple[700],
          'purple-500': colors.purple[500],
          'purple-400': colors.purple[400],
          'purple-200': colors.purple[200],

          'gold-900': colors.gold[900],
          'gold-700': colors.gold[700],
          'gold-500': colors.gold[500],
          'gold-400': colors.gold[400],
          'gold-200': colors.gold[200],

          'text-primary': colors.text.primary,
          'text-secondary': colors.text.secondary,
          'text-muted': colors.text.muted,
          'text-on-gold': colors.text.onGold,

          success: colors.semantic.success,
          error: colors.semantic.error,
          info: colors.semantic.info,
          warning: colors.semantic.warning,

          'border-subtle': colors.border.subtle,
          'border-muted': colors.border.muted,
          'border-default': colors.border.default,
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        display: ['3rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '900' }],
        h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '800' }],
        h2: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.3px', fontWeight: '800' }],
        h3: ['1.125rem', { lineHeight: '1.2', letterSpacing: '-0.3px', fontWeight: '700' }],
        body: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-strong': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
        small: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        tiny: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.5px', fontWeight: '600' }],
      },

      spacing: {
        'hool-1': spacing[1],
        'hool-2': spacing[2],
        'hool-3': spacing[3],
        'hool-4': spacing[4],
        'hool-5': spacing[5],
        'hool-6': spacing[6],
        'hool-8': spacing[8],
        'hool-10': spacing[10],
        'hool-12': spacing[12],
        'hool-16': spacing[16],
      },

      borderRadius: {
        'hool-sm': borderRadius.sm,
        'hool-md': borderRadius.md,
        'hool-lg': borderRadius.lg,
        'hool-xl': borderRadius.xl,
      },

      boxShadow: {
        'hool-sm': shadows.sm,
        'hool-md': shadows.md,
        'hool-lg': shadows.lg,
        'glow-purple': shadows['glow-purple'],
        'glow-gold': shadows['glow-gold'],
      },

      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        slower: '600ms',
      },

      transitionTimingFunction: {
        'hool-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'hool-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'hool-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'hool-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
};

export default hoolPreset;
