'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Star, Shield, Search, User, Users, Menu, Home, Settings,
  Zap, Flame, Sword, Crown, AlertCircle, BookOpen, RefreshCw,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronDown, ChevronLeft,
  Plus, Check, Link, Pencil, Trash2, X, Minus,
  GripVertical, ArrowUpDown, Clock,
} from 'lucide-react';

export interface IconProps {
  /** Icon name (from Lucide, e.g., 'user', 'home', 'heart') */
  name: string;
  /** Icon size in pixels — defaults to 24 */
  size?: number | string;
  /** Animation style — only applies on hover */
  animation?: 'bounce' | 'spin' | 'pulse' | 'wiggle' | 'slide' | 'shake' | 'swing' | 'spin-once' | 'pop' | 'none';
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * Icon component using Lucide React icons
 *
 * Usage: <Icon name="user" size={24} animation="bounce" />
 *
 * Available icons: https://lucide.dev
 * (1000+ icons available)
 */

const iconMap: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  star: Star,
  shield: Shield,
  search: Search,
  user: User,
  users: Users,
  menu: Menu,
  home: Home,
  settings: Settings,
  zap: Zap,
  flame: Flame,
  sword: Sword,
  crown: Crown,
  'alert-circle': AlertCircle,
  'book-open': BookOpen,
  'refresh': RefreshCw,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  plus: Plus,
  check: Check,
  link: Link,
  pencil: Pencil,
  trash: Trash2,
  'x-mark': X,
  minus: Minus,
  'grip-vertical': GripVertical,
  'arrow-up-down': ArrowUpDown,
  clock: Clock,
};

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

    const sizePixels = typeof size === 'number' ? size : 24;
    const LucideIcon = iconMap[name.toLowerCase()];

    if (!LucideIcon) {
      console.warn(`Icon "${name}" not found in icon map`);
      return null;
    }

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
        <LucideIcon
          size={sizePixels}
          className={className || ''}
          style={style}
          strokeWidth={2}
        />
      </motion.div>
    );
  },
);

Icon.displayName = 'Icon';
