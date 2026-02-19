'use client';

import React, { useState } from 'react';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from '@hool/design-system';
import type { Guild } from '../lib/types';
import { CharacterSelector, type BlizzardCharacter } from './character-selector';
import { useTrackedCharacters } from '../lib/use-tracked-characters';
import styles from './dashboard-header.module.css';

export interface DashboardHeaderProps {
  guild: Guild;
  userRole: 'gm' | 'officer' | 'raider';
  onNavigate?: (section: string) => void;
  userMenuButton?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  guild,
  userRole,
  onNavigate,
  userMenuButton,
}) => {
  const isGmOrOfficer = userRole === 'gm' || userRole === 'officer';
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'team' | 'personal'>(
    isGmOrOfficer ? 'team' : 'personal'
  );

  const {
    characters: trackedCharacters,
    mainCharacter,
    addCharacter,
    removeCharacter,
    setMainCharacter,
  } = useTrackedCharacters(guild.id);

  // TODO: Fetch available characters from Blizzard API
  const availableCharacters: BlizzardCharacter[] = [];

  const toggleView = () => {
    setViewMode((prev) => (prev === 'team' ? 'personal' : 'team'));
  };

  const handleOpenCharacterSelector = () => {
    setShowCharacterSelector(true);
  };

  const renderGuildEmblem = () => {
    // Note: crest_data will be added to Guild type in future tasks
    const guildData = guild as Guild & { crest_data?: { render_url?: string } };

    if (guildData.crest_data?.render_url) {
      return (
        <img
          src={guildData.crest_data.render_url}
          alt={`${guild.name} emblem`}
          className={styles.emblem}
        />
      );
    }
    // Fallback: guild initial
    return (
      <div className={styles.emblemFallback}>
        {guild.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderStats = () => {
    if (isGmOrOfficer && viewMode === 'team') {
      return (
        <div className={styles.teamView}>
          <div className={styles.label}>Team Overview</div>
          <div className={styles.stat}>Avg ilvl: 645 ↑</div>
          <div className={styles.stat}>32/45 on track</div>
          <div className={styles.warning}>⚠️ 8 need attention</div>
        </div>
      );
    }

    // Personal view (or raider)
    return (
      <div className={styles.characterView}>
        {mainCharacter ? (
          <>
            <div className={styles.characterName}>{mainCharacter.character_name}</div>
            <div className={styles.ilvl}>650 ilvl</div>
            <div className={styles.progress}>Weekly: 75%</div>
          </>
        ) : (
          <div className={styles.placeholder}>
            <button onClick={handleOpenCharacterSelector}>
              Add your characters
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.container}>
        <Badge
          variant="secondary"
          size="md"
          orientation="horizontal"
          profileIcon={renderGuildEmblem()}
          onClick={() => onNavigate?.('guild-info')}
        >
          <BadgeHeader>
            <div className={styles.guildName}>{guild.name}</div>
            <div className={styles.realm}>{guild.realm}</div>
          </BadgeHeader>

          <BadgeBody>
            <div onClick={handleOpenCharacterSelector} style={{ cursor: 'pointer' }}>
              {renderStats()}
            </div>
          </BadgeBody>

          <BadgeFooter>
            <div className={styles.footer}>
              {isGmOrOfficer && (
                <div className={styles.viewToggle}>
                  <button className={styles.arrow} onClick={toggleView}>
                    ←
                  </button>
                  <div className={styles.dots}>
                    {viewMode === 'team' ? '•○' : '○•'}
                  </div>
                  <button className={styles.arrow} onClick={toggleView}>
                    →
                  </button>
                </div>
              )}
              {userMenuButton && (
                <div className={styles.userMenu}>
                  {userMenuButton}
                </div>
              )}
            </div>
          </BadgeFooter>
        </Badge>
      </div>

      {showCharacterSelector && (
        <CharacterSelector
          trackedCharacters={trackedCharacters}
          availableCharacters={availableCharacters}
          onAddCharacter={addCharacter}
          onRemoveCharacter={removeCharacter}
          onSetMain={setMainCharacter}
          onClose={() => setShowCharacterSelector(false)}
        />
      )}
    </>
  );
};
