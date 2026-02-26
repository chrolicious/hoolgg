'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Icon, Button, Checkbox } from '@hool/design-system';
import { progressApi, ApiError } from '../../../lib/api';
import cardStyles from './character-card.module.css';

interface BnetCharacter {
  name: string;
  realm: string;
  level: number;
  playable_class: string;
  playable_race: string;
  faction: string;
}

interface AddCharacterCardProps {
  onCharacterAdded: () => void;
  existingCharacters?: Array<{ character_name: string; realm: string }>;
}

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

function getRegion(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith('Europe/') || tz.startsWith('Africa/')) return 'eu';
    if (tz.startsWith('Asia/Seoul') || tz === 'Asia/Seoul') return 'kr';
    if (tz.startsWith('Asia/Taipei') || tz === 'Asia/Taipei') return 'tw';
    return 'us';
  } catch {
    return 'us';
  }
}

export function AddCharacterCard({ onCharacterAdded, existingCharacters = [] }: AddCharacterCardProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingNames, setSyncingNames] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [bnetCharacters, setBnetCharacters] = useState<BnetCharacter[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);

  const region = useMemo(() => getRegion(), []);

  // Build set of already-tracked character keys
  const existingSet = useMemo(() => {
    return new Set(existingCharacters.map(c => `${c.character_name.toLowerCase()}|${c.realm.toLowerCase()}`));
  }, [existingCharacters]);

  // Fetch characters when modal opens
  useEffect(() => {
    if (!showPicker) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setTokenExpired(false);
    setSelected(new Set());

    (async () => {
      try {
        const data = await progressApi.get<{ characters: BnetCharacter[] }>('/auth/me/characters');
        if (!cancelled) {
          // Filter to max-level characters, sort by level desc then name
          const chars = (data.characters || [])
            .filter(c => c.level >= 70)
            .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
          setBnetCharacters(chars);
        }
      } catch (err: any) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          // Check if it's specifically the Blizzard token
          setTokenExpired(true);
        } else {
          setError(err.message || 'Failed to fetch characters');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [showPicker]);

  // Filter characters by search
  const filteredCharacters = useMemo(() => {
    if (!search.trim()) return bnetCharacters;
    const q = search.toLowerCase();
    return bnetCharacters.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.realm.toLowerCase().includes(q) ||
      c.playable_class.toLowerCase().includes(q)
    );
  }, [bnetCharacters, search]);

  // Group by realm
  const groupedByRealm = useMemo(() => {
    const groups: Record<string, BnetCharacter[]> = {};
    for (const char of filteredCharacters) {
      const realm = char.realm;
      if (!groups[realm]) groups[realm] = [];
      groups[realm].push(char);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredCharacters]);

  const charKey = (c: { name: string; realm: string }) => `${c.name.toLowerCase()}|${c.realm.toLowerCase()}`;
  const isTracked = (c: BnetCharacter) => existingSet.has(charKey(c));

  const toggleSelect = (c: BnetCharacter) => {
    const key = charKey(c);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddSelected = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    setError(null);

    const charsToAdd = bnetCharacters.filter(c => selected.has(charKey(c)));

    try {
      // Batch add all selected characters
      const result = await progressApi.post<{
        added: Array<{ id: number; character_name: string; realm: string }>;
        skipped: Array<{ name: string; realm: string; reason: string }>;
      }>('/users/me/characters/batch', {
        characters: charsToAdd.map(c => ({
          name: c.name,
          realm: c.realm,
          region,
          class_name: c.playable_class,
        })),
      });

      // Sync each newly added character (in parallel, show per-char progress)
      const addedChars = result.added || [];
      if (addedChars.length > 0) {
        const syncNames = new Set(addedChars.map(c => c.character_name));
        setSyncingNames(syncNames);

        await Promise.allSettled(
          addedChars.map(async (c) => {
            try {
              await progressApi.post(`/users/me/characters/${c.id}/gear/sync`);
            } catch (err) {
              console.error(`Sync failed for ${c.character_name}:`, err);
            } finally {
              setSyncingNames(prev => {
                const next = new Set(prev);
                next.delete(c.character_name);
                return next;
              });
            }
          })
        );
      }

      setShowPicker(false);
      setSelected(new Set());
      onCharacterAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add characters');
    } finally {
      setIsSubmitting(false);
      setSyncingNames(new Set());
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setShowPicker(false);
    setError(null);
    setSearch('');
    setSelected(new Set());
  };

  const selectableCount = bnetCharacters.filter(c => !isTracked(c)).length;

  return (
    <>
      <Badge
        variant="glass"
        size="md"
        className={cardStyles.addBadge}
        style={{ '--badge-width': '370px', '--badge-height': '200px', minHeight: '200px' } as React.CSSProperties}
        onClick={() => setShowPicker(true)}
      >
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '12px', cursor: 'pointer', padding: 0,
            width: '100%', height: '100%', position: 'absolute', inset: 0,
          }}
        >
          <Icon name="plus" size={32} className="starIcon" style={{ color: '#3B82F6', transition: 'all 0.2s' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
            Add Characters
          </span>
        </div>
      </Badge>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '520px', maxHeight: '80vh',
                borderRadius: '12px', backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Add Characters
                  </h3>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.4)', padding: '4px',
                    }}
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  Select characters from your Battle.net account
                </p>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{
                      width: 24, height: 24,
                      border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(59,130,246,0.6)',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    <span style={{ marginLeft: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      Loading characters from Battle.net...
                    </span>
                  </div>
                ) : tokenExpired ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <Icon name="alert-circle" size={32} style={{ color: '#f59e0b', marginBottom: 12 }} />
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>
                      Battle.net session expired
                    </p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      Log out and back in to refresh your character list.
                    </p>
                  </div>
                ) : error ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                    <Icon name="alert-circle" size={32} style={{ color: '#ef4444', marginBottom: 12 }} />
                    <p style={{ fontSize: '14px', color: '#f87171', margin: 0 }}>{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Search */}
                    {bnetCharacters.length > 5 && (
                      <div style={{ padding: '12px 24px 0' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 12px', borderRadius: '8px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          <Icon name="search" size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, realm, or class..."
                            style={{
                              flex: 1, background: 'none', border: 'none', outline: 'none',
                              color: '#fff', fontSize: '13px',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Character list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
                      {filteredCharacters.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: '20px 0' }}>
                          {search ? 'No characters match your search' : 'No max-level characters found'}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {groupedByRealm.map(([realm, chars]) => (
                            <div key={realm}>
                              <div style={{
                                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                                letterSpacing: '0.05em', color: 'rgba(255,255,255,0.35)',
                                marginBottom: '8px', paddingLeft: '4px',
                              }}>
                                {realm.replace(/-/g, ' ')}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {chars.map((char) => {
                                  const tracked = isTracked(char);
                                  const key = charKey(char);
                                  const isSelected = selected.has(key);
                                  const isSyncing = syncingNames.has(char.name);
                                  const classColor = CLASS_COLORS[char.playable_class] || '#888';

                                  return (
                                    <div
                                      key={key}
                                      onClick={() => !tracked && !isSubmitting && toggleSelect(char)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '8px 10px', borderRadius: '8px',
                                        cursor: tracked ? 'default' : 'pointer',
                                        backgroundColor: isSelected
                                          ? 'rgba(59,130,246,0.1)'
                                          : tracked
                                          ? 'rgba(255,255,255,0.02)'
                                          : 'transparent',
                                        border: isSelected
                                          ? '1px solid rgba(59,130,246,0.3)'
                                          : '1px solid transparent',
                                        opacity: tracked ? 0.5 : 1,
                                        transition: 'all 0.15s',
                                      }}
                                    >
                                      {/* Checkbox or tracked indicator */}
                                      <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                        {tracked ? (
                                          <div style={{
                                            width: 18, height: 18, borderRadius: '4px',
                                            backgroundColor: 'rgba(34,197,94,0.2)',
                                            border: '1px solid rgba(34,197,94,0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          }}>
                                            <Icon name="check" size={12} style={{ color: '#22c55e' }} />
                                          </div>
                                        ) : (
                                          <Checkbox
                                            checked={isSelected}
                                            onChange={() => toggleSelect(char)}
                                            variant="blue"
                                            size="sm"
                                            disabled={isSubmitting}
                                          />
                                        )}
                                      </div>

                                      {/* Character info */}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span style={{ fontSize: '14px', fontWeight: 600, color: classColor }}>
                                            {char.name}
                                          </span>
                                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                                            {char.level}
                                          </span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                          {char.playable_class}
                                        </span>
                                      </div>

                                      {/* Status */}
                                      {tracked && (
                                        <span style={{ fontSize: '11px', color: 'rgba(34,197,94,0.7)', fontWeight: 500 }}>
                                          Tracked
                                        </span>
                                      )}
                                      {isSyncing && (
                                        <div style={{
                                          width: 14, height: 14,
                                          border: '2px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6',
                                          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                                        }} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!isLoading && !tokenExpired && !error && (
                <div style={{
                  padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    {selected.size > 0
                      ? `${selected.size} selected`
                      : `${selectableCount} available`}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="blue"
                      size="sm"
                      onClick={handleAddSelected}
                      disabled={isSubmitting || selected.size === 0}
                    >
                      {isSubmitting
                        ? syncingNames.size > 0
                          ? `Syncing ${syncingNames.size}...`
                          : 'Adding...'
                        : `Add ${selected.size || ''} Character${selected.size !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
