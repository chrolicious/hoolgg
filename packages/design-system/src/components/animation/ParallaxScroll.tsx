'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ParallaxScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  enableOnScroll?: boolean;
}

/**
 * ParallaxScroll — Move element based on scroll position
 * Creates a smooth parallax effect where movement speed is different from scroll speed
 *
 * Usage:
 * <ParallaxScroll speed={0.5} direction="up">
 *   <Image src="..." />
 * </ParallaxScroll>
 */
export const ParallaxScroll = React.forwardRef<
  HTMLDivElement,
  ParallaxScrollProps
>(
  (
    {
      children,
      speed = 0.5,
      direction = 'up',
      enableOnScroll = true,
      className,
    },
    ref,
  ) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Simple, smooth parallax using useTransform with input/output ranges
    // This avoids recalculating on every scroll and creates smooth GPU-accelerated movement
    const y = useTransform(
      scrollY,
      (latest) => {
        if (!enableOnScroll) return 0;
        const moveAmount = latest * speed;
        return direction === 'up' ? -moveAmount : moveAmount;
      },
    );

    return (
      <motion.div
        ref={ref || elementRef}
        style={{
          y,
          willChange: 'transform', // Hint to browser to optimize this transform
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  },
);

ParallaxScroll.displayName = 'ParallaxScroll';
