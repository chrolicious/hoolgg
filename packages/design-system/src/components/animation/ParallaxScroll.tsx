'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ParallaxScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  offset?: number;
  direction?: 'up' | 'down';
  speed?: number;
  enableOnScroll?: boolean;
}

/**
 * ParallaxScroll — Move element based on scroll position
 * Creates a parallax effect where movement speed is different from scroll speed
 *
 * Usage:
 * <ParallaxScroll offset={50} direction="up">
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
      offset = 50,
      direction = 'up',
      speed = 0.5,
      enableOnScroll = true,
      className,
      ...props
    },
    ref,
  ) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    // Parallax transformation based on scroll
    const y = useTransform(scrollY, (value) => {
      if (!enableOnScroll || !isVisible) return 0;

      const moveAmount = value * speed;
      return direction === 'up' ? -moveAmount : moveAmount;
    });

    // Intersection Observer to only animate when visible
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.1 },
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <motion.div
        ref={ref || elementRef}
        style={{ y }}
        initial={{ y: 0 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  },
);

ParallaxScroll.displayName = 'ParallaxScroll';
