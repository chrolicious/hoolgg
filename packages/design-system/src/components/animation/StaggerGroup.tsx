'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export interface StaggerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  staggerDelay?: number;
  delayStart?: number;
  duration?: number;
  isVisible?: boolean;
}

/**
 * StaggerGroup — Stagger animations for multiple children
 * Each child animates in sequence with a delay between them
 *
 * Usage:
 * <StaggerGroup staggerDelay={0.1}>
 *   <Item />
 *   <Item />
 *   <Item />
 * </StaggerGroup>
 */
export const StaggerGroup = React.forwardRef<
  HTMLDivElement,
  StaggerGroupProps
>(
  (
    {
      children,
      direction = 'vertical',
      staggerDelay = 0.1,
      delayStart = 0,
      duration = 0.5,
      isVisible = true,
      className,
      ...props
    },
    ref,
  ) => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delayStart,
        },
      },
    };

    const itemVariants: Variants = {
      hidden: {
        opacity: 0,
        ...(direction === 'vertical' ? { y: 20 } : { x: 20 }),
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration,
          ease: 'easeOut',
        },
      },
      exit: {
        opacity: 0,
        ...(direction === 'vertical' ? { y: -20 } : { x: -20 }),
        transition: { duration: duration * 0.5 },
      },
    };

    return (
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className={className}
      >
        <AnimatePresence mode="wait">
          {React.Children.map(children, (child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  },
);

StaggerGroup.displayName = 'StaggerGroup';
