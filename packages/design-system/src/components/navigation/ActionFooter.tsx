'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../primitives/Button';
import styles from './ActionFooter.module.css';

export interface ActionFooterProps {
  actions: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
  }>;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  showDarkOverlay?: boolean;
  className?: string;
}

const MotionButton = motion(Button);

/**
 * ActionFooter — Bottom action buttons with optional dark overlay
 * Perfect for modal confirmations and selection screens
 *
 * Usage:
 * <ActionFooter
 *   position="bottom-right"
 *   actions={[
 *     { key: 'back', label: 'Back', variant: 'secondary', onClick: handleBack },
 *     { key: 'select', label: 'Select', variant: 'primary', onClick: handleSelect },
 *   ]}
 * />
 */
export const ActionFooter = React.forwardRef<HTMLDivElement, ActionFooterProps>(
  (
    {
      actions,
      position = 'bottom-right',
      showDarkOverlay = false,
      className,
    },
    ref,
  ) => {
    const mapVariant = (
      variant?: 'primary' | 'secondary' | 'danger',
    ): 'primary' | 'secondary' | 'destructive' => {
      switch (variant) {
        case 'primary':
          return 'primary';
        case 'secondary':
          return 'secondary';
        case 'danger':
          return 'destructive';
        default:
          return 'secondary';
      }
    };

    return (
      <>
        {/* Dark overlay behind actions */}
        {showDarkOverlay && (
          <motion.div
            className={styles.darkOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Action footer */}
        <motion.div
          ref={ref}
          className={`${styles.footer} ${styles[position]} ${className || ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <AnimatePresence>
            {actions.map((action, index) => (
              <MotionButton
                key={action.key}
                variant={mapVariant(action.variant)}
                onClick={action.onClick}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05, duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {action.icon}
                {action.label}
              </MotionButton>
            ))}
          </AnimatePresence>
        </motion.div>
      </>
    );
  },
);

ActionFooter.displayName = 'ActionFooter';
