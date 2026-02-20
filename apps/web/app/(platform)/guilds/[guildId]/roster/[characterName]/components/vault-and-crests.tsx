'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { VaultResponse, VaultSlot, CrestsResponse } from '../types';
import { SectionCard } from './section-card';
import { progressApi } from '../../../../../../lib/api';

interface VaultAndCrestsProps {
  vaultData: VaultResponse | null;
  crestsData: CrestsResponse | null;
  characterId: number;
  guildId: string;
  currentWeek: number;
}

// ─── Vault row configuration ───

const VAULT_ROWS: { label: string; key: 'raid_slots' | 'dungeon_slots' | 'world_slots'; color: string; maxSlots: number }[] = [
  { label: 'Raid', key: 'raid_slots', color: '#ef4444', maxSlots: 3 },
  { label: 'M+', key: 'dungeon_slots', color: '#3b82f6', maxSlots: 3 },
  { label: 'World', key: 'world_slots', color: '#22c55e', maxSlots: 1 },
];

// ─── Crest configuration ───

const CREST_TYPES = [
  { key: 'Weathered', label: 'Weathered', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', text: '#94a3b8' },
  { key: 'Carved', label: 'Carved', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
  { key: 'Runed', label: 'Runed', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
  { key: 'Gilded', label: 'Gilded', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', text: '#facc15' },
] as const;

const EMPTY_SLOT: VaultSlot = { unlocked: false, ilvl: 0 };

const crestInputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '4px 6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  outline: 'none',
  width: '52px',
  textAlign: 'center',
};

// ─── Helper: render a single vault cell ───

function VaultCell({ slot }: { slot: VaultSlot }) {
  const unlocked = slot.unlocked;
  return (
    <div
      style={{
        backgroundColor: unlocked ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${unlocked ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '6px',
        padding: '8px 4px',
        textAlign: 'center',
        minWidth: '48px',
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: unlocked ? 700 : 400,
          color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
        }}
      >
        {unlocked ? slot.ilvl : '\u2014'}
      </span>
    </div>
  );
}

// ─── Great Vault section ───

function GreatVault({ vaultData }: { vaultData: VaultResponse | null }) {
  const slots = vaultData?.calculated_slots ?? null;

  return (
    <SectionCard title="Great Vault">
      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr 1fr 1fr',
          gap: '6px',
          marginBottom: '6px',
        }}
      >
        <div />
        {['Slot 1', 'Slot 2', 'Slot 3'].map((label) => (
          <div
            key={label}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {VAULT_ROWS.map((row) => {
          const rowSlots: VaultSlot[] = [];
          const sourceSlots = slots ? slots[row.key] : [];
          for (let i = 0; i < 3; i++) {
            if (i < row.maxSlots && sourceSlots && sourceSlots[i]) {
              rowSlots.push(sourceSlots[i]);
            } else {
              rowSlots.push(EMPTY_SLOT);
            }
          }

          return (
            <div
              key={row.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr 1fr 1fr',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {/* Row label */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: row.color,
                }}
              >
                {row.label}
              </div>

              {/* 3 slot cells */}
              {rowSlots.map((slot, i) => (
                <VaultCell key={i} slot={slot} />
              ))}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─── Crests section ───

interface CrestsProps {
  crestsData: CrestsResponse | null;
  characterId: number;
  guildId: string;
  currentWeek: number;
}

function Crests({ crestsData, characterId, guildId, currentWeek }: CrestsProps) {
  const cap = crestsData?.crest_cap ?? 100;
  const cumulativeCap = currentWeek >= 1 ? 100 * currentWeek : 0;

  // Local state for each crest type's weekly collected value
  const [localValues, setLocalValues] = useState<Record<string, number>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize local values from crestsData
  useEffect(() => {
    const values: Record<string, number> = {};
    for (const crest of CREST_TYPES) {
      const data = crestsData?.crests?.[crest.key] ?? null;
      values[crest.key] = data?.current_week?.collected ?? 0;
    }
    setLocalValues(values);
  }, [crestsData]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of Object.values(debounceTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  const saveCrest = useCallback(
    async (crestType: string, collected: number) => {
      try {
        await progressApi.post(
          `/guilds/${guildId}/characters/${characterId}/crests`,
          {
            crest_type: crestType,
            week_number: currentWeek,
            collected,
          },
        );
      } catch (err) {
        console.error('Failed to save crest:', err);
      }
    },
    [guildId, characterId, currentWeek],
  );

  const handleChange = (crestKey: string, value: number) => {
    const clamped = Math.min(cap, Math.max(0, value));
    setLocalValues((prev) => ({ ...prev, [crestKey]: clamped }));

    // Debounce the save
    if (debounceTimers.current[crestKey]) {
      clearTimeout(debounceTimers.current[crestKey]);
    }
    debounceTimers.current[crestKey] = setTimeout(() => {
      saveCrest(crestKey, clamped);
    }, 500);
  };

  const handleBlur = (crestKey: string) => {
    // Clear pending debounce and save immediately
    if (debounceTimers.current[crestKey]) {
      clearTimeout(debounceTimers.current[crestKey]);
      delete debounceTimers.current[crestKey];
    }
    saveCrest(crestKey, localValues[crestKey] ?? 0);
  };

  return (
    <SectionCard title="Crests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CREST_TYPES.map((crest) => {
          const data = crestsData?.crests?.[crest.key] ?? null;
          const totalCollected = data?.total_collected ?? 0;
          const weekValue = localValues[crest.key] ?? 0;

          return (
            <div
              key={crest.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: crest.bg,
                border: `1px solid ${crest.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              {/* Colored dot */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: crest.text,
                  flexShrink: 0,
                }}
              />

              {/* Label */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: crest.text,
                  flex: 1,
                }}
              >
                {crest.label}
              </span>

              {/* Editable week collected / cap */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min={0}
                  max={cap}
                  value={weekValue}
                  onChange={(e) =>
                    handleChange(crest.key, parseInt(e.target.value, 10) || 0)
                  }
                  onBlur={() => handleBlur(crest.key)}
                  style={crestInputStyle}
                />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
                  / {cap}
                </span>
              </div>

              {/* Cumulative total / cap */}
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.35)',
                  minWidth: '70px',
                  textAlign: 'right',
                }}
              >
                {totalCollected}{cumulativeCap > 0 ? ` / ${cumulativeCap}` : ''} total
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─── Main export ───

export function VaultAndCrests({ vaultData, crestsData, characterId, guildId, currentWeek }: VaultAndCrestsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      <GreatVault vaultData={vaultData} />
      <Crests
        crestsData={crestsData}
        characterId={characterId}
        guildId={guildId}
        currentWeek={currentWeek}
      />
    </div>
  );
}
