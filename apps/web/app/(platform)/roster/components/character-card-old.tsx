'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Icon, Button } from '@hool/design-system';
import { progressApi } from '../../../../../lib/api';

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
  /** Character ID for deletion */
  characterId: number;
  /** Character name (unique identifier) */
  characterName: string;
  /** Character realm */
  realm: string;
  /** WoW class name (for color coding) */
  className: string;
  /** Specialization name (e.g., "Havoc", "Restoration") */
  spec: string;
  /** Role (Tank, Healer, DPS) */
  role: 'Tank' | 'Healer' | 'DPS';
  /** Current item level */
  currentIlvl: number;
  /** Progress status (ahead, behind, or unknown) */
  status: 'ahead' | 'behind' | 'unknown';
  /** Callback when character is deleted */
  onDelete?: () => void;
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
  characterId,
  characterName,
  realm,
  className,
  spec,
  role,
  currentIlvl,
  status,
  onDelete,
}: CharacterCardProps) {
  const router = useRouter();
  const classColor = CLASS_COLORS[className] || '#FFFFFF';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setDeleteError(null);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await progressApi.delete(`/guilds/${guildId}/characters/${characterId}`);
      // Success - trigger parent refresh
      onDelete?.();
    } catch (err: any) {
      console.error('Failed to delete character:', err);

      // Show error but don't exit confirmation mode
      if (err?.response?.status === 403) {
        setDeleteError('Permission denied');
      } else if (err?.response?.status === 404) {
        setDeleteError('Character not found');
      } else {
        setDeleteError('Delete failed');
      }

      setIsDeleting(false);
      // Auto-hide error after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
        setShowDeleteConfirm(false);
      }, 3000);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  return (
    <Card padding="md" variant="elevated" interactive>
      <div className="relative">
        {/* Delete error */}
        {deleteError && (
          <div className="absolute top-0 left-0 right-0 -mt-2 z-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 rounded bg-red-600/90 text-white text-xs text-center"
            >
              {deleteError}
            </motion.div>
          </div>
        )}

        {/* Delete button */}
        <div className="absolute top-0 right-0 z-10">
          <AnimatePresence mode="wait">
            {showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-1"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 rounded bg-red-600 hover:bg-red-700 border-none cursor-pointer disabled:opacity-50"
                  aria-label="Confirm delete"
                >
                  <Icon name="check" size={14} className="text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 border-none cursor-pointer disabled:opacity-50"
                  aria-label="Cancel delete"
                >
                  <Icon name="x" size={14} className="text-white" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-1.5 rounded bg-white/5 hover:bg-red-600/20 border-none cursor-pointer"
                aria-label="Delete character"
              >
                <Icon name="trash-2" size={14} className="text-white/50 hover:text-red-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="w-full bg-transparent border-none cursor-pointer p-0 text-left flex flex-col gap-3"
          onClick={() =>
            router.push(
              `/guilds/${guildId}/roster/${encodeURIComponent(characterName)}?realm=${encodeURIComponent(realm)}`
            )
          }
          aria-label={`View details for ${characterName}`}
        >
          {/* Header: Character name + Status icon */}
          <div className="flex items-center justify-between pr-8">
          <h3 className="m-0 font-bold text-base" style={{ color: classColor }}>
            {characterName}
          </h3>
          <Icon
            name={
              status === 'ahead'
                ? 'check'
                : status === 'behind'
                  ? 'alert-circle'
                  : 'help-circle'
            }
            size={18}
            className={
              status === 'ahead'
                ? 'text-green-400'
                : status === 'behind'
                  ? 'text-yellow-400'
                  : 'text-white/30'
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
      </div>
    </Card>
  );
}
