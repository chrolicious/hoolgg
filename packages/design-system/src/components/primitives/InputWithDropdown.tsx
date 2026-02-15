'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import styles from './InputWithLabel.module.css';
import dropdownStyles from './InputWithDropdown.module.css';

export interface InputWithDropdownProps {
  label: string;
  description?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const InputWithDropdown = React.forwardRef<HTMLDivElement, InputWithDropdownProps>(
  ({ label, description, options, value, onChange, placeholder = 'Select...', disabled = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isActive = isOpen || isHovered;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleSelect = (option: string) => {
      onChange?.(option);
      setIsOpen(false);
      setIsHovered(false);
    };

    return (
      <motion.div
        ref={containerRef}
        className={`${styles.outer} ${isActive ? styles.active : ''} ${isOpen ? styles.focused : ''} ${disabled ? dropdownStyles.disabled : ''}`}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.wrapper}>
          <div className={styles.labelSection}>
            <div className={styles.label}>{label}</div>
            {description && <div className={styles.description}>{description}</div>}
          </div>

          <button
            type="button"
            className={`${styles.inputSection} ${dropdownStyles.trigger}`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={`${dropdownStyles.valueDisplay} ${value ? dropdownStyles.hasValue : ''}`}>
              {value || placeholder}
            </span>
            <motion.span
              className={dropdownStyles.chevron}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="chevron-down" animation="none" />
            </motion.span>
          </button>
        </div>

        {isActive && <div className={styles.connectedHalftone} />}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={dropdownStyles.menu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${dropdownStyles.menuItem} ${value === option ? dropdownStyles.selected : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                  {value === option && (
                    <Icon name="check" animation="none" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

InputWithDropdown.displayName = 'InputWithDropdown';
