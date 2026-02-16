'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, Transition } from 'framer-motion';

export type SlideInDirection = 'left' | 'right' | 'top' | 'bottom';
export type SlideInTrigger = 'scroll' | 'immediate';

export interface SlideInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: SlideInDirection;
  duration?: number;
  delay?: number;
  distance?: number;
  trigger?: SlideInTrigger;
}

const getInitialPosition = (direction: SlideInDirection, distance: number) => {
  const config: Record<SlideInDirection, { x: number; y: number }> = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    top: { x: 0, y: -distance },
    bottom: { x: 0, y: distance },
  };
  return config[direction];
};

/**
 * SlideIn — Slide in animation from a direction
 *
 * Usage:
 * <SlideIn direction="left" duration={0.5}>
 *   <div>Content slides in from left</div>
 * </SlideIn>
 */
export const SlideIn = React.forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      direction = 'left',
      duration = 0.6,
      delay = 0,
      distance = 100,
      trigger = 'scroll',
      className,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(trigger === 'immediate');

    useEffect(() => {
      if (trigger === 'immediate') return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (internalRef.current) {
              observer.unobserve(internalRef.current);
            }
          }
        },
        { threshold: 0.1 },
      );

      if (internalRef.current) {
        observer.observe(internalRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [trigger]);

    const initialPos = getInitialPosition(direction, distance);
    const transition: Transition = {
      duration: duration * 0.7,
      delay,
      type: 'spring',
      stiffness: 200,
      damping: 10,
      mass: 0.8,
    };

    return (
      <motion.div
        ref={ref || internalRef}
        initial={{ opacity: 0, ...initialPos }}
        animate={isVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialPos }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  },
);

SlideIn.displayName = 'SlideIn';
