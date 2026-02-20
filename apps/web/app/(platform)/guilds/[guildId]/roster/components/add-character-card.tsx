'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Icon, Button, Input } from '@hool/design-system';
import { progressApi } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/auth-context';
import cardStyles from './character-card.module.css';

interface AddCharacterCardProps {
  guildId: string;
  onCharacterAdded: () => void;
}

export function AddCharacterCard({ guildId, onCharacterAdded }: AddCharacterCardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [realm, setRealm] = useState('Area 52');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!characterName.trim()) {
      setError('Character name is required');
      return;
    }

    if (!realm.trim()) {
      setError('Realm is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await progressApi.post(`/guilds/${guildId}/characters`, {
        name: characterName.trim(),
        realm: realm.trim(),
        user_bnet_id: user?.bnet_id,
      });

      setShowForm(false);
      setCharacterName('');
      setRealm('Area 52');
      onCharacterAdded();
    } catch (err: any) {
      console.error('Failed to add character:', err);

      if (err?.response?.status === 409) {
        setError('This character is already in your roster');
      } else if (err?.response?.status === 403) {
        setError('You do not have permission to add characters');
      } else if (err?.response?.status === 401) {
        setError('You must be logged in to add characters');
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to add character. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setError(null);
    setCharacterName('');
    setRealm('Area 52');
  };

  return (
    <>
      <Badge
        variant="glass"
        size="md"
        className={cardStyles.addBadge}
        style={{ '--badge-width': '200px', '--badge-height': '200px' } as React.CSSProperties}
        onClick={() => setShowForm(true)}
      >
        <button
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
          <Icon name="plus" size={32} animation="spin" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
          }}>
            Add Character
          </span>
        </button>
      </Badge>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
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
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>Add Character</h3>

              {error && (
                <div style={{
                  padding: '12px', borderRadius: '8px',
                  backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: '14px',
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Character Name</label>
                <Input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter character name"
                  size="md"
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Realm</label>
                <Input
                  value={realm}
                  onChange={(e) => setRealm(e.target.value)}
                  placeholder="Enter realm"
                  size="md"
                  disabled={isSubmitting}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  type="submit"
                  disabled={isSubmitting || !characterName.trim() || !realm.trim()}
                  variant="primary"
                  size="md"
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Character'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  variant="secondary"
                  size="md"
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
