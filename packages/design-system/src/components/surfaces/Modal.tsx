'use client';

import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../primitives/Button';
import styles from './Modal.module.css';

// Skull background animation component
interface SkullParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
}

const SkullBackground: React.FC = () => {
  const skulls = useMemo<SkullParticle[]>(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      // Move diagonally - randomly choose direction
      const direction = Math.floor(Math.random() * 4);
      let endX: number, endY: number;

      switch (direction) {
        case 0: // up-left
          endX = -20;
          endY = -20;
          break;
        case 1: // up-right
          endX = 120;
          endY = -20;
          break;
        case 2: // down-left
          endX = -20;
          endY = 120;
          break;
        default: // down-right (case 3)
          endX = 120;
          endY = 120;
      }

      return {
        id: i,
        startX,
        startY,
        endX,
        endY,
        duration: 10 + Math.random() * 8, // 10-18 seconds
        delay: Math.random() * 3,
      };
    });
  }, []);

  return (
    <div className={styles.skullBackdrop}>
      {skulls.map((skull) => (
        <motion.div
          key={skull.id}
          className={styles.skull}
          style={{
            left: `${skull.startX}%`,
            top: `${skull.startY}%`,
          }}
          animate={{
            left: `${skull.endX}%`,
            top: `${skull.endY}%`,
            rotate: 360,
            opacity: [0.12, 0.12],
          }}
          transition={{
            duration: skull.duration,
            delay: skull.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        >
          {/* Skull SVG */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.skullSvg}
          >
            {/* Skull structure */}
            <path d="M 6 5 Q 6 2 12 2 Q 18 2 18 5 Q 18 8 16 9 L 16 13 Q 16 16 12 17 Q 8 16 8 13 L 8 9 Q 6 8 6 5 Z" />
            {/* Left eye socket */}
            <circle cx="9" cy="6" r="1.2" />
            {/* Right eye socket */}
            <circle cx="15" cy="6" r="1.2" />
            {/* Teeth */}
            <line x1="8" y1="14" x2="16" y2="14" />
            <line x1="9" y1="14" x2="9" y2="15" />
            <line x1="11" y1="14" x2="11" y2="15" />
            <line x1="13" y1="14" x2="13" y2="15" />
            <line x1="15" y1="14" x2="15" y2="15" />
            {/* Jaw line */}
            <path d="M 8 13 Q 12 15 16 13" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export type GradientVariant = 'purple-pink' | 'blue-purple' | 'cyan-blue' | 'orange-red' | 'pink-orange' | 'green-yellow' | 'purple-orange';

export interface ModalProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
  gradientVariant?: GradientVariant;
  className?: string;
}

/**
 * Modal — Centered dialog with backdrop overlay and animations
 * Provides focus management and accessible modal dialog
 *
 * Usage:
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
 *   Modal content
 * </Modal>
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      children,
      isOpen,
      onClose,
      title,
      subtitle,
      footer,
      closeOnBackdropClick = true,
      closeOnEscapeKey = true,
      size = 'md',
      padding = 'lg',
      gradientVariant = 'purple-pink',
      className,
      ...props
    },
    ref,
  ) => {
    // Handle close button click
    const handleClose = () => {
      onClose?.();
    };

    // Handle escape key
    useEffect(() => {
      if (!closeOnEscapeKey || !isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscapeKey, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }, [isOpen]);

    return createPortal(
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeOnBackdropClick ? onClose : undefined}
            />

            {/* Modal container */}
            <motion.div
              className={styles.container}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.5,
              }}
            >
              {/* Modal content */}
              <div
                ref={ref}
                className={`${styles.modal} ${styles[`size-${size}`]} ${styles[`gradient-${gradientVariant}`]} ${className || ''}`}
                onClick={(e) => e.stopPropagation()}
                {...props}
              >
                {/* Outline layer */}
                <div className={styles.outline}>
                  {/* Dark border layer */}
                  <div className={styles.darkLayer}>
                    {/* Skull background animation */}
                    <SkullBackground />
                    {/* Inside fill */}
                    <div className={styles.inside}>
                      {/* Header section */}
                      {(title || subtitle) && (
                        <div
                          className={`${styles.header} ${styles[`padding-${padding}`]}`}
                        >
                          <div>
                            {title && <div className={styles.title}>{title}</div>}
                            {subtitle && (
                              <div className={styles.subtitle}>{subtitle}</div>
                            )}
                          </div>
                          {onClose && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleClose}
                              aria-label="Close modal"
                              icon={
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              }
                            />
                          )}
                        </div>
                      )}

                      {/* Divider */}
                      {(title || subtitle) && <div className={styles.divider} />}

                      {/* Body section */}
                      <div className={`${styles.body} ${styles[`padding-${padding}`]}`}>
                        {children}
                      </div>

                      {/* Divider */}
                      {footer && <div className={styles.divider} />}

                      {/* Footer section */}
                      {footer && (
                        <div
                          className={`${styles.footer} ${styles[`padding-${padding}`]}`}
                        >
                          {footer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
    );
  },
);

Modal.displayName = 'Modal';
