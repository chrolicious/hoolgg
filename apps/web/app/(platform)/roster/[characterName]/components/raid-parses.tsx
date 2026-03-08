'use client';

import { useState } from 'react';
import { SectionCard } from './section-card';
import type { ParsesResponse } from '../types';
import { progressApi } from '../../../../lib/api';

interface RaidParsesProps {
  parsesData: ParsesResponse | null;
  characterId: number;
}

const SEASONS = [
  { key: 'mn_s1' as const, label: 'MN S1' },
  { key: 'tww_s3' as const, label: 'TWW S3' },
];

function getParseColor(percentile: number | null): string {
  if (percentile === null) return 'rgba(255,255,255,0.2)';
  if (percentile >= 99) return '#e5cc80';  // gold
  if (percentile >= 95) return '#ff8000';  // orange (legendary)
  if (percentile >= 75) return '#a335ee';  // purple (epic)
  if (percentile >= 50) return '#0070dd';  // blue (rare)
  if (percentile >= 25) return '#1eff00';  // green (uncommon)
  return '#9d9d9d';                        // gray
}

export function RaidParses({ parsesData, characterId }: RaidParsesProps) {
  const [data, setData] = useState<ParsesResponse | null>(parsesData);
  const [syncing, setSyncing] = useState(false);

  const seasons = data?.seasons ?? {};

  // Default to first season that has data, preferring mn_s1 when available
  const defaultSeason = ((['mn_s1', 'tww_s3'] as const).find(
    (k) => seasons[k] && Object.keys(seasons[k]!).length > 0
  ) ?? 'mn_s1');

  const [activeSeason, setActiveSeason] = useState<'mn_s1' | 'tww_s3'>(defaultSeason);

  const parses = seasons[activeSeason] ?? {};
  const entries = Object.entries(parses);

  const heroicEntries = entries
    .filter(([key]) => key.includes('(Heroic)'))
    .sort(([a], [b]) => a.localeCompare(b));
  const mythicEntries = entries
    .filter(([key]) => key.includes('(Mythic)'))
    .sort(([a], [b]) => a.localeCompare(b));

  const hasAnyData = Object.values(seasons).some(
    (s) => s && Object.keys(s).length > 0
  );

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await progressApi.post<ParsesResponse>(
        `/users/me/characters/${characterId}/parses/sync`
      );
      setData(result);
      // Switch to whichever season got data
      const newSeasons = result?.seasons ?? {};
      const firstWithData = (['mn_s1', 'tww_s3'] as const).find(
        (k) => newSeasons[k] && Object.keys(newSeasons[k]!).length > 0
      );
      if (firstWithData) setActiveSeason(firstWithData);
    } catch (e) {
      console.error('WCL sync failed:', e);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <SectionCard title="Raid Performance" subtitle="Per-boss parse percentiles from WarcraftLogs">
      {/* Season tabs + sync button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
        {SEASONS.map(({ key, label }) => {
          const isActive = activeSeason === key;
          const hasData = seasons[key] && Object.keys(seasons[key]!).length > 0;
          return (
            <button
              key={key}
              onClick={() => setActiveSeason(key)}
              style={{
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                opacity: hasData ? 1 : 0.4,
              }}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: syncing ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)',
            cursor: syncing ? 'default' : 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {syncing ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {entries.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          {hasAnyData
            ? 'No data for this season yet. Click Sync to fetch from WarcraftLogs.'
            : 'No parse data available. Click Sync to fetch from WarcraftLogs.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {heroicEntries.length > 0 && (
            <>
              <DifficultyDivider label="Heroic" />
              {heroicEntries.map(([key, d]) => (
                <ParseRow key={key} bossKey={key} data={d} />
              ))}
            </>
          )}
          {mythicEntries.length > 0 && (
            <>
              <DifficultyDivider label="Mythic" />
              {mythicEntries.map(([key, d]) => (
                <ParseRow key={key} bossKey={key} data={d} />
              ))}
            </>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function DifficultyDivider({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '4px 0 2px',
    }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <span style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
    </div>
  );
}

function ParseRow({
  bossKey,
  data,
}: {
  bossKey: string;
  data: { best_parse: number | null; median_parse: number | null; kills: number; spec: string | null };
}) {
  const pct = data.best_parse;
  const color = getParseColor(pct);
  const barWidth = pct !== null ? Math.max(pct, 2) : 0;
  const bossName = bossKey.replace(/\s*\((Heroic|Mythic)\)$/, '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
        width: '180px',
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {bossName}
      </span>

      <div style={{
        flex: 1,
        height: '16px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${barWidth}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '4px',
          opacity: 0.8,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: color,
        minWidth: '36px',
        textAlign: 'right',
      }}>
        {pct !== null ? Math.round(pct) : '\u2014'}
      </span>

      <span style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,0.3)',
        minWidth: '32px',
      }}>
        {data.kills}k
      </span>
    </div>
  );
}
