'use client';

import React, { useMemo } from 'react';
import { motion, Transition } from 'framer-motion';

export type PageTransitionMode = 'zigzag-wipe' | 'fade' | 'slide';
export type PageTransitionDirection = 'left' | 'right' | 'top' | 'bottom';

export interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  mode?: PageTransitionMode;
  direction?: PageTransitionDirection;
  duration?: number;
  delay?: number;
  isVisible?: boolean;
}

const generateZigzagPath = (
  direction: PageTransitionDirection,
  progress: number
): string => {
  const width = 100;
  const height = 100;
  const toothSize = 8;
  let pathData = '';

  if (direction === 'left' || direction === 'right') {
    // Horizontal zigzag wipe
    const offset = direction === 'right' ? width * (1 - progress) : width * progress;
    let y = 0;

    pathData = `M ${offset} 0`;
    while (y < height) {
      pathData += ` L ${offset + toothSize} ${y + toothSize}`;
      y += toothSize * 2;
      pathData += ` L ${offset - toothSize} ${y + toothSize}`;
      y += toothSize * 2;
    }
    pathData += ` L ${offset} ${height} L ${width} ${height} L ${width} 0 Z`;
  } else {
    // Vertical zigzag wipe
    const offset = direction === 'bottom' ? height * (1 - progress) : height * progress;
    let x = 0;

    pathData = `M 0 ${offset}`;
    while (x < width) {
      pathData += ` L ${x + toothSize} ${offset + toothSize}`;
      x += toothSize * 2;
      pathData += ` L ${x + toothSize} ${offset - toothSize}`;
      x += toothSize * 2;
    }
    pathData += ` L ${width} ${offset} L ${width} ${height} L 0 ${height} Z`;
  }

  return pathData;
};

/**
 * PageTransition — Smooth page entrance/exit animation
 * Supports zigzag wipe (Mario Wonder-style), fade, and slide transitions
 *
 * Usage:
 * <PageTransition mode="zigzag-wipe" direction="right" isVisible={isOn}>
 *   <div>Page content</div>
 * </PageTransition>
 */
export const PageTransition = React.forwardRef<
  HTMLDivElement,
  PageTransitionProps
>(
  (
    {
      children,
      mode = 'fade',
      direction = 'right',
      duration = 0.6,
      delay = 0,
      isVisible = true,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = useMemo(() => {
      switch (mode) {
        case 'zigzag-wipe':
          return {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          };

        case 'slide':
          const slideDistance = 100;
          const slideInitial =
            direction === 'left'
              ? { x: slideDistance, opacity: 0 }
              : direction === 'right'
                ? { x: -slideDistance, opacity: 0 }
                : direction === 'top'
                  ? { y: slideDistance, opacity: 0 }
                  : { y: -slideDistance, opacity: 0 };

          return {
            hidden: slideInitial,
            visible: { x: 0, y: 0, opacity: 1 },
          };

        case 'fade':
        default:
          return {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          };
      }
    }, [mode, direction]);

    const transition: Transition = {
      duration,
      delay,
      type: 'tween',
      ease: 'easeInOut',
    } as Transition;

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={variants}
        transition={transition}
        className={className}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    );
  },
);

PageTransition.displayName = 'PageTransition';
