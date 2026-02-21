'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Icon, Select, Button, type SelectOption } from '@hool/design-system';
import { progressApi } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/auth-context';
import cardStyles from './character-card.module.css';

interface GuildMember {
  character_name: string;
  bnet_id: number;
  rank_id: number;
}

interface AddCharacterCardProps {
  guildId: string;
  availableMembers?: GuildMember[];
  onCharacterAdded: () => void;
}

// Specs by class
const SPECS_BY_CLASS: Record<string, { spec: string; role: 'Tank' | 'Healer' | 'DPS' }[]> = {
  'Death Knight': [
    { spec: 'Blood', role: 'Tank' },
    { spec: 'Frost', role: 'DPS' },
    { spec: 'Unholy', role: 'DPS' },
  ],
  'Demon Hunter': [
    { spec: 'Havoc', role: 'DPS' },
    { spec: 'Vengeance', role: 'Tank' },
  ],
  'Druid': [
    { spec: 'Balance', role: 'DPS' },
    { spec: 'Feral', role: 'DPS' },
    { spec: 'Guardian', role: 'Tank' },
    { spec: 'Restoration', role: 'Healer' },
  ],
  'Evoker': [
    { spec: 'Devastation', role: 'DPS' },
    { spec: 'Preservation', role: 'Healer' },
    { spec: 'Augmentation', role: 'DPS' },
  ],
  'Hunter': [
    { spec: 'Beast Mastery', role: 'DPS' },
    { spec: 'Marksmanship', role: 'DPS' },
    { spec: 'Survival', role: 'DPS' },
  ],
  'Mage': [
    { spec: 'Arcane', role: 'DPS' },
    { spec: 'Fire', role: 'DPS' },
    { spec: 'Frost', role: 'DPS' },
  ],
  'Monk': [
    { spec: 'Brewmaster', role: 'Tank' },
    { spec: 'Mistweaver', role: 'Healer' },
    { spec: 'Windwalker', role: 'DPS' },
  ],
  'Paladin': [
    { spec: 'Holy', role: 'Healer' },
    { spec: 'Protection', role: 'Tank' },
    { spec: 'Retribution', role: 'DPS' },
  ],
  'Priest': [
    { spec: 'Discipline', role: 'Healer' },
    { spec: 'Holy', role: 'Healer' },
    { spec: 'Shadow', role: 'DPS' },
  ],
  'Rogue': [
    { spec: 'Assassination', role: 'DPS' },
    { spec: 'Outlaw', role: 'DPS' },
    { spec: 'Subtlety', role: 'DPS' },
  ],
  'Shaman': [
    { spec: 'Elemental', role: 'DPS' },
    { spec: 'Enhancement', role: 'DPS' },
    { spec: 'Restoration', role: 'Healer' },
  ],
  'Warlock': [
    { spec: 'Affliction', role: 'DPS' },
    { spec: 'Demonology', role: 'DPS' },
    { spec: 'Destruction', role: 'DPS' },
  ],
  'Warrior': [
    { spec: 'Arms', role: 'DPS' },
    { spec: 'Fury', role: 'DPS' },
    { spec: 'Protection', role: 'Tank' },
  ],
};

export function AddCharacterCard({ guildId, availableMembers = [], onCharacterAdded }: AddCharacterCardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedBnetId, setSelectedBnetId] = useState<number | null>(null);

  const [characterData, setCharacterData] = useState<{
    class_name: string;
    realm: string;
  } | null>(null);

  const [mainSpec, setMainSpec] = useState<string>('');
  const [offSpec, setOffSpec] = useState<string>('');

  const characterOptions: SelectOption[] = availableMembers.map((member) => ({
    value: member.character_name,
    label: member.character_name,
  }));

  const handleMemberSelect = (memberName: string) => {
    setSelectedMember(memberName);
    setMainSpec('');
    setOffSpec('');
    setError(null);

    const member = availableMembers.find(m => m.character_name === memberName);
    setSelectedBnetId(member?.bnet_id || null);

    // Dev mode: require manual input
    setCharacterData({
      class_name: '',
      realm: 'Area 52',
    });
  };

  const handleClassSelect = (className: string) => {
    setCharacterData({
      ...characterData!,
      class_name: className,
    });
    setMainSpec('');
    setOffSpec('');
  };

  const availableSpecs = characterData?.class_name
    ? SPECS_BY_CLASS[characterData.class_name] || []
    : [];

  const specOptions: SelectOption[] = availableSpecs.map(({ spec }) => ({
    value: spec,
    label: spec,
  }));

  const classOptions: SelectOption[] = Object.keys(SPECS_BY_CLASS).map((cls) => ({
    value: cls,
    label: cls,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      setError('Please select a character');
      return;
    }

    if (!characterData?.class_name) {
      setError('Please select a class');
      return;
    }

    if (!mainSpec) {
      setError('Please select a main spec');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const mainSpecData = availableSpecs.find(s => s.spec === mainSpec);

    try {
      await progressApi.post(`/guilds/${guildId}/characters`, {
        name: selectedMember,
        realm: characterData.realm,
        class_name: characterData.class_name,
        spec: mainSpec,
        role: mainSpecData?.role || 'DPS',
        user_bnet_id: selectedBnetId || user?.bnet_id,
      });

      setShowForm(false);
      setSelectedMember('');
      setSelectedBnetId(null);
      setCharacterData(null);
      setMainSpec('');
      setOffSpec('');
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
    setSelectedMember('');
    setSelectedBnetId(null);
    setCharacterData(null);
    setMainSpec('');
    setOffSpec('');
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
                maxHeight: '90vh', overflowY: 'auto'
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

              {availableMembers.length === 0 ? (
                <div style={{
                  padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'
                }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                    All your guild characters are already in your roster!
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Character</label>
                    <Select
                      options={characterOptions}
                      value={selectedMember}
                      onChange={handleMemberSelect}
                      placeholder="Choose a character from your guild..."
                      variant="secondary"
                      size="md"
                    />
                  </div>

                  {selectedMember && (
                    <>
                      <div style={{
                        padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.1)',
                        border: '1px solid rgba(37,99,235,0.2)'
                      }}>
                        <p style={{ fontSize: '12px', color: '#60a5fa', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="info" size={12} />
                          In production, class and realm data would be fetched automatically from the Blizzard API.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Class</label>
                        <Select
                          options={classOptions}
                          value={characterData?.class_name || ''}
                          onChange={handleClassSelect}
                          placeholder="Select class (temp: would be auto-fetched)"
                          variant="secondary"
                          size="md"
                        />
                      </div>

                      {characterData?.class_name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Main Spec</label>
                            <Select
                              options={specOptions}
                              value={mainSpec}
                              onChange={setMainSpec}
                              placeholder="Select main specialization"
                              variant="secondary"
                              size="md"
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                              Off-Spec <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(Optional)</span>
                            </label>
                            <Select
                              options={specOptions}
                              value={offSpec}
                              onChange={setOffSpec}
                              placeholder="Select off-spec if applicable"
                              variant="secondary"
                              size="md"
                            />
                          </div>

                          {mainSpec && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                                Role: <span style={{ color: '#fff', fontWeight: 600 }}>
                                  {availableSpecs.find(s => s.spec === mainSpec)?.role}
                                </span>
                                {offSpec && (
                                  <> • Off-spec: <span style={{ color: '#fff', fontWeight: 600 }}>{offSpec}</span></>
                                )}
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </>
                  )}
                </>
              )}

              {availableMembers.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedMember || !characterData?.class_name || !mainSpec}
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
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
