'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Tag.module.css';
import { variantVars, type ButtonVariant } from './Button.shared';

const EXPLOSION_STICKERS = ['💥', '⭐'];
const EXPLOSION_DURATION = 1.0;

export type TagVariant = ButtonVariant;
export type TagSize = 'sm' | 'md';

export interface TagProps {
  variant?: TagVariant;
  size?: TagSize;
  onRemove?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Tag component — Small sticker-style labels with optional remove button
 *
 * Usage:
 * <Tag variant="primary">skill</Tag>
 * <Tag onRemove={() => {}}>removable tag</Tag>
 */
export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      onRemove,
      className,
      children,
    },
    ref,
  ) => {
    const [isRemoving, setIsRemoving] = useState(false);
    const [explosions, setExplosions] = useState<Array<{ id: string; sticker: string }>>([]);
    const tagRef = useRef<HTMLDivElement>(null);

    const handleRemove = () => {
      setIsRemoving(true);

      // Create explosion effect at tag center
      if (tagRef.current) {
        const rect = tagRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const sticker = EXPLOSION_STICKERS[Math.floor(Math.random() * EXPLOSION_STICKERS.length)];
        const explosionId = Math.random().toString(36);

        setExplosions((prev) => [...prev, { id: explosionId, sticker }]);

        // Remove explosion effect and tag after animation completes
        setTimeout(() => {
          setExplosions((prev) => prev.filter((e) => e.id !== explosionId));
          onRemove?.();
        }, EXPLOSION_DURATION * 1000);
      }
    };

    return (
      <>
        <motion.div
          ref={tagRef}
          className={`${styles.tag} ${styles[size]} ${className || ''}`.trim()}
          style={variantVars[variant] as React.CSSProperties}
          data-variant={variant}
          initial={{ opacity: 1, scale: 1, rotate: 0 }}
          animate={
            isRemoving
              ? { opacity: 0, scale: 0.3, rotate: 8 }
              : { opacity: 1, scale: 1, rotate: 0 }
          }
          transition={{
            duration: 0.15,
            ease: 'easeOut',
          }}
        >
          {/* Outline layer */}
          <div className={styles.outline}>
            {/* Dark border layer */}
            <div className={styles.darkLayer}>
              {/* Inside fill */}
              <div className={styles.inside}>
                <span className={styles.label}>{children}</span>
                {onRemove && (
                  <button
                    className={styles.removeButton}
                    onClick={handleRemove}
                    disabled={isRemoving}
                    aria-label="Remove tag"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Explosion stickers */}
        {explosions.map((explosion) => {
          const rect = tagRef.current?.getBoundingClientRect();
          const centerX = rect ? rect.left + rect.width / 2 : 0;
          const centerY = rect ? rect.top + rect.height / 2 : 0;

          return (
            <motion.div
              key={explosion.id}
              style={{
                position: 'fixed',
                left: centerX,
                top: centerY,
                fontSize: '2rem',
                pointerEvents: 'none',
                zIndex: 1000,
                textShadow: `
                  -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white,
                  2px 4px 6px rgba(0, 0, 0, 0.4)
                `,
              }}
              initial={{ scale: 0.5, opacity: 1, x: -12, y: -12, rotate: 0 }}
              animate={{
                scale: 1.5,
                opacity: 0,
                x: (Math.random() - 0.5) * 100,
                y: -60 + Math.random() * 40,
                rotate: 180,
              }}
              transition={{
                duration: EXPLOSION_DURATION,
                ease: 'easeOut',
              }}
            >
              {explosion.sticker}
            </motion.div>
          );
        })}
      </>
    );
  },
);

Tag.displayName = 'Tag';
