'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import React, { useState } from 'react';
import { spring } from '../../tokens/animations';
import styles from './Button.module.css';
import {
  variantVars,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
  iconSizes,
  BouncyContent,
  buildClassName,
} from './Button.shared';

export type { ButtonVariant, ButtonSize, ButtonShape };

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  selected?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'default',
      loading = false,
      selected = false,
      icon,
      iconRight,
      children,
      disabled,
      fullWidth = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isSoft = variant.endsWith('-soft');
    const isIconOnly = !children && (!!icon || !!iconRight);
    const [isHovered, setIsHovered] = useState(false);

    const button = (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { y: -1 }}
        onHoverStart={() => !isDisabled && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', ...spring.snappy }}
        className={buildClassName({ size, shape, isSoft, selected, isIconOnly, fullWidth, className })}
        style={{
          ...variantVars[variant],
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        <span className={styles.outline}>
          <span className={styles.darkLayer}>
            <span className={styles.inside}>
              <BouncyContent
                isHovered={isHovered}
                icon={icon}
                iconRight={iconRight}
                loading={loading}
                iconSize={iconSizes[size]}
              >
                {children}
              </BouncyContent>
            </span>
          </span>
        </span>
      </motion.button>
    );

    if (fullWidth) {
      return <div className={styles.fullWidthWrapper}>{button}</div>;
    }

    return button;
  },
);

Button.displayName = 'Button';
