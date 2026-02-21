'use client';

import { useState, useEffect } from 'react';
import { Button, Icon } from '@hool/design-system';
import { progressApi } from '../../../../../../lib/api';
import { SectionCard } from './section-card';
import type { VaultResponse } from '../types';

interface WeeklyProgressGranularProps {
  vaultData: VaultResponse | null;
  characterId: number;
  guildId: string;
  currentWeek: number;
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
  width: '60px',
  textAlign: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '4px',
};

export function WeeklyProgressGranular({
  vaultData,
  characterId,
  guildId,
  currentWeek,
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
    if (progress?.highest_delve && progress.highest_delve > 0) {
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
    if (p?.highest_delve && p.highest_delve > 0) {
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

  const addDelveRun = () => {
    if (delveRuns.length < 8) {
      setDelveRuns((prev) => [...prev, { tier: 0 }]);
    }
  };

  const removeDelveRun = (index: number) => {
    setDelveRuns((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDelveTier = (index: number, value: number) => {
    setDelveRuns((prev) =>
      prev.map((run, i) => (i === index ? { tier: value } : run))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await progressApi.post(`/guilds/${guildId}/characters/${characterId}/vault`, {
        week_number: currentWeek,
        raid_lfr: raidLfr,
        raid_normal: raidNormal,
        raid_heroic: raidHeroic,
        raid_mythic: raidMythic,
        m_plus_runs: mplusRuns.map((r) => r.keyLevel).filter((k) => k > 0),
        highest_delve: delveRuns.length > 0
          ? Math.max(...delveRuns.map((r) => r.tier).filter((t) => t > 0), 0)
          : 0,
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

  return (
    <SectionCard
      title="Weekly Progress"
      subtitle="Input your weekly raid, M+ and delve data"
    >
      {/* Raid Bosses Killed */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          margin: '0 0 12px 0',
        }}>
          Raid Bosses Killed
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>LFR</label>
            <input
              type="number"
              min={0}
              value={raidLfr}
              onChange={(e) => setRaidLfr(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Normal</label>
            <input
              type="number"
              min={0}
              value={raidNormal}
              onChange={(e) => setRaidNormal(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Heroic</label>
            <input
              type="number"
              min={0}
              value={raidHeroic}
              onChange={(e) => setRaidHeroic(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Mythic</label>
            <input
              type="number"
              min={0}
              value={raidMythic}
              onChange={(e) => setRaidMythic(Math.max(0, parseInt(e.target.value, 10) || 0))}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* M+ Dungeons */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          margin: '0 0 12px 0',
        }}>
          M+ Dungeons
        </h3>

        {mplusRuns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {mplusRuns.map((run, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  minWidth: '50px',
                }}>
                  Run {index + 1}
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="Key level"
                  value={run.keyLevel || ''}
                  onChange={(e) =>
                    updateRunKeyLevel(index, Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  style={{ ...inputStyle, width: '80px' }}
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
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
                  }}
                  aria-label={`Remove run ${index + 1}`}
                >
                  <Icon name="x-mark" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {mplusRuns.length < 8 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={addRun}
          >
            Add Run
          </Button>
        )}

        {mplusRuns.length === 0 && (
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            margin: '8px 0 0 0',
          }}>
            No M+ runs added yet. Click "Add Run" to start tracking.
          </p>
        )}
      </div>

      {/* Delves */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          margin: '0 0 12px 0',
        }}>
          Delves
        </h3>

        {delveRuns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {delveRuns.map((run, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  minWidth: '50px',
                }}>
                  Run {index + 1}
                </span>
                <input
                  type="number"
                  min={1}
                  max={11}
                  placeholder="Tier"
                  value={run.tier || ''}
                  onChange={(e) =>
                    updateDelveTier(index, Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))
                  }
                  style={{ ...inputStyle, width: '80px' }}
                />
                <button
                  type="button"
                  onClick={() => removeDelveRun(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,100,100,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
                  }}
                  aria-label={`Remove delve run ${index + 1}`}
                >
                  <Icon name="x-mark" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {delveRuns.length < 8 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={addDelveRun}
          >
            Add Run
          </Button>
        )}

        {delveRuns.length === 0 && (
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.35)',
            margin: '8px 0 0 0',
          }}>
            No delve runs added yet. Click &quot;Add Run&quot; to start tracking.
          </p>
        )}
      </div>

      {/* Save Button and Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>

        {saveStatus === 'saved' && (
          <span style={{
            fontSize: '13px',
            color: '#4ade80',
            fontWeight: 500,
          }}>
            Progress saved successfully
          </span>
        )}
        {saveStatus === 'error' && (
          <span style={{
            fontSize: '13px',
            color: '#f87171',
            fontWeight: 500,
          }}>
            Failed to save. Please try again.
          </span>
        )}
      </div>
    </SectionCard>
  );
}
