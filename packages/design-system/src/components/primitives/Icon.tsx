'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import React, { useEffect } from 'react';

// Declare lord-icon web component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          trigger?: string;
          colors?: string;
          stroke?: string | number;
        },
        HTMLElement
      >;
    }
  }
}

// Free lordicon icons available via CDN
// To add more: Visit https://lordicon.com/icons, click an icon, get the embed code, and add the JSON URL here
// Note: Simple geometric shapes (plus, arrows, etc.) use Lucide with custom animations
const LORDICON_FREE: Record<string, string> = {
  // Special animated icons (lordicon)
  trash: 'https://cdn.lordicon.com/xyfswyxf.json', // Trash can
  'trash-2': 'https://cdn.lordicon.com/xyfswyxf.json',
  heart: 'https://cdn.lordicon.com/qvlwoymy.json', // Heart/favorite icon
  settings: 'https://cdn.lordicon.com/umuwriak.json', // Settings cogwheel
  menu: 'https://cdn.lordicon.com/dkrstlom.json', // Menu/hamburger
};

export interface IconProps {
  /** Icon name from Lucide or lordicon System/Solid */
  name: string;
  /** Icon size in pixels — defaults to 24 */
  size?: number;
  /** Icon color — defaults to currentColor */
  color?: string;
  /** Stroke width — defaults to 2 */
  strokeWidth?: number;
  /** Animation style (only for Lucide icons) */
  animation?: 'bounce' | 'wiggle' | 'spin' | 'spin-once' | 'pulse' | 'pop' | 'slide' | 'shake' | 'swing' | 'none';
  /** Trigger animation immediately on mount (for entrance effects) */
  triggerOnMount?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

// Animation variants for playful effects (Lucide icons only)
const animations = {
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
  spin: {
    rest: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing for momentum feel
      },
    },
  },
  'spin-once': {
    rest: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing for momentum feel
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
  none: {
    rest: {},
    hover: {},
  },
};

export const Icon = React.forwardRef<SVGSVGElement | HTMLElement, IconProps>(
  (
    {
      name,
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      animation = 'bounce',
      triggerOnMount = false,
      className,
      style,
    },
    ref,
  ) => {
    const lordIconRef = React.useRef<any>(null);
    const lucideWrapperRef = React.useRef<HTMLDivElement>(null);
    const [isParentHovered, setIsParentHovered] = React.useState(triggerOnMount);

    // Load lordicon script once
    useEffect(() => {
      if (typeof window !== 'undefined' && !window.customElements.get('lord-icon')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.lordicon.com/lordicon.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }, []);

    // Set up hover listeners on parent button for both lordicon and lucide icons
    useEffect(() => {
      const setupListener = () => {
        const iconElement = lordIconRef.current || lucideWrapperRef.current;
        if (!iconElement) return false;

        const button = iconElement.closest('button, a');
        if (!button) return false;

        const handleMouseEnter = () => {
          setIsParentHovered(true);

          // For lordicon: trigger animation once on hover
          if (lordIconRef.current) {
            const lordIcon = lordIconRef.current;
            if (lordIcon.playFromBeginning) {
              lordIcon.playFromBeginning();
            } else if (lordIcon.play) {
              lordIcon.play();
            } else {
              lordIcon.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            }
          }
        };

        const handleMouseLeave = () => {
          setIsParentHovered(false);
        };

        button.addEventListener('mouseenter', handleMouseEnter);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          button.removeEventListener('mouseenter', handleMouseEnter);
          button.removeEventListener('mouseleave', handleMouseLeave);
        };
      };

      const timer = setTimeout(setupListener, 100);
      return () => clearTimeout(timer);
    }, []);

    // Check if this is a lordicon
    const lordIconUrl = LORDICON_FREE[name];

    if (lordIconUrl) {
      // Use lordicon for free icons with built-in animations
      // Some icons have specific states for better animations
      const iconState = name === 'arrow-right' ? 'hover-ternd-flat-2' : undefined;

      return (
        <lord-icon
          ref={lordIconRef}
          src={lordIconUrl}
          trigger="hover"
          state={iconState}
          colors={`primary:${color === 'currentColor' ? '#121331' : color},secondary:#e8b82a`}
          stroke={strokeWidth * 35}
          className={className}
          style={{
            width: size,
            height: size,
            display: 'inline-block',
            ...style,
          }}
        />
      );
    }

    // Fall back to Lucide icons with custom animations
    const iconName = name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const LucideIcon = (LucideIcons as any)[iconName] as React.ComponentType<LucideIcons.LucideProps>;

    if (!LucideIcon) {
      console.warn(`Icon "${name}" (${iconName}) not found in Lucide or lordicon free icons`);
      return (
        <div
          className={className}
          style={{
            width: size,
            height: size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        >
          ?
        </div>
      );
    }

    return (
      <motion.div
        ref={lucideWrapperRef}
        initial="rest"
        animate={isParentHovered ? 'hover' : 'rest'}
        variants={animations[animation]}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LucideIcon
          ref={ref as any}
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          className={className}
          style={style}
        />
      </motion.div>
    );
  },
);

Icon.displayName = 'Icon';
