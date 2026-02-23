'use client';

import { useState, useEffect } from 'react';
import { Avatar, Badge, Button, Icon } from '@hool/design-system';
import { progressApi } from '../../../../lib/api';
import type {
  CharacterRoster,
  GearResponse,
  VaultResponse,
  CrestsResponse,
  TasksResponse,
  SeasonResponse,
} from '../types';
import {
  CLASS_COLORS,
  CLASS_TO_VARIANT,
  hexToRgba,
  formatRelativeTime,
  getBustUrl,
} from '../utils';

interface CharacterHeaderProps {
  character: CharacterRoster;
  gearData: GearResponse | null;
  vaultData: VaultResponse | null;
  crestsData: CrestsResponse | null;
  tasksData: TasksResponse | null;
  seasonData: SeasonResponse | null;
  onSync: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export function CharacterHeader({
  character,
  gearData,
  vaultData,
  crestsData,
  tasksData,
  seasonData,
  onSync,
  onDelete,
  onRefresh,
}: CharacterHeaderProps) {
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const variant = CLASS_TO_VARIANT[character.class_name ?? ''] || 'primary';
  const classColor = CLASS_COLORS[character.class_name ?? ''] || '#FFFFFF';

  // ---- Key calculations ----
  const weeklyTasksCompleted = tasksData?.weekly.filter((t) => t.done).length ?? 0;
  const weeklyTasksTotal = tasksData?.weekly.length ?? 0;
  const weeklyProgressPercent =
    weeklyTasksTotal > 0 ? (weeklyTasksCompleted / weeklyTasksTotal) * 100 : 0;

  const targetIlvl = seasonData?.current_target_ilvl ?? 0;
  const safeIlvl = character.current_ilvl ?? 0;
  const ilvlDelta = safeIlvl - targetIlvl;
  const isDeltaPositive = ilvlDelta >= 0;

  // Crests: current week collected per type
  const crestWeathered = crestsData?.crests?.Weathered?.current_week?.collected ?? 0;
  const crestCarved = crestsData?.crests?.Carved?.current_week?.collected ?? 0;
  const crestRuned = crestsData?.crests?.Runed?.current_week?.collected ?? 0;
  const crestGilded = crestsData?.crests?.Gilded?.current_week?.collected ?? 0;

  // Crests: cumulative totals across all weeks
  const crestWeatheredTotal = crestsData?.crests?.Weathered?.total_collected ?? 0;
  const crestCarvedTotal = crestsData?.crests?.Carved?.total_collected ?? 0;
  const crestRunedTotal = crestsData?.crests?.Runed?.total_collected ?? 0;
  const crestGildedTotal = crestsData?.crests?.Gilded?.total_collected ?? 0;
  // Cumulative cap: 100 per season week, computed from week number
  const headerWeek = seasonData?.current_week ?? 0;
  const cumulativeCap = 100 * Math.max(headerWeek, 1);

  // ---- Error auto-dismiss ----
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => setDeleteError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  // ---- Handlers ----
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await progressApi.post(`/users/me/characters/${character.id}/gear/sync`);
      onSync();
    } catch (err: any) {
      console.error('Failed to sync character:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteOverlay(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteOverlay(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await progressApi.delete(`/users/me/characters/${character.id}`);
      setShowDeleteOverlay(false);
      onDelete();
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

  return (
    <div style={{ position: 'relative' }}>
      <Badge
        variant={variant}
        size="md"
        orientation="horizontal"
        style={{ '--badge-width': '100%', '--badge-height': 'auto' } as React.CSSProperties}
      >
        {/* Top-right action buttons */}
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
            onClick={handleDeleteClick}
            aria-label="Delete character"
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '140px' }}>
            <Avatar
              src={character.avatar_url ?? undefined}
              fallback={character.character_name.substring(0, 2).toUpperCase()}
              alt={character.character_name}
              size="xl"
              objectPosition="50% 12%"
              enableOverflow={true}
            />

            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '8px 0 4px 0', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {character.character_name}
            </h2>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 4px 0' }}>
              {character.spec ?? 'Unknown'} &middot; {character.realm}
            </p>

            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '0 0 12px 0' }}>
              Synced {formatRelativeTime(gearData?.last_gear_sync)}
            </p>

            {/* ilvl display — pushed to bottom of left column */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {character.current_ilvl != null ? character.current_ilvl.toFixed(1) : '\u2014'}
                </span>
                {character.current_ilvl != null && targetIlvl > 0 && (
                  <span style={{
                    fontSize: '14px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                    color: isDeltaPositive ? '#22c55e' : '#ef4444',
                    backgroundColor: 'rgba(0,0,0,0.45)',
                  }}>
                    {isDeltaPositive ? '+' : ''}{ilvlDelta.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-end', gap: '12px', marginTop: '44px' }}>
            {/* Weekly progress bar */}
            <div 
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => {
                document.getElementById('section-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Weekly Tasks</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {weeklyTasksCompleted}/{weeklyTasksTotal}
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{
                  height: '100%',
                  width: `${weeklyProgressPercent}%`,
                  borderRadius: '9999px',
                  background: `linear-gradient(90deg, ${hexToRgba(classColor, 0.6)} 0%, ${classColor} 100%)`,
                  transition: 'width 0.5s ease-out',
                }} />
              </div>
            </div>

            {/* Great Vault — per-slot ilvl */}
            <div 
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => {
                document.getElementById('section-vault-crests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Great Vault</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Raid', slots: vaultData?.calculated_slots?.raid_slots ?? [] },
                  { label: 'M+', slots: vaultData?.calculated_slots?.dungeon_slots ?? [] },
                  { label: 'World', slots: vaultData?.calculated_slots?.world_slots ?? [] },
                ].map(({ label, slots }) => (
                  <div key={label} style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr 1fr 1fr', gap: '4px', alignItems: 'center',
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{label}</div>
                    {Array.from({ length: 3 }, (_, i) => {
                      const slot = slots[i];
                      const unlocked = slot?.unlocked ?? false;
                      const ilvl = slot?.ilvl ?? 0;
                      return (
                        <div key={i} style={{
                          textAlign: 'center', padding: '5px 2px', borderRadius: '4px',
                          backgroundColor: 'rgba(0,0,0,0.35)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <div style={{
                            fontSize: '12px', fontWeight: unlocked ? 700 : 400,
                            color: unlocked ? '#fff' : 'rgba(255,255,255,0.25)',
                          }}>
                            {unlocked ? ilvl : '\u2014'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Crests summary */}
            <div 
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => {
                document.getElementById('section-vault-crests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Crests</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Wth', value: crestWeathered, total: crestWeatheredTotal, color: 'rgba(148,163,184,', textColor: '#94a3b8' },
                  { label: 'Crv', value: crestCarved, total: crestCarvedTotal, color: 'rgba(34,197,94,', textColor: '#4ade80' },
                  { label: 'Run', value: crestRuned, total: crestRunedTotal, color: 'rgba(99,102,241,', textColor: '#818cf8' },
                  { label: 'Gld', value: crestGilded, total: crestGildedTotal, color: 'rgba(234,179,8,', textColor: '#facc15' },
                ].map(({ label, value, total, color, textColor }) => (
                  <div key={label} style={{
                    textAlign: 'center', padding: '6px 4px', borderRadius: '6px',
                    backgroundColor: value > 0 ? `${color}0.2)` : 'rgba(0,0,0,0.35)',
                    border: `1px solid ${value > 0 ? `${color}0.35)` : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: value > 0 ? textColor : 'rgba(255,255,255,0.3)' }}>
                      {value > 0 ? value : '\u2014'}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                      {total}/{cumulativeCap}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Badge>

      {/* Delete Confirmation Overlay */}
      {showDeleteOverlay && (
        <div
          style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10, borderRadius: '4px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', margin: 0 }}>
              Delete <span style={{ color: classColor }}>{character.character_name}</span>?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDeleteCancel} disabled={isDeleting}>
                Cancel
              </Button>
            </div>
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
