'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import styles from './GlowEffect.module.css';

export type GlowColor = 'primary' | 'purple' | 'cyan' | 'pink' | 'amber';

export interface GlowEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: GlowColor;
  intensity?: 'subtle' | 'medium' | 'intense';
  animate?: boolean;
  size?: number;
}

const glowColors: Record<GlowColor, string> = {
  primary: '#F4B860',
  purple: '#B89FFF',
  cyan: '#00D9FF',
  pink: '#FF69B4',
  amber: '#FFB800',
};

/**
 * GlowEffect — Add an animated glow behind an element
 * Creates a pulsing light effect for emphasis
 *
 * Usage:
 * <GlowEffect color="cyan" intensity="medium">
 *   <Button>Click me</Button>
 * </GlowEffect>
 */
export const GlowEffect = React.forwardRef<HTMLDivElement, GlowEffectProps>(
  (
    {
      children,
      color = 'primary',
      intensity = 'medium',
      animate = true,
      size = 200,
      className,
      ...props
    },
    ref,
  ) => {
    const [isHovering, setIsHovering] = useState(false);

    const intensityMap = {
      subtle: { blur: '40px', opacity: 0.3 },
      medium: { blur: '60px', opacity: 0.5 },
      intense: { blur: '80px', opacity: 0.7 },
    };

    const currentIntensity = intensityMap[intensity];

    const glowVariants: Variants = {
      initial: { opacity: currentIntensity.opacity * 0.5, scale: 0.8 },
      animate: animate
        ? {
            opacity: [currentIntensity.opacity * 0.5, currentIntensity.opacity, currentIntensity.opacity * 0.5],
            scale: [0.8, 1, 0.8],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }
        : { opacity: currentIntensity.opacity, scale: 1 },
      hover: {
        opacity: currentIntensity.opacity,
        scale: 1.1,
        transition: { duration: 0.3 },
      },
    };

    return (
      <div
        ref={ref}
        className={className}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {/* Glow background */}
        <motion.div
          className={styles.glow}
          variants={glowVariants}
          initial="initial"
          animate={isHovering ? 'hover' : 'animate'}
          style={{
            background: glowColors[color],
            width: size,
            height: size,
            borderRadius: '50%',
            filter: `blur(${currentIntensity.blur})`,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />

        {/* Content */}
        {children}
      </div>
    );
  },
);

GlowEffect.displayName = 'GlowEffect';
