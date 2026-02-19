'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Icon } from '@hool/design-system';

// WoW class colors from official Blizzard palette
const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  Druid: '#FF7C0A',
  Evoker: '#33937F',
  Hunter: '#AAD372',
  Mage: '#3FC7EB',
  Monk: '#00FF98',
  Paladin: '#F48CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF468',
  Shaman: '#0070DD',
  Warlock: '#8788EE',
  Warrior: '#C69B6D',
};

interface CharacterCardProps {
  /** Guild ID for navigation */
  guildId: string;
  /** Character name (unique identifier) */
  characterName: string;
  /** WoW class name (for color coding) */
  className: string;
  /** Specialization name (e.g., "Havoc", "Restoration") */
  spec: string;
  /** Role (Tank, Healer, DPS) */
  role: 'Tank' | 'Healer' | 'DPS';
  /** Current item level */
  currentIlvl: number;
  /** Progress status (ahead or behind) */
  status: 'ahead' | 'behind';
}

/**
 * CharacterCard — Displays character summary with class-specific styling
 *
 * Shows character name (in class color), spec, role, ilvl, and progress status.
 * Entire card is clickable and navigates to character detail page.
 *
 * Usage:
 * ```tsx
 * <CharacterCard
 *   guildId="123"
 *   characterName="Arthas"
 *   className="Paladin"
 *   spec="Retribution"
 *   role="DPS"
 *   currentIlvl={480}
 *   status="ahead"
 * />
 * ```
 */
export function CharacterCard({
  guildId,
  characterName,
  className,
  spec,
  role,
  currentIlvl,
  status,
}: CharacterCardProps) {
  const router = useRouter();
  const classColor = CLASS_COLORS[className] || '#FFFFFF';

  return (
    <Card padding="md" variant="elevated" interactive>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full bg-transparent border-none cursor-pointer p-0 text-left flex flex-col gap-3"
        onClick={() =>
          router.push(
            `/guilds/${guildId}/roster/${encodeURIComponent(characterName)}`
          )
        }
        aria-label={`View details for ${characterName}`}
      >
        {/* Header: Character name + Status icon */}
        <div className="flex items-center justify-between">
          <h3 className="m-0 font-bold text-base" style={{ color: classColor }}>
            {characterName}
          </h3>
          <Icon
            name={status === 'ahead' ? 'check' : 'alert-circle'}
            size={18}
            className={
              status === 'ahead' ? 'text-green-400' : 'text-yellow-400'
            }
          />
        </div>

        {/* Spec, Class, Role */}
        <div className="flex flex-col gap-1">
          <p className="m-0 text-sm text-white/60">
            {spec} • {className}
          </p>
          <p className="m-0 text-sm text-white/50">{role}</p>
        </div>

        {/* Current ilvl */}
        <div className="flex items-center gap-1.5 text-white/70">
          <Icon name="zap" size={14} />
          <span className="text-sm font-medium">{currentIlvl} ilvl</span>
        </div>
      </motion.button>
    </Card>
  );
}
