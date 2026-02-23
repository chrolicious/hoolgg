'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { spring } from '../../tokens/animations';
import styles from './Select.module.css';
import { variantVars, type ButtonVariant, iconSizes } from './Button.shared';
import { Icon } from './Icon';

export type SelectVariant = ButtonVariant;
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select option',
      variant = 'primary',
      size = 'md',
      disabled = false,
      label,
      className,
      style,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isSoft = variant.endsWith('-soft');

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        {label && <label className={styles.label}>{label}</label>}

        <div
          ref={containerRef}
          className={styles.container}
        >
          {/* Trigger button */}
          <motion.button
            className={`${styles.trigger} ${styles[size]}${isSoft ? ` ${styles.soft}` : ''}${disabled ? ` ${styles.disabled}` : ''}${isOpen ? ` ${styles.open}` : ''}`}
            style={{ ...variantVars[variant], ...style } as React.CSSProperties}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            whileHover={disabled ? undefined : { y: -1 }}
            transition={{ type: 'spring', ...spring.snappy }}
            disabled={disabled}
            type="button"
            aria-expanded={isOpen}
          >
            <span className={styles.outline}>
              <span className={styles.darkLayer}>
                <span className={styles.inside}>
                  <span className={styles.content}>{displayText}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name="chevron-down" size={iconSizes[size]} animation="none" />
                  </motion.div>
                </span>
              </span>
            </span>
          </motion.button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className={styles.menu}
                style={variantVars[variant] as React.CSSProperties}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {options.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.menuItem}${value === option.value ? ` ${styles.selected}` : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

Select.displayName = 'Select';
