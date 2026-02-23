import type { CSSProperties } from 'react';
import type { BadgeVariant } from '@hool/design-system';

// WoW class colors from official Blizzard palette
export const CLASS_COLORS: Record<string, string> = {
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

// Map WoW class display names to Badge variant keys
export const CLASS_TO_VARIANT: Record<string, BadgeVariant> = {
  'Death Knight': 'deathknight',
  'Demon Hunter': 'demonhunter',
  'Druid': 'druid',
  'Evoker': 'evoker',
  'Hunter': 'hunter',
  'Mage': 'mage',
  'Monk': 'monk',
  'Paladin': 'paladin',
  'Priest': 'priest',
  'Rogue': 'rogue',
  'Shaman': 'shaman',
  'Warlock': 'warlock',
  'Warrior': 'warrior',
};

export function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a1a' : '#FFFFFF';
}

export function lightenHex(hex: string, amount = 20): string {
  const clean = hex.replace('#', '');
  const r = Math.min(255, parseInt(clean.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(clean.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(clean.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Build a complete Button style override using the character's class color.
 * Sets all CSS variables including the halftone overlay vars so hover
 * renders in the class color instead of the default gold.
 */
export function buildBtnStyle(classColor: string): CSSProperties {
  const hoverBg = lightenHex(classColor);
  const textColor = getContrastColor(classColor);
  return {
    '--btn-bg': classColor,
    '--btn-color': textColor,
    '--btn-hover-bg': hoverBg,
    '--btn-hover-bg-fade': hexToRgba(hoverBg, 0.9),
    '--btn-dot-color': textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
    '--btn-hover-color': getContrastColor(hoverBg),
  } as CSSProperties;
}

/**
 * Build a soft Button style override (e.g. primary-soft) that keeps the
 * cream default background but changes hover to the class color.
 */
export function buildSoftBtnStyle(classColor: string): CSSProperties {
  const textColor = getContrastColor(classColor);
  return {
    '--btn-hover-bg': classColor,
    '--btn-hover-bg-fade': hexToRgba(classColor, 0.9),
    '--btn-dot-color': textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
    '--btn-hover-color': textColor,
  } as CSSProperties;
}

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Never synced';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Derive the small bust portrait (avatar.jpg) from any Blizzard render URL.
 * After the backend stores main-raw.jpg, Avatar components use this to get
 * the appropriate small circular portrait.
 */
export function getBustUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace('/main-raw.jpg', '/avatar.jpg')
    .replace('/main-raw.png', '/avatar.png')
    .replace('/main.jpg', '/avatar.jpg')
    .replace('/main.png', '/avatar.png');
}

export function getDaysUntilReset(): number {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const tuesday = 2;
  let daysUntil = tuesday - dayOfWeek;
  if (daysUntil <= 0) daysUntil += 7;
  return daysUntil;
}
