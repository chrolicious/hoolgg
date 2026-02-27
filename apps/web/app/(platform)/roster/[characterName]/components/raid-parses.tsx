'use client';

import { SectionCard } from './section-card';
import type { ParsesResponse } from '../types';

interface RaidParsesProps {
  parsesData: ParsesResponse | null;
}

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
  const parses = parsesData?.parses;
  const entries = parses ? Object.entries(parses) : [];

  if (entries.length === 0) {
    return (
      <SectionCard title="Raid Performance" subtitle="Per-boss parse percentiles from WarcraftLogs">
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          No parse data available. Sync the character to fetch data from WarcraftLogs.
        </p>
      </SectionCard>
    );
  }

  // Sort: Mythic first, then Heroic, alphabetical within
  const sorted = entries.sort(([a], [b]) => {
    const aMythic = a.includes('Mythic');
    const bMythic = b.includes('Mythic');
    if (aMythic && !bMythic) return -1;
    if (!aMythic && bMythic) return 1;
    return a.localeCompare(b);
  });

  return (
    <SectionCard title="Raid Performance" subtitle="Per-boss parse percentiles from WarcraftLogs">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sorted.map(([key, data]) => {
          const pct = data.best_parse;
          const color = getParseColor(pct);
          const barWidth = pct !== null ? Math.max(pct, 2) : 0;

          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Boss name */}
              <span style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                minWidth: '180px',
                flexShrink: 0,
              }}>
                {key}
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
        })}
      </div>
    </SectionCard>
  );
}
