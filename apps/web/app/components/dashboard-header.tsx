'use client';

import React from 'react';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from '@hool/design-system';
import type { Guild } from '../lib/types';
import styles from './dashboard-header.module.css';

export interface DashboardHeaderProps {
  guild: Guild;
  userRole: 'gm' | 'officer' | 'raider';
  onNavigate?: (section: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  guild,
  userRole,
  onNavigate,
}) => {
  const isGmOrOfficer = userRole === 'gm' || userRole === 'officer';

  const renderGuildEmblem = () => {
    // Note: crest_data will be added to Guild type in future tasks
    // For now, we'll use a fallback
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

  return (
    <div className={styles.container}>
      <Badge
        variant="primary"
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
          {isGmOrOfficer ? (
            <div className={styles.teamView}>
              <div className={styles.label}>Team Overview</div>
              <div className={styles.placeholder}>Stats loading...</div>
            </div>
          ) : (
            <div className={styles.characterView}>
              <div className={styles.placeholder}>Character stats loading...</div>
            </div>
          )}
        </BadgeBody>

        <BadgeFooter>
          {isGmOrOfficer && (
            <div className={styles.viewToggle}>
              <button className={styles.arrow}>←</button>
              <div className={styles.dots}>•○</div>
              <button className={styles.arrow}>→</button>
            </div>
          )}
        </BadgeFooter>
      </Badge>
    </div>
  );
};
