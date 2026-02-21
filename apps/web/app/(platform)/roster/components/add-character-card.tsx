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
  const [region, setRegion] = useState('us');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!characterName.trim() || !realm.trim()) {
      setError('Name and realm are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await progressApi.post(`/users/me/characters`, {
        name: characterName.trim(),
        realm: realm.trim(),
        region: region,
      });

      setShowForm(false);
      setCharacterName('');
      setRealm('');
      setRegion('us');
      onCharacterAdded();
    } catch (err: any) {
      console.error('Failed to add character:', err);
      if (err?.response?.status === 409) {
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
    <Badge
      variant="glass"
      size="md"
      className={cardStyles.addBadge}
      style={{ '--badge-width': '370px', '--badge-height': '200px', minHeight: '200px' } as React.CSSProperties}
    >
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.button
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(true)}
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
            <Icon name="plus" size={32} style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
              Add New Character
            </span>
          </motion.button>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%',
              padding: '24px 20px',
              height: '100%',
              justifyContent: 'center',
              position: 'absolute',
              inset: 0
            }}
          >
            {error && (
              <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                value={realm}
                onChange={(e) => setRealm(e.target.value)}
                placeholder="Realm (e.g. Area 52)"
                size="md"
                disabled={isSubmitting}
              />
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Character Name"
                size="md"
                disabled={isSubmitting}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['us', 'eu', 'kr', 'tw'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    style={{
                      background: region === r ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                      border: region === r ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: region === r ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button type="button" onClick={handleCancel} disabled={isSubmitting} variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !realm || !characterName} variant="primary" size="sm">
                  {isSubmitting ? 'Syncing...' : 'Add'}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Badge>
  );
}
