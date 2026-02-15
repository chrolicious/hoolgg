'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Input, type InputProps } from './Input';
import styles from './InputWithLabel.module.css';

export interface InputWithLabelProps extends InputProps {
  label: string;
  description?: string;
}

export const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ label, description, ...inputProps }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isActive = isFocused || isHovered;

    return (
      <motion.div
        className={`${styles.outer} ${isActive ? styles.active : ''} ${isFocused ? styles.focused : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.wrapper}>
          <div className={styles.labelSection}>
            <div className={styles.label}>{label}</div>
            {description && <div className={styles.description}>{description}</div>}
          </div>

          <div className={styles.inputSection}>
            <input
              ref={ref}
              className={styles.input}
              disabled={inputProps.disabled}
              onFocus={(e) => {
                setIsFocused(true);
                inputProps.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                inputProps.onBlur?.(e);
              }}
              {...inputProps}
            />
            {inputProps.icon && <span className={styles.icon}>{inputProps.icon}</span>}
          </div>
        </div>

        {isActive && <div className={styles.connectedHalftone} />}
      </motion.div>
    );
  },
);

InputWithLabel.displayName = 'InputWithLabel';
