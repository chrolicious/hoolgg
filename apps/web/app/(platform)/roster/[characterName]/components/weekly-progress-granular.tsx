'use client';

import React, { useState, useEffect } from 'react';
import { Button, Icon } from '@hool/design-system';
import { progressApi } from '../../../../lib/api';
import { SectionCard } from './section-card';
import { buildBtnStyle } from '../utils';
import type { VaultResponse } from '../types';

interface WeeklyProgressGranularProps {
  vaultData: VaultResponse | null;
  characterId: number;
  currentWeek: number;
  classColor: string;
  onVaultUpdate: () => void;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  width: '64px',
  textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '4px',
};

const columnHeadingStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.8)',
  margin: '0 0 12px 0',
};

export function WeeklyProgressGranular({
  vaultData,
  characterId,
  currentWeek,
  classColor,
  onVaultUpdate,
}: WeeklyProgressGranularProps) {
  const progress = vaultData?.progress;

  const [raidLfr, setRaidLfr] = useState<number>(progress?.raid_lfr ?? 0);
  const [raidNormal, setRaidNormal] = useState<number>(progress?.raid_normal ?? 0);
  const [raidHeroic, setRaidHeroic] = useState<number>(progress?.raid_heroic ?? 0);
  const [raidMythic, setRaidMythic] = useState<number>(progress?.raid_mythic ?? 0);

  const [mplusRuns, setMplusRuns] = useState<Array<{ keyLevel: number }>>(() => {
    if (progress?.m_plus_runs && progress.m_plus_runs.length > 0) {
      return progress.m_plus_runs.map((level) => ({ keyLevel: level }));
    }
    return [];
  });

  const [delveRuns, setDelveRuns] = useState<Array<{ tier: number }>>(() => {
    if (progress?.delve_runs && progress.delve_runs.length > 0) {
      return progress.delve_runs.map((tier: number) => ({ tier }));
    } else if (progress?.highest_delve && progress.highest_delve > 0) {
      // Fall back to legacy highest_delve field
      return [{ tier: progress.highest_delve }];
    }
    return [];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Re-sync state when vaultData changes externally
  useEffect(() => {
    const p = vaultData?.progress;
    setRaidLfr(p?.raid_lfr ?? 0);
    setRaidNormal(p?.raid_normal ?? 0);
    setRaidHeroic(p?.raid_heroic ?? 0);
    setRaidMythic(p?.raid_mythic ?? 0);
    if (p?.m_plus_runs && p.m_plus_runs.length > 0) {
      setMplusRuns(p.m_plus_runs.map((level) => ({ keyLevel: level })));
    } else {
      setMplusRuns([]);
    }
    if (p?.delve_runs && p.delve_runs.length > 0) {
      setDelveRuns(p.delve_runs.map((tier: number) => ({ tier })));
    } else if (p?.highest_delve && p.highest_delve > 0) {
      setDelveRuns([{ tier: p.highest_delve }]);
    } else {
      setDelveRuns([]);
    }
  }, [vaultData]);

  // Auto-clear save status after 2 seconds
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const addRun = () => {
    if (mplusRuns.length < 8) {
      setMplusRuns((prev) => [...prev, { keyLevel: 0 }]);
    }
  };

  const removeRun = (index: number) => {
    setMplusRuns((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRunKeyLevel = (index: number, value: number) => {
    setMplusRuns((prev) =>
      prev.map((run, i) => (i === index ? { keyLevel: value } : run))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await progressApi.post(`/users/me/characters/${characterId}/vault`, {
        week_number: currentWeek,
        raid_lfr: raidLfr,
        raid_normal: raidNormal,
        raid_heroic: raidHeroic,
        raid_mythic: raidMythic,
        m_plus_runs: mplusRuns.map((r) => r.keyLevel).filter((k) => k > 0),
        delve_runs: delveRuns.map((r) => r.tier).filter((t) => t > 0),
      });

      setSaveStatus('saved');
      onVaultUpdate();
    } catch (err) {
      console.error('Failed to save weekly progress:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const btnStyle = buildBtnStyle(classColor);

  return (
    <SectionCard
      title="Weekly Progress"
      subtitle="Input your weekly raid, M+ and delve data"
    >
      {/* Remove number input spinners */}
      <style>{`
        .wpg-input::-webkit-inner-spin-button,
        .wpg-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .wpg-input { -moz-appearance: textfield; }
      `}</style>

      {/* 3-column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '20px',
      }}>

        {/* Column 1: Raid Bosses Killed */}
        <div>
          <h3 style={columnHeadingStyle}>Raid Bosses Killed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'LFR', value: raidLfr, set: setRaidLfr },
              { label: 'Normal', value: raidNormal, set: setRaidNormal },
              { label: 'Heroic', value: raidHeroic, set: setRaidHeroic },
              { label: 'Mythic', value: raidMythic, set: setRaidMythic },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ ...labelStyle, marginBottom: 0, minWidth: '52px' }}>{label}</label>
                <input
                  type="number"
                  className="wpg-input"
                  min={0}
                  value={value}
                  onChange={(e) => set(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  onFocus={(e) => e.target.select()}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: M+ Dungeons */}
        <div>
          <h3 style={columnHeadingStyle}>M+ Dungeons</h3>

          {mplusRuns.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {mplusRuns.map((run, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: '36px' }}>
                    #{index + 1}
                  </span>
                  <input
                    type="number"
                    className="wpg-input"
                    min={0}
                    placeholder="Key"
                    value={run.keyLevel || ''}
                    onChange={(e) =>
                      updateRunKeyLevel(index, Math.max(0, parseInt(e.target.value, 10) || 0))
                    }
                    onFocus={(e) => e.target.select()}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => removeRun(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.3)',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.8)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }}
                    aria-label={`Remove run ${index + 1}`}
                  >
                    <Icon name="x-mark" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {mplusRuns.length < 8 && (
            <Button variant="primary" size="sm" onClick={addRun} style={btnStyle}>
              Add Run
            </Button>
          )}

          {mplusRuns.length === 0 && (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '8px 0 0 0' }}>
              No runs yet.
            </p>
          )}
        </div>

        {/* Column 3: Delves */}
        <div>
          <h3 style={columnHeadingStyle}>Delves</h3>

          {delveRuns.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {delveRuns.map((run, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: '36px' }}>
                    #{index + 1}
                  </span>
                  <input
                    type="number"
                    className="wpg-input"
                    min={1}
                    max={11}
                    placeholder="Tier"
                    value={run.tier || ''}
                    onChange={(e) =>
                      setDelveRuns((prev) =>
                        prev.map((r, i) =>
                          i === index ? { tier: Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)) } : r
                        )
                      )
                    }
                    onFocus={(e) => e.target.select()}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setDelveRuns((prev) => prev.filter((_, i) => i !== index))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.8)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; }}
                    aria-label={`Remove delve ${index + 1}`}
                  >
                    <Icon name="x-mark" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {delveRuns.length < 8 && (
            <Button variant="primary" size="sm" onClick={() => setDelveRuns((prev) => [...prev, { tier: 0 }])} style={btnStyle}>
              Add Run
            </Button>
          )}

          {delveRuns.length === 0 && (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '8px 0 0 0' }}>
              No runs yet.
            </p>
          )}
        </div>
      </div>

      {/* Save Button and Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
          style={btnStyle}
        >
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>

        {saveStatus === 'saved' && (
          <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>
            Progress saved successfully
          </span>
        )}
        {saveStatus === 'error' && (
          <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 500 }}>
            Failed to save. Please try again.
          </span>
        )}
      </div>
    </SectionCard>
  );
}
