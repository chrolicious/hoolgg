'use client';

import React, { useState } from 'react';
import { Icon } from '@hool/design-system';
import type { TrackedCharacter } from '../lib/use-tracked-characters';
import styles from './character-selector.module.css';

export interface BlizzardCharacter {
  name: string;
  realm: string;
  level: number;
  playable_class: string;
  playable_race: string;
  faction: string;
}

export interface CharacterSelectorProps {
  trackedCharacters: TrackedCharacter[];
  availableCharacters: BlizzardCharacter[];
  onAddCharacter: (name: string, realm: string) => Promise<void>;
  onRemoveCharacter: (name: string, realm: string) => Promise<void>;
  onSetMain: (name: string, realm: string) => Promise<void>;
  onClose: () => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  trackedCharacters,
  availableCharacters,
  onAddCharacter,
  onRemoveCharacter,
  onSetMain,
  onClose,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const isTracked = (name: string, realm: string) =>
    trackedCharacters.some(
      (c) => c.character_name === name && c.realm === realm
    );

  const isMain = (name: string, realm: string) =>
    trackedCharacters.some(
      (c) => c.character_name === name && c.realm === realm && c.is_main
    );

  const handleToggleTracked = async (char: BlizzardCharacter) => {
    const key = `${char.name}-${char.realm}`;
    setLoading(key);

    try {
      if (isTracked(char.name, char.realm)) {
        await onRemoveCharacter(char.name, char.realm);
      } else {
        await onAddCharacter(char.name, char.realm);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSetMain = async (char: BlizzardCharacter) => {
    const key = `${char.name}-${char.realm}`;
    setLoading(key);

    try {
      await onSetMain(char.name, char.realm);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Select Characters</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <Icon name="x-mark" size={20} />
          </button>
        </div>

        <div className={styles.list}>
          {availableCharacters.map((char) => {
            const tracked = isTracked(char.name, char.realm);
            const main = isMain(char.name, char.realm);
            const key = `${char.name}-${char.realm}`;
            const isLoading = loading === key;

            return (
              <div key={key} className={styles.characterRow}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={tracked}
                    onChange={() => handleToggleTracked(char)}
                    disabled={isLoading}
                  />
                  <span className={styles.characterInfo}>
                    <span className={styles.name}>{char.name}</span>
                    <span className={styles.details}>
                      {char.level} {char.playable_class} - {char.realm}
                    </span>
                  </span>
                </label>

                {tracked && (
                  <button
                    className={`${styles.starButton} ${main ? styles.mainStar : ''}`}
                    onClick={() => handleSetMain(char)}
                    disabled={isLoading || main}
                    title={main ? 'Main character' : 'Set as main'}
                  >
                    <Icon name="star" size={20} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
