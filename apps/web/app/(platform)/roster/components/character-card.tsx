'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, BadgeVariant, Icon, Button } from '@hool/design-system';
import { progressApi } from '../../../lib/api';
import cardStyles from './character-card.module.css';

// Map WoW class display names to Badge variant keys
const CLASS_TO_VARIANT: Record<string, BadgeVariant> = {
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

// Class colors for accent elements (progress bars, highlights)
const CLASS_COLORS: Record<string, string> = {
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

function getBustUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url
    .replace('/main-raw.jpg', '/avatar.jpg')
    .replace('/main-raw.png', '/avatar.png')
    .replace('/main.jpg', '/avatar.jpg')
    .replace('/main.png', '/avatar.png');
}

interface VaultSlotData {
  unlocked: boolean;
  ilvl: number;
}

interface CharacterCardProps {
  characterId: number;
  characterName: string;
  realm: string;
  avatarUrl?: string;
  className: string;
  spec: string;
  role: 'Tank' | 'Healer' | 'DPS';
  currentIlvl: number | null;
  mythicPlusScore?: number | null;
  raidProgress?: any;
  targetIlvl?: number;
  weeklyTasksCompleted?: number;
  weeklyTasksTotal?: number;
  vaultSlots?: {
    raid: VaultSlotData[];
    dungeon: VaultSlotData[];
    world: VaultSlotData[];
  };
  crests?: {
    weathered: number;
    carved: number;
    runed: number;
    gilded: number;
  };
  crestsCumulative?: {
    weathered: number;
    carved: number;
    runed: number;
    gilded: number;
  };
  crestCap?: number;
  lastSynced?: string | null;
  onDelete?: () => void;
}

function getDaysUntilReset(): number {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const tuesday = 2;
  let daysUntil = tuesday - dayOfWeek;
  if (daysUntil <= 0) daysUntil += 7;
  return daysUntil;
}

function hexToRgba(hex: string, alpha: number): string {
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

const EMPTY_SLOTS: VaultSlotData[] = [
  { unlocked: false, ilvl: 0 },
  { unlocked: false, ilvl: 0 },
  { unlocked: false, ilvl: 0 },
];

export function CharacterCard({
  characterId,
  characterName,
  realm,
  avatarUrl,
  className,
  spec,
  role,
  currentIlvl,
  mythicPlusScore,
  raidProgress,
  targetIlvl = 0,
  weeklyTasksCompleted = 0,
  weeklyTasksTotal = 6,
  vaultSlots,
  crests = { weathered: 0, carved: 0, runed: 0, gilded: 0 },
  crestsCumulative,
  crestCap: crestCapRaw = 0,
  lastSynced,
  onDelete,
}: CharacterCardProps) {
  const router = useRouter();
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const crestCap = Math.max(crestCapRaw, 100);
  const variant = CLASS_TO_VARIANT[className] || 'primary';
  const classColor = CLASS_COLORS[className] || '#FFFFFF';
  const safeIlvl = currentIlvl ?? 0;
  const ilvlDelta = safeIlvl - targetIlvl;
  const isDeltaPositive = ilvlDelta >= 0;
  const weeklyProgressPercent = weeklyTasksTotal > 0 ? (weeklyTasksCompleted / weeklyTasksTotal) * 100 : 0;
  const daysUntilReset = getDaysUntilReset();

  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => setDeleteError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  const handleCardClick = () => {
    router.push(
      `/roster/${encodeURIComponent(characterName)}?realm=${encodeURIComponent(realm)}`
    );
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteOverlay(true);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteOverlay(false);
  };

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await progressApi.delete(`/users/me/characters/${characterId}`);
      setShowDeleteOverlay(false);
      onDelete?.();
    } catch (err: any) {
      console.error('Failed to delete character:', err);
      if (err?.response?.status === 403) {
        setDeleteError('You do not have permission to delete this character');
      } else if (err?.response?.status === 404) {
        setDeleteError('Character not found');
      } else if (err?.message) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete character. Please try again.');
      }
      setShowDeleteOverlay(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);
    try {
      await progressApi.post(`/users/me/characters/${characterId}/gear/sync`);
      onDelete?.(); // reuse the refresh callback
    } catch (err: any) {
      console.error('Failed to sync character:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={cardStyles.cardWrapper} style={{ position: 'relative', paddingTop: '32px' }}>
      {/* Avatar — positioned to overlap the card border */}
      <Avatar
        src={getBustUrl(avatarUrl)}
        fallback={characterName.substring(0, 2).toUpperCase()}
        alt={characterName}
        size="lg"
        className={cardStyles.cardAvatar}
        style={{ position: 'absolute', top: 0, left: '16px', zIndex: 10 }}
        objectPosition="50% 12%"
        enableOverflow={true}
      />

      <Badge
        variant={variant}
        size="md"
        className={cardStyles.cardBadge}
        style={{ '--badge-width': '370px', '--badge-height': 'auto' } as React.CSSProperties}
        onClick={handleCardClick}
      >
        {/* Action buttons (top-right) */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5, display: 'flex', gap: '6px' }}>
          <Button
            variant="blue"
            size="sm"
            icon={<Icon name="refresh" size={14} animation="spin" />}
            onClick={handleSync}
            disabled={isSyncing}
            aria-label="Sync character"
          />
          <Button
            variant="destructive"
            size="sm"
            icon={<Icon name="trash" size={14} animation="shake" />}
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(e); }}
            aria-label="Delete character"
          />
        </div>

        {/* Top margin to clear the overlapping avatar */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', }}>
            {characterName}
          </h3>
          <p style={{ fontSize: '12px', color: '#fff', margin: '0 0 4px 0' }}>
            {spec} · {realm}
          </p>
          <p style={{ fontSize: '10px', color: '#fff', margin: '0 0 12px 0' }}>
            {lastSynced ? `Synced ${formatRelativeTime(lastSynced)}` : 'Never synced'}
          </p>
        </div>

        {/* ilvl Section */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', }}>
            {currentIlvl != null ? currentIlvl.toFixed(1) : '—'}
          </span>
          {currentIlvl != null && targetIlvl > 0 && (
            <span style={{
              fontSize: '14px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
              color: isDeltaPositive ? '#22c55e' : '#ef4444',
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}>
              {isDeltaPositive ? '+' : ''}{ilvlDelta.toFixed(1)}
            </span>
          )}
          <span style={{ fontSize: '12px', color: '#fff', marginLeft: 'auto' }}>
            Resets in {daysUntilReset}d
          </span>
        </div>

        {/* Raider.IO M+ and Raid Progression */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {mythicPlusScore != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Icon name="swords" size={12} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{mythicPlusScore.toFixed(0)}</span>
              <span style={{ fontSize: '10px', color: '#fff' }}>M+</span>
            </div>
          )}
          
          {raidProgress && raidProgress['nerubar-palace'] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Icon name="skull" size={12} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{raidProgress['nerubar-palace'].summary}</span>
            </div>
          )}
        </div>

        {/* Weekly Progress */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Weekly Tasks
              {weeklyTasksTotal > 0 && weeklyTasksCompleted >= weeklyTasksTotal && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '16px', height: '16px', borderRadius: '9999px',
                  backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(34,197,94,0.4)',
                }}>
                  <Icon name="check" size={10} style={{ color: '#22c55e' }} />
                </span>
              )}
            </span>
            <span style={{
              fontSize: '12px', fontWeight: 700,
              color: weeklyTasksTotal > 0 && weeklyTasksCompleted >= weeklyTasksTotal ? '#22c55e' : '#fff',
              ...(weeklyTasksTotal > 0 && weeklyTasksCompleted >= weeklyTasksTotal ? {
                padding: '1px 6px', borderRadius: '4px',
                backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(34,197,94,0.3)',
              } : {}),
            }}>{weeklyTasksCompleted}/{weeklyTasksTotal}</span>
          </div>
          <div style={{ height: '8px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', width: `${weeklyProgressPercent}%`, borderRadius: '9999px',
              background: `linear-gradient(90deg, ${hexToRgba(classColor, 0.6)} 0%, ${classColor} 100%)`,
              transition: 'width 0.5s ease-out',
            }} />
          </div>
        </div>

        {/* Great Vault — per-slot ilvl */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Great Vault</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Raid', slots: vaultSlots?.raid ?? EMPTY_SLOTS },
              { label: 'M+', slots: vaultSlots?.dungeon ?? EMPTY_SLOTS },
              { label: 'World', slots: vaultSlots?.world ?? EMPTY_SLOTS },
            ].map(({ label, slots }) => (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 1fr 1fr', gap: '4px', alignItems: 'center',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>{label}</div>
                {slots.slice(0, 3).map((slot, i) => (
                  <div key={i} style={{
                    textAlign: 'center', padding: '5px 2px', borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{
                      fontSize: '12px', fontWeight: slot.unlocked ? 700 : 400,
                      color: slot.unlocked ? '#fff' : 'rgba(255,255,255,0.25)',
                    }}>
                      {slot.unlocked ? slot.ilvl : '\u2014'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Crests */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>Crests</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
            {[
              { label: 'Wth', value: crests.weathered, cumulative: crestsCumulative?.weathered ?? 0, color: 'rgba(148,163,184,', textColor: '#94a3b8' },
              { label: 'Crv', value: crests.carved, cumulative: crestsCumulative?.carved ?? 0, color: 'rgba(34,197,94,', textColor: '#4ade80' },
              { label: 'Run', value: crests.runed, cumulative: crestsCumulative?.runed ?? 0, color: 'rgba(99,102,241,', textColor: '#818cf8' },
              { label: 'Gld', value: crests.gilded, cumulative: crestsCumulative?.gilded ?? 0, color: 'rgba(234,179,8,', textColor: '#facc15' },
            ].map(({ label, value, cumulative, color, textColor }) => (
              <div key={label} style={{
                textAlign: 'center', padding: '6px 4px', borderRadius: '6px',
                backgroundColor: value > 0 ? `${color}0.2)` : 'rgba(0,0,0,0.35)',
                border: `1px solid ${value > 0 ? `${color}0.35)` : 'rgba(255,255,255,0.08)'}`,
              }}>
                <div style={{ fontSize: '8px', color: '#fff', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: value > 0 ? textColor : 'rgba(255,255,255,0.3)' }}>
                  {value > 0 ? value : '\u2014'}
                </div>
                <div style={{ fontSize: '9px', color: '#fff', marginTop: '2px' }}>
                  {cumulative}/{crestCap}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Badge>

      {/* Delete Confirmation Popover */}
      {showDeleteOverlay && (
        <div
          style={{
            position: 'absolute', top: '44px', right: '12px',
            backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 16px', zIndex: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ fontSize: '13px', color: '#fff', textAlign: 'center', margin: 0, whiteSpace: 'nowrap' }}>
            Delete <span style={{ color: classColor }}>{characterName}</span>?
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Delete Error */}
      {deleteError && (
        <div style={{ marginTop: '12px' }}>
          <div style={{
            padding: '8px', borderRadius: '6px',
            backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '12px',
          }}>
            {deleteError}
          </div>
        </div>
      )}
    </div>
  );
}
