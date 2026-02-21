'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Icon, Select, Button, type SelectOption } from '@hool/design-system';
import { progressApi } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/auth-context';

interface GuildMember {
  character_name: string;
  bnet_id: number;
  rank_id: number;
}

interface AddCharacterCardProps {
  guildId: string;
  availableMembers: GuildMember[];
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

export function AddCharacterCard({ guildId, availableMembers, onCharacterAdded }: AddCharacterCardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedBnetId, setSelectedBnetId] = useState<number | null>(null);

  // Character data (would come from Blizzard API in production)
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

  const handleMemberSelect = async (memberName: string) => {
    setSelectedMember(memberName);
    setMainSpec('');
    setOffSpec('');
    setError(null);

    // Store the bnet_id for this character
    const member = availableMembers.find(m => m.character_name === memberName);
    setSelectedBnetId(member?.bnet_id || null);

    // In production: fetch from Blizzard API
    // For dev: simulate with hardcoded data
    // TODO: Fetch character data from Blizzard API
    // For now, require manual input
    setCharacterData({
      class_name: '', // Will be selected by user in dev mode
      realm: 'Area 52', // Default realm
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
      const response = await progressApi.post(`/guilds/${guildId}/characters`, {
        name: selectedMember,
        realm: characterData.realm,
        class_name: characterData.class_name,
        spec: mainSpec,
        role: mainSpecData?.role || 'DPS',
        user_bnet_id: selectedBnetId || user?.bnet_id, // Critical: needed for roster filtering
      });

      // Success - reset form
      setShowForm(false);
      setSelectedMember('');
      setSelectedBnetId(null);
      setCharacterData(null);
      setMainSpec('');
      setOffSpec('');
      onCharacterAdded();
    } catch (err: any) {
      console.error('Failed to add character:', err);

      // Handle specific error cases
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
    <Card padding="md" variant="elevated" interactive={!showForm}>
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-white m-0">Add Character</h3>

            {error && (
              <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {availableMembers.length === 0 ? (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-white/60 m-0">
                  All your guild characters are already in your roster!
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/80">Character</label>
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
                    <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
                      <p className="text-xs text-blue-400 m-0">
                        <Icon name="info" size={12} className="inline mr-1" />
                        In production, class and realm data would be fetched automatically from the Blizzard API.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-white/80">Class</label>
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
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-white/80">Main Spec</label>
                          <Select
                            options={specOptions}
                            value={mainSpec}
                            onChange={setMainSpec}
                            placeholder="Select main specialization"
                            variant="secondary"
                            size="md"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-white/80">
                            Off-Spec <span className="text-white/40 font-normal">(Optional)</span>
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
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-xs text-white/60 m-0">
                              Role: <span className="text-white font-semibold">
                                {availableSpecs.find(s => s.spec === mainSpec)?.role}
                              </span>
                              {offSpec && (
                                <> • Off-spec: <span className="text-white font-semibold">{offSpec}</span></>
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
              <div className="flex gap-2 mt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedMember || !characterData?.class_name || !mainSpec}
                  variant="primary"
                  size="md"
                  className="flex-1"
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
        ) : (
          <motion.button
            key="add-button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full bg-transparent border-2 border-dashed border-white/20 rounded-lg p-8 cursor-pointer flex flex-col items-center gap-3 transition-all duration-200"
          >
            <motion.div
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
              transition={{ duration: 0.2 }}
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"
            >
              <Icon name="plus" size={24} className="text-white/50 group-hover:text-purple-400" />
            </motion.div>
            <span className="text-sm font-medium text-white/50">Add Character</span>
          </motion.button>
        )}
      </AnimatePresence>
    </Card>
  );
}
