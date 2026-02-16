'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { colors } from '../../tokens/colors';
import { hop } from '../../tokens/animations';
import styles from './Button.module.css';

// --- Variant theming ---

export const variantVars = {
  primary: {
    '--btn-bg': '#FFD700',
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FFE933',
    '--btn-hover-bg-fade': `rgba(255, 233, 51, 0.9)`,
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
  },
  secondary: {
    '--btn-bg': '#F5F0E8',
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FFFFFF',
    '--btn-hover-bg-fade': 'rgba(255, 255, 255, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.08)',
  },
  purple: {
    '--btn-bg': '#C81EE8',
    '--btn-color': '#FFFFFF',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#E91EFF',
    '--btn-hover-bg-fade': `rgba(233, 30, 255, 0.9)`,
    '--btn-dot-color': 'rgba(255, 255, 255, 0.4)',
  },
  warning: {
    '--btn-bg': '#0070E6',
    '--btn-color': '#FFFFFF',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#1E8FFF',
    '--btn-hover-bg-fade': 'rgba(30, 143, 255, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.15)',
  },
  destructive: {
    '--btn-bg': '#FF4D33',
    '--btn-color': '#FFFFFF',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FF6644',
    '--btn-hover-bg-fade': 'rgba(255, 102, 68, 0.9)',
    '--btn-dot-color': 'rgba(0, 0, 0, 0.2)',
  },
  'primary-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FFFF00',
    '--btn-hover-bg-fade': `rgba(255, 255, 0, 0.9)`,
    '--btn-dot-color': '#FFD700',
    '--btn-hover-color': '#1a1a1a',
  },
  'purple-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#E91EFF',
    '--btn-hover-bg-fade': `rgba(233, 30, 255, 0.9)`,
    '--btn-dot-color': '#E91EFF',
    '--btn-hover-color': '#FFFFFF',
  },
  'destructive-soft': {
    '--btn-bg': colors.cream,
    '--btn-color': '#1a1a1a',
    '--btn-border-color': colors.sticker.border,
    '--btn-outline-color': colors.sticker.outline,
    '--btn-hover-bg': '#FFA500',
    '--btn-hover-bg-fade': 'rgba(255, 165, 0, 0.9)',
    '--btn-dot-color': '#FFA500',
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
