'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface IconProps {
  /** Icon name (without 'fi-br-' prefix, e.g., 'user', 'home', 'heart') */
  name: string;
  /** Icon size in pixels — defaults to 1em (inherits from parent) */
  size?: number | string;
  /** Animation style — only applies on hover */
  animation?: 'bounce' | 'spin' | 'pulse' | 'wiggle' | 'slide' | 'shake' | 'swing' | 'spin-once' | 'pop' | 'none';
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * Icon component using Flaticon Uicons Bold Rounded
 *
 * Usage: <Icon name="user" size={24} animation="bounce" />
 *
 * Available icons: https://www.flaticon.com/packs/uicons-bold-rounded
 * (4000+ icons available)
 */

const animations: Record<string, any> = {
  bounce: {
    rest: { y: 0 },
    hover: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  spin: {
    rest: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  },
  'spin-once': {
    rest: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  },
  pulse: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  wiggle: {
    rest: { rotate: 0 },
    hover: {
      rotate: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 0.6,
      },
    },
  },
  slide: {
    rest: { x: 0 },
    hover: {
      x: [0, 6, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  shake: {
    rest: { rotate: 0 },
    hover: {
      rotate: [-8, 8, -8, 8, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 0.8,
      },
    },
  },
  swing: {
    rest: { rotate: 0 },
    hover: {
      rotate: [-12, 12, -12, 12, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  },
  pop: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.3, 0.9, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 0.6,
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
  },
  none: {
    rest: {},
    hover: {},
  },
};

export const Icon = React.forwardRef<HTMLElement, IconProps>(
  ({ name, size, animation = 'none', className, style }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const button = wrapper.closest('button, a');
      if (!button) return;

      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, []);

    const sizeStyle = size !== undefined
      ? { fontSize: typeof size === 'number' ? `${size}px` : size }
      : { fontSize: '1em' };

    return (
      <motion.div
        ref={wrapperRef}
        initial="rest"
        animate={isHovered ? 'hover' : 'rest'}
        variants={animations[animation]}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i
          ref={ref}
          className={`fi fi-br-${name} ${className || ''}`.trim()}
          style={{
            ...sizeStyle,
            ...style,
          }}
        />
      </motion.div>
    );
  },
);

Icon.displayName = 'Icon';
