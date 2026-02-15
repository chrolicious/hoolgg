'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Icon } from './Icon';
import styles from './InputWithLabel.module.css';
import arrowStyles from './InputWithArrows.module.css';

export interface InputWithArrowsProps {
  label: string;
  description?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const InputWithArrows = React.forwardRef<HTMLDivElement, InputWithArrowsProps>(
  ({ label, description, options, value, onChange, disabled = false }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    const currentIndex = value ? options.indexOf(value) : 0;
    const currentValue = options[currentIndex] || options[0];

    const handlePrevious = () => {
      if (disabled) return;
      setDirection('left');
      const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange?.(options[newIndex]);
    };

    const handleNext = () => {
      if (disabled) return;
      setDirection('right');
      const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange?.(options[newIndex]);
    };

    return (
      <motion.div
        ref={ref}
        className={`${styles.outer} ${isHovered ? styles.active : ''} ${disabled ? arrowStyles.disabled : ''}`}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.wrapper}>
          <div className={styles.labelSection}>
            <div className={styles.label}>{label}</div>
            {description && <div className={styles.description}>{description}</div>}
          </div>

          <div className={`${styles.inputSection} ${arrowStyles.arrowSection}`}>
            <button
              type="button"
              className={arrowStyles.arrowButton}
              onClick={handlePrevious}
              disabled={disabled}
              aria-label="Previous option"
            >
              <Icon name="chevron-left" animation="none" />
            </button>

            <motion.div
              key={currentValue}
              className={arrowStyles.valueDisplay}
              initial={
                direction
                  ? {
                      x: direction === 'left' ? 20 : -20,
                      opacity: 0,
                    }
                  : false
              }
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {currentValue}
            </motion.div>

            <button
              type="button"
              className={arrowStyles.arrowButton}
              onClick={handleNext}
              disabled={disabled}
              aria-label="Next option"
            >
              <Icon name="chevron-right" animation="none" />
            </button>
          </div>
        </div>

        {isHovered && <div className={styles.connectedHalftone} />}
      </motion.div>
    );
  },
);

InputWithArrows.displayName = 'InputWithArrows';
