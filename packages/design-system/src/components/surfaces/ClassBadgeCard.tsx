import React from 'react';
import { motion } from 'framer-motion';
import styles from './ClassBadgeCard.module.css';

export interface ClassBadgeCardProps {
  /**
   * WoW class name (e.g., "Mage", "Warrior", "Druid")
   */
  className: string;

  /**
   * Class color in hex format (e.g., "#3FC7EB" for Mage)
   */
  classColor: string;

  /**
   * Content to render inside the card
   */
  children: React.ReactNode;

  /**
   * Whether the card should be clickable
   */
  clickable?: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Whether to show the class badge at the top
   * @default true
   */
  showClassBadge?: boolean;

  /**
   * Additional CSS class names
   */
  additionalClassName?: string;
}

/**
 * WoW Class Colors (official Blizzard palette)
 */
export const WOW_CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7C0A',
  'Evoker': '#33937F',
  'Hunter': '#AAD372',
  'Mage': '#3FC7EB',
  'Monk': '#00FF98',
  'Paladin': '#F48CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF468',
  'Shaman': '#0070DD',
  'Warlock': '#8788EE',
  'Warrior': '#C69B6D',
};

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * ClassBadgeCard - A card component styled with WoW class colors
 *
 * Features class-colored gradients, borders, shadows, and an optional class badge.
 * Perfect for displaying character information or any class-related content.
 */
export function ClassBadgeCard({
  className,
  classColor,
  children,
  clickable = false,
  onClick,
  showClassBadge = true,
  additionalClassName = '',
}: ClassBadgeCardProps) {
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${rgba(classColor, 0.1)} 0%, ${rgba(classColor, 0.03)} 100%)`,
    border: `1px solid ${rgba(classColor, 0.25)}`,
    boxShadow: `0 0 20px ${rgba(classColor, 0.08)}`,
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: rgba(classColor, 0.15),
    color: classColor,
    border: `1px solid ${rgba(classColor, 0.3)}`,
    boxShadow: `0 0 10px ${rgba(classColor, 0.12)}`,
  };

  const content = (
    <>
      {showClassBadge && (
        <div className={styles.classBadge} style={badgeStyle}>
          {className}
        </div>
      )}
      {children}
    </>
  );

  if (clickable) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`${styles.card} ${styles.clickable} ${additionalClassName}`}
        style={cardStyle}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className={`${styles.card} ${additionalClassName}`}
      style={cardStyle}
    >
      {content}
    </div>
  );
}

/**
 * Helper function to get class color from class name
 */
export function getClassColor(className: string): string {
  return WOW_CLASS_COLORS[className] || '#FFFFFF';
}
