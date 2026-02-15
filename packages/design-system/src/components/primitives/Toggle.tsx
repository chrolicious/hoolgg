'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { spring } from '../../tokens/animations';
import styles from './Toggle.module.css';
import { variantVars, type ButtonVariant } from './Button.shared';

export type ToggleVariant = ButtonVariant;
export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  className?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      variant = 'primary',
      size = 'md',
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isSoft = variant.endsWith('-soft');

    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div className={`${styles.container} ${className || ''}`}>
        {/* Hidden native input */}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className={styles.hiddenInput}
        />

        {/* Toggle track (button-like sticker frame) */}
        <motion.div
          className={`${styles.toggle} ${styles[size]}${isSoft ? ` ${styles.soft}` : ''}${checked ? ` ${styles.checked}` : ` ${styles.unchecked}`}${disabled ? ` ${styles.disabled}` : ''}`}
          style={variantVars[variant] as React.CSSProperties}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onHoverStart={() => !disabled && setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={disabled ? undefined : { y: -1 }}
          transition={{ type: 'spring', ...spring.snappy }}
          role="switch"
          aria-checked={checked}
          tabIndex={disabled ? -1 : 0}
        >
          {/* White outline layer */}
          <span className={styles.outline}>
            {/* Dark border layer */}
            <span className={styles.darkLayer}>
              {/* Inside fill layer */}
              <span className={styles.inside}>
                {/* Sliding pill knob */}
                <motion.div
                  className={styles.knob}
                  animate={{ x: checked ? '100%' : '0%' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </span>
            </span>
          </span>
        </motion.div>

        {/* Label and description */}
        {(label || description) && (
          <div className={styles.labelWrapper}>
            {label && (
              <label
                className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
                onClick={handleClick}
              >
                {label}
              </label>
            )}
            {description && (
              <div className={`${styles.description} ${disabled ? styles.descriptionDisabled : ''}`}>
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';
