'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Tooltip.module.css';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** Tooltip text content */
  children: string;
  /** Element to show the tooltip for */
  trigger: React.ReactNode;
  /** Position relative to trigger */
  position?: TooltipPosition;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Tooltip component — Short contextual messages on hover
 *
 * Usage:
 * <Tooltip trigger={<button>Hover me</button>}>Help text here</Tooltip>
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      trigger,
      position = 'top',
      delay = 0,
      className,
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [tailOffsetX, setTailOffsetX] = useState(0);
    const [tooltipOffset, setTooltipOffset] = useState({ x: 0, y: 0 });
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
      const id = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      setTimeoutId(id);
    };

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsVisible(false);
      setTooltipOffset({ x: 0, y: 0 });
      setTailOffsetX(0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!tooltipRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
      const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;

      // Move triangle horizontally based on cursor X position (max 20px)
      const horizontalDistance = e.clientX - tooltipCenterX;
      const maxHorizontalDistance = 60;
      const tailX = Math.max(-20, Math.min(20, (horizontalDistance / maxHorizontalDistance) * 20));

      // Calculate offset toward cursor (max 8px in each direction)
      const distance = Math.sqrt(
        Math.pow(e.clientX - tooltipCenterX, 2) + Math.pow(e.clientY - tooltipCenterY, 2)
      );
      const maxDistance = 150;
      const offsetAmount = Math.min(8, (distance > 0 ? 8 * (distance / maxDistance) : 0));

      const offsetX = (e.clientX - tooltipCenterX) / distance * offsetAmount;
      const offsetY = (e.clientY - tooltipCenterY) / distance * offsetAmount;

      setTailOffsetX(tailX);
      setTooltipOffset({ x: offsetX, y: offsetY });
    };

    return (
      <div
        ref={wrapperRef}
        className={`${styles.tooltipWrapper} ${className || ''}`.trim()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {trigger}

        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              className={`${styles.tooltip} ${styles[position]}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{
                x: tooltipOffset.x,
                y: tooltipOffset.y,
                '--pointer-offset': `${tailOffsetX}px`,
              } as React.CSSProperties}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
