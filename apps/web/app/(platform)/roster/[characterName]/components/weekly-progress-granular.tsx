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

export function WeeklyProgressGranular({
  vaultData,
  characterId,
  currentWeek,
  classColor,
  onVaultUpdate,
}: WeeklyProgressGranularProps) {
  const progress = vaultData?.progress;

  const [delveRuns, setDelveRuns] = useState<Array<{ tier: number }>>(() => {
    if (progress?.delve_runs && progress.delve_runs.length > 0) {
      return progress.delve_runs.map((tier: number) => ({ tier }));
    } else if (progress?.highest_delve && progress.highest_delve > 0) {
      return [{ tier: progress.highest_delve }];
    }
    return [];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const p = vaultData?.progress;
    if (p?.delve_runs && p.delve_runs.length > 0) {
      setDelveRuns(p.delve_runs.map((tier: number) => ({ tier })));
    } else if (p?.highest_delve && p.highest_delve > 0) {
      setDelveRuns([{ tier: p.highest_delve }]);
    } else {
      setDelveRuns([]);
    }
  }, [vaultData]);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      await progressApi.post(`/users/me/characters/${characterId}/vault`, {
        week_number: currentWeek,
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
      title="Delve Runs"
      subtitle="Add each run and enter the delve tier (1-11)"
    >
      <style>{`
        .wpg-input::-webkit-inner-spin-button,
        .wpg-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .wpg-input { -moz-appearance: textfield; }
      `}</style>

      <div style={{ marginBottom: '16px' }}>
        {delveRuns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {delveRuns.map((run, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', minWidth: '48px' }}>
                  Run {index + 1}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
          style={btnStyle}
        >
          {isSaving ? 'Saving...' : 'Save Delves'}
        </Button>

        {saveStatus === 'saved' && (
          <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>
            Saved successfully
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
