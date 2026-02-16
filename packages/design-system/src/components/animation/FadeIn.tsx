'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, Transition } from 'framer-motion';

export type FadeInEffect = 'fade' | 'pop';
export type FadeInTrigger = 'scroll' | 'hover';

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  triggerOnce?: boolean;
  effect?: FadeInEffect;
  trigger?: FadeInTrigger;
}

/**
 * FadeIn — Fade in animation when element appears
 *
 * Usage:
 * <FadeIn duration={0.5} delay={0.1}>
 *   <div>Content fades in</div>
 * </FadeIn>
 */
export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  (
    {
      children,
      duration = 0.6,
      delay = 0,
      triggerOnce = true,
      effect = 'fade',
      trigger: triggerType = 'scroll',
      className,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(triggerType === 'hover');

    useEffect(() => {
      if (triggerType === 'hover') return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && internalRef.current) {
              observer.unobserve(internalRef.current);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
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
    }, [triggerType, triggerOnce]);

    const getAnimationConfig = (): {
      initial: { opacity: number; scale?: number };
      animate: { opacity: number; scale?: number };
      transition: Transition;
    } => {
      if (effect === 'pop') {
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 },
          transition: {
            duration,
            delay,
            type: 'spring',
            stiffness: 400,
            damping: 10,
          } as Transition,
        };
      }

      // fade effect
      return {
        initial: { opacity: 0 },
        animate: isVisible ? { opacity: 1 } : { opacity: 0 },
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        } as Transition,
      };
    };

    const config = getAnimationConfig();

    const hoverConfig = effect === 'pop' ? { scale: 1.1 } : { opacity: 1 };
    const hoverTransition = triggerType === 'hover' && effect === 'pop'
      ? { type: 'spring', stiffness: 400, damping: 10, duration: 0.2 } as Transition
      : { duration: 0.2 } as Transition;

    return (
      <motion.div
        ref={ref || internalRef}
        initial={config.initial}
        animate={config.animate}
        whileHover={triggerType === 'hover' ? hoverConfig : undefined}
        transition={triggerType === 'hover' ? hoverTransition : config.transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  },
);

FadeIn.displayName = 'FadeIn';
