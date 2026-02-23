'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, type ButtonVariant, type ButtonSize } from './Button';
import { Icon } from './Icon';
import styles from './Checkbox.module.css';

export type CheckboxVariant = ButtonVariant;
export type CheckboxSize = Extract<ButtonSize, 'sm' | 'md' | 'lg'>;

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  /** Override CSS variables on the inner Button (e.g. class color theming) */
  buttonStyle?: React.CSSProperties;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      variant = 'primary',
      size = 'md',
      disabled = false,
      indeterminate = false,
      className,
      buttonStyle,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const isCheckedOrIndeterminate = checked || indeterminate;

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

    // Icon only shows when checked/indeterminate (empty when unchecked)
    const iconName = indeterminate ? 'minus' : 'check';
    const showIcon = isCheckedOrIndeterminate;

    // Icon size mapping for checkbox sizes - larger icons in compact boxes
    const iconSizes: Record<CheckboxSize, number> = { sm: 12, md: 14, lg: 16 };

    return (
      <div
        className={`${styles.container} ${className || ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Hidden native input for accessibility and form integration */}
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={styles.hiddenInput}
        />

        {/* Button-based checkbox - empty when unchecked, checkmark when checked */}
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          selected={isCheckedOrIndeterminate} // Only selected when checked for lift effect
          style={buttonStyle}
          icon={
            <div style={{ width: iconSizes[size], height: iconSizes[size], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                {showIcon ? (
                  <motion.div
                    key={iconName}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <Icon name={iconName} size={iconSizes[size]} animation="none" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          }
          className={`${styles.checkboxButton} ${!isCheckedOrIndeterminate ? styles.unchecked : ''} ${styles.alwaysColored}`}
        />

        {/* Label and description */}
        {(label || description) && (
          <div className={styles.labelWrapper}>
            {label && (
              <label
                className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
                onClick={(e) => {
                  // Prevent double-triggering when clicking the label
                  e.preventDefault();
                  handleClick();
                }}
              >
                {label}
              </label>
            )}
            {description && (
              <div
                className={`${styles.description} ${disabled ? styles.descriptionDisabled : ''}`}
              >
                {description}
              </div>
            )}
          </div>
        )}

        {/* Focus ring */}
        {isFocused && !disabled && <div className={styles.focusRing} />}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
