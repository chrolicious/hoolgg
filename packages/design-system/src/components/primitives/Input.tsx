'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import styles from './Input.module.css';

export type InputVariant = 'default' | 'hero' | 'simple';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  error?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      icon,
      iconRight,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Check if className contains 'connected' (from InputWithLabel)
    const isConnected = className?.includes('connected');

    const wrapperClasses = [
      styles.wrapper,
      styles[variant],
      styles[size],
      error && styles.error,
      disabled && styles.disabled,
      fullWidth && styles.fullWidth,
      isConnected && styles.connected,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showHalftone = (isFocused || isHovered) && !disabled && variant !== 'hero';

    // Hero variant uses nested layers like the button
    if (variant === 'hero') {
      return (
        <motion.div
          className={wrapperClasses}
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className={styles.outline}>
            <span className={styles.darkLayer}>
              <span className={styles.inside}>
                <div className={styles.container}>
                  {icon && <span className={styles.icon}>{icon}</span>}
                  <input
                    ref={ref}
                    className={styles.input}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                  />
                  {iconRight && <span className={styles.icon}>{iconRight}</span>}
                </div>
              </span>
            </span>
          </span>
        </motion.div>
      );
    }

    // Default and simple variants
    return (
      <motion.div
        className={wrapperClasses}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={!disabled ? { y: -1 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className={styles.container}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            className={styles.input}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {iconRight && <span className={styles.icon}>{iconRight}</span>}
        </div>
        {showHalftone && <div className={styles.halftone} />}
      </motion.div>
    );
  },
);

Input.displayName = 'Input';
