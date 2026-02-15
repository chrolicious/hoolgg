'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { colors } from '../../tokens/colors';
import { hop } from '../../tokens/animations';
import styles from './Button.module.css';

// --- Variant theming ---

export const variantVars = {
  primary: {
    '--btn-bg': colors.gold[500],
    '--btn-color': colors.text.onGold,
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.gold[400],
    '--btn-hover-bg-fade': `rgba(232, 184, 42, 0.9)`,
    '--btn-dot-color': '#fff60d',
  },
  secondary: {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FFFFFF',
    '--btn-hover-bg-fade': 'rgba(255, 255, 255, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.08)',
  },
  purple: {
    '--btn-bg': colors.purple[500],
    '--btn-color': colors.text.onPurple,
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.purple[400],
    '--btn-hover-bg-fade': `rgba(192, 132, 252, 0.9)`,
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
  },
  warning: {
    '--btn-bg': colors.slate[500],
    '--btn-color': '#FFFFFF',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.slate[400],
    '--btn-hover-bg-fade': 'rgba(124, 141, 162, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.12)',
  },
  destructive: {
    '--btn-bg': colors.semantic.error,
    '--btn-color': '#FFFFFF',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#F87171',
    '--btn-hover-bg-fade': 'rgba(248, 113, 113, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
  },
  'primary-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.gold[500],
    '--btn-hover-bg-fade': `rgba(212, 160, 23, 0.9)`,
    '--btn-dot-color': '#fff60d',
    '--btn-hover-color': colors.text.onGold,
  },
  'purple-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.purple[500],
    '--btn-hover-bg-fade': `rgba(168, 85, 247, 0.9)`,
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
    '--btn-hover-color': '#fff',
  },
  'destructive-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': colors.semantic.error,
    '--btn-hover-bg-fade': 'rgba(239, 68, 68, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
    '--btn-hover-color': '#fff',
  },
} as const;

// --- Types ---

export type ButtonVariant = keyof typeof variantVars;
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'default' | 'square' | 'circle';

// --- Spinner ---

export function Spinner({ size }: { size: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ position: 'relative', zIndex: 1 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth="2.5"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18, xl: 32 };

// --- Bouncy text: each character hops on hover ---

function useHopAnimation(isHovered: boolean, index: number) {
  return isHovered
    ? {
        y: [0, hop.distance, 0],
        transition: {
          delay: hop.initialDelay + index * hop.stagger,
          duration: hop.duration,
          ease: [hop.ease[0], hop.ease[1], hop.ease[2], hop.ease[3]] as [number, number, number, number],
          repeat: Infinity,
          repeatDelay: hop.repeatDelay,
        },
      }
    : { y: 0, transition: { duration: 0.15 } };
}

function HoppingChar({ isHovered, index, char }: {
  isHovered: boolean; index: number; char: string;
}) {
  const animate = useHopAnimation(isHovered, index);
  return (
    <motion.span
      style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
      animate={animate}
    >
      {char}
    </motion.span>
  );
}

export function BouncyContent({
  isHovered,
  icon,
  iconRight,
  loading,
  iconSize,
  children,
}: {
  isHovered: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading: boolean;
  iconSize: number;
  children?: React.ReactNode;
}) {
  const text = typeof children === 'string' ? children : null;

  return (
    <>
      {loading ? (
        <Spinner size={iconSize} />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {text ? (
        <span className={styles.content}>
          {text.split('').map((char, i) => (
            <HoppingChar key={i} isHovered={isHovered} index={i} char={char} />
          ))}
        </span>
      ) : children ? (
        <span className={styles.content}>{children}</span>
      ) : null}
      {!loading && iconRight && (
        <span className={styles.icon}>{iconRight}</span>
      )}
    </>
  );
}

// --- Shared className builder ---

export function buildClassName({
  size,
  shape,
  isSoft,
  selected,
  isIconOnly,
  fullWidth,
  className,
}: {
  size: ButtonSize;
  shape: ButtonShape;
  isSoft: boolean;
  selected: boolean;
  isIconOnly: boolean;
  fullWidth: boolean;
  className?: string;
}) {
  return `${styles.button} ${styles[size]}${shape !== 'default' ? ` ${styles[shape]}` : ''}${isSoft ? ` ${styles.soft}` : ''}${selected ? ` ${styles.selected}` : ''}${isIconOnly ? ` ${styles.iconOnly}` : ''}${fullWidth ? ` ${styles.fullWidth}` : ''}${className ? ` ${className}` : ''}`;
}
