'use client';

import { useState } from 'react';
import { SectionCard } from './section-card';
import type { ParsesResponse } from '../types';

interface RaidParsesProps {
  parsesData: ParsesResponse | null;
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

export function RaidParses({ parsesData }: RaidParsesProps) {
  const [activeSeason, setActiveSeason] = useState<'mn_s1' | 'tww_s3'>('mn_s1');

  const seasons = parsesData?.seasons ?? {};
  const parses = seasons[activeSeason] ?? {};
  const entries = Object.entries(parses);

  // Split by difficulty: heroic first, then mythic
  const heroicEntries = entries
    .filter(([key]) => key.includes('(Heroic)'))
    .sort(([a], [b]) => a.localeCompare(b));
  const mythicEntries = entries
    .filter(([key]) => key.includes('(Mythic)'))
    .sort(([a], [b]) => a.localeCompare(b));

  const hasAnyData = Object.values(seasons).some(
    (s) => s && Object.keys(s).length > 0
  );

  return (
    <SectionCard title="Raid Performance" subtitle="Per-boss parse percentiles from WarcraftLogs">
      {/* Season tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
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
      </div>

      {entries.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          {hasAnyData
            ? 'No data for this season yet. Sync to fetch from WarcraftLogs.'
            : 'No parse data available. Sync the character to fetch data from WarcraftLogs.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {heroicEntries.length > 0 && (
            <>
              <DifficultyDivider label="Heroic" />
              {heroicEntries.map(([key, data]) => (
                <ParseRow key={key} bossKey={key} data={data} />
              ))}
            </>
          )}
          {mythicEntries.length > 0 && (
            <>
              <DifficultyDivider label="Mythic" />
              {mythicEntries.map(([key, data]) => (
                <ParseRow key={key} bossKey={key} data={data} />
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

  // Strip difficulty suffix for display: "Vaelgor & Ezzorak (Heroic)" → "Vaelgor & Ezzorak"
  const bossName = bossKey.replace(/\s*\((Heroic|Mythic)\)$/, '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Boss name */}
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

      {/* Parse bar */}
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

      {/* Percentile number */}
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: color,
        minWidth: '36px',
        textAlign: 'right',
      }}>
        {pct !== null ? Math.round(pct) : '\u2014'}
      </span>

      {/* Kill count */}
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
