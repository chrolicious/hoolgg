'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../primitives/Button';
import styles from './Modal.module.css';

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
      className,
      ...props
    },
    ref,
  ) => {
    const [isClosing, setIsClosing] = React.useState(false);

    // Handle close button click
    const handleClose = () => {
      setIsClosing(true);
      onClose?.();
      // Reset spinning state after animation
      setTimeout(() => setIsClosing(false), 600);
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
                className={`${styles.modal} ${styles[`size-${size}`]} ${className || ''}`}
                onClick={(e) => e.stopPropagation()}
                {...props}
              >
                {/* Outline layer */}
                <div className={styles.outline}>
                  {/* Dark border layer */}
                  <div className={styles.darkLayer}>
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
                            <motion.div
                              animate={{ rotate: isClosing ? 360 : 0 }}
                              transition={{
                                duration: isClosing ? 0.6 : 0,
                                ease: 'easeInOut',
                              }}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                shape="circle"
                                onClick={handleClose}
                                aria-label="Close modal"
                                icon={
                                  <svg
                                    width="18"
                                    height="18"
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
                            </motion.div>
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
