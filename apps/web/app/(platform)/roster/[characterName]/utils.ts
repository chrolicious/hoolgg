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

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

export function getDaysUntilReset(): number {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const tuesday = 2;
  let daysUntil = tuesday - dayOfWeek;
  if (daysUntil <= 0) daysUntil += 7;
  return daysUntil;
}
