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

export interface LinkButtonProps
  extends Omit<HTMLMotionProps<'a'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  selected?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'default',
      selected = false,
      icon,
      iconRight,
      children,
      fullWidth = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const isSoft = variant.endsWith('-soft');
    const isIconOnly = !children && (!!icon || !!iconRight);
    const [isHovered, setIsHovered] = useState(false);

    const link = (
      <motion.a
        ref={ref}
        whileHover={{ y: -1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', ...spring.snappy }}
        className={buildClassName({ size, shape, isSoft, selected, isIconOnly, fullWidth, className })}
        style={{
          ...variantVars[variant],
          textDecoration: 'none',
          display: 'inline-block',
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
                loading={false}
                iconSize={iconSizes[size]}
              >
                {children}
              </BouncyContent>
            </span>
          </span>
        </span>
      </motion.a>
    );

    if (fullWidth) {
      return <div className={styles.fullWidthWrapper}>{link}</div>;
    }

    return link;
  },
);

LinkButton.displayName = 'LinkButton';
