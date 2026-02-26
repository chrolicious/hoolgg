'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Icon, Button, Input } from '@hool/design-system';
import { progressApi } from '../../../lib/api';
import cardStyles from './character-card.module.css';

interface AddCharacterCardProps {
  onCharacterAdded: () => void;
}

export function AddCharacterCard({ onCharacterAdded }: AddCharacterCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [characterName, setCharacterName] = useState('');
  const [realm, setRealm] = useState('');
  const [region, setRegion] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith('Europe/') || tz.startsWith('Africa/')) return 'eu';
      if (tz.startsWith('Asia/Seoul') || tz === 'Asia/Seoul') return 'kr';
      if (tz.startsWith('Asia/Taipei') || tz === 'Asia/Taipei') return 'tw';
      return 'us';
    } catch {
      return 'us';
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!characterName.trim() || !realm.trim()) {
      setError('Name and realm are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newChar = await progressApi.post<{id: number}>(`/users/me/characters`, {
        name: characterName.trim(),
        realm: realm.trim(),
        region: region,
      });

      if (newChar && newChar.id) {
        // Automatically sync the character so the class, ilvl, and raider.io stats populate instantly
        try {
          await progressApi.post(`/users/me/characters/${newChar.id}/gear/sync`);
        } catch (syncErr) {
          console.error('Initial sync failed, but character was added', syncErr);
        }
      }

      setShowForm(false);
      setCharacterName('');
      setRealm('');
      setRegion('us');
      onCharacterAdded();
    } catch (err: any) {
      console.error('Failed to add character:', err);
      if (err.status === 409 || err?.response?.status === 409) {
        setError('Character already in roster');
      } else {
        setError(err.message || 'Failed to add character');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
    setCharacterName('');
    setRealm('');
    setRegion('us');
  };

  return (
    <>
      <Badge
        variant="glass"
        size="md"
        className={cardStyles.addBadge}
        style={{ '--badge-width': '370px', '--badge-height': '200px', minHeight: '200px' } as React.CSSProperties}
        onClick={() => setShowForm(true)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        >
          <Icon name="plus" size={32} className="starIcon" style={{ color: '#3B82F6', transition: 'all 0.2s' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
            Add New Character
          </span>
        </div>
      </Badge>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
            onClick={handleCancel}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              style={{
                width: '100%', maxWidth: '400px', padding: '24px',
                borderRadius: '12px', backgroundColor: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', gap: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center' }}>Add Character</h3>

              {error && (
                <div style={{
                  padding: '12px', borderRadius: '8px',
                  backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: '13px', textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Region</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['us', 'eu', 'kr', 'tw'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      style={{
                        flex: 1,
                        background: region === r ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                        border: region === r ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: region === r ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                        padding: '8px 0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Character Name</label>
                <Input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Thrall"
                  size="md"
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Realm</label>
                <Input
                  value={realm}
                  onChange={(e) => setRealm(e.target.value)}
                  placeholder="e.g. Area 52"
                  size="md"
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button type="button" onClick={handleCancel} disabled={isSubmitting} variant="secondary" size="md" style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !realm || !characterName} variant="blue" size="md" style={{ flex: 1 }}>
                  {isSubmitting ? 'Syncing...' : 'Add Character'}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
