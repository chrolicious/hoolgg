'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Select, Checkbox, Button } from '@hool/design-system';
import { SectionCard } from './section-card';
import { progressApi } from '../../../../lib/api';
import type {
  ProfessionsResponse,
  ProfessionWeeklyProgress,
} from '../types';
import { AVAILABLE_PROFESSIONS } from '../types';

interface ProfessionsSectionProps {
  professionsData: ProfessionsResponse | null;
  characterId: number;
  currentWeek: number;
}

const professionOptions = AVAILABLE_PROFESSIONS.map((p) => ({
  value: p,
  label: p,
}));

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  width: '80px',
};

export function ProfessionsSection({
  professionsData,
  characterId,
  currentWeek,
}: ProfessionsSectionProps) {
  // Initialize profession slots from data
  const initialProf1 =
    professionsData?.professions.find((p) => p.profession.slot_index === 0)
      ?.profession.profession_name ?? '';
  const initialProf2 =
    professionsData?.professions.find((p) => p.profession.slot_index === 1)
      ?.profession.profession_name ?? '';

  const [prof1, setProf1] = useState<string>(initialProf1);
  const [prof2, setProf2] = useState<string>(initialProf2);
  const [isSaving, setIsSaving] = useState(false);

  // Build initial progress map from existing data
  const buildInitialProgress = (): Record<string, ProfessionWeeklyProgress> => {
    const map: Record<string, ProfessionWeeklyProgress> = {};
    if (professionsData) {
      for (const entry of professionsData.professions) {
        if (entry.weekly_progress) {
          map[entry.profession.profession_name] = entry.weekly_progress;
        }
      }
    }
    return map;
  };

  const [progress, setProgress] = useState<
    Record<string, ProfessionWeeklyProgress>
  >(buildInitialProgress);

  // Debounce timers for number inputs
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of Object.values(debounceTimers.current)) {
        clearTimeout(timer);
      }
    };
  }, []);

  const saveProfessions = async () => {
    setIsSaving(true);
    try {
      await progressApi.put(
        `/users/me/characters/${characterId}/professions`,
        {
          professions: [prof1, prof2].filter(Boolean),
        },
      );
    } catch (err) {
      console.error('Failed to save professions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveProgress = useCallback(
    async (
      professionName: string,
      updates: Partial<ProfessionWeeklyProgress>,
    ) => {
      const current = progress[professionName];
      const payload = {
        profession_name: professionName,
        week_number: currentWeek,
        weekly_quest: updates.weekly_quest ?? current?.weekly_quest ?? false,
        patron_orders: updates.patron_orders ?? current?.patron_orders ?? false,
        treatise: updates.treatise ?? current?.treatise ?? false,
        knowledge_points:
          updates.knowledge_points ?? current?.knowledge_points ?? 0,
        concentration: updates.concentration ?? current?.concentration ?? 0,
      };

      try {
        await progressApi.post(
          `/users/me/characters/${characterId}/professions/progress`,
          payload,
        );
      } catch (err) {
        console.error('Failed to save profession progress:', err);
      }
    },
    [characterId, currentWeek, progress],
  );

  const handleCheckboxChange = (
    professionName: string,
    field: 'weekly_quest' | 'patron_orders' | 'treatise',
    value: boolean,
  ) => {
    setProgress((prev) => {
      const current = prev[professionName] ?? {
        id: 0,
        character_id: characterId,
        profession_name: professionName,
        week_number: currentWeek,
        weekly_quest: false,
        patron_orders: false,
        treatise: false,
        knowledge_points: 0,
        concentration: 0,
      };
      return {
        ...prev,
        [professionName]: { ...current, [field]: value },
      };
    });

    saveProgress(professionName, { [field]: value });
  };

  const handleNumberChange = (
    professionName: string,
    field: 'knowledge_points' | 'concentration',
    value: number,
  ) => {
    setProgress((prev) => {
      const current = prev[professionName] ?? {
        id: 0,
        character_id: characterId,
        profession_name: professionName,
        week_number: currentWeek,
        weekly_quest: false,
        patron_orders: false,
        treatise: false,
        knowledge_points: 0,
        concentration: 0,
      };
      return {
        ...prev,
        [professionName]: { ...current, [field]: value },
      };
    });

    // Debounce the save
    const timerKey = `${professionName}-${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
    }
    debounceTimers.current[timerKey] = setTimeout(() => {
      saveProgress(professionName, { [field]: value });
    }, 500);
  };

  const handleNumberBlur = (
    professionName: string,
    field: 'knowledge_points' | 'concentration',
  ) => {
    // Clear pending debounce and save immediately
    const timerKey = `${professionName}-${field}`;
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey]);
      delete debounceTimers.current[timerKey];
    }

    const current = progress[professionName];
    if (current) {
      saveProgress(professionName, { [field]: current[field] });
    }
  };

  const assignedProfessions = [prof1, prof2].filter(Boolean);

  return (
    <SectionCard title="Professions">
      {/* Profession selectors */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <Select
            options={professionOptions}
            value={prof1}
            onChange={(val) => setProf1(val)}
            placeholder="Select profession..."
            size="sm"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Select
            options={professionOptions}
            value={prof2}
            onChange={(val) => setProf2(val)}
            placeholder="Select profession..."
            size="sm"
          />
        </div>
        <Button
          size="sm"
          onClick={saveProfessions}
          disabled={isSaving}
          loading={isSaving}
        >
          Save
        </Button>
      </div>

      {/* Per-profession panels */}
      {assignedProfessions.map((profName) => {
        const profProgress = progress[profName] ?? {
          id: 0,
          character_id: characterId,
          profession_name: profName,
          week_number: currentWeek,
          weekly_quest: false,
          patron_orders: false,
          treatise: false,
          knowledge_points: 0,
          concentration: 0,
        };

        return (
          <div
            key={profName}
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '12px',
              }}
            >
              {profName}
            </div>

            {/* Checkboxes + Number inputs in a single row */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Checkbox
                checked={profProgress.weekly_quest}
                onChange={(checked) =>
                  handleCheckboxChange(profName, 'weekly_quest', checked)
                }
                label="Weekly Quest"
                size="sm"
              />
              <Checkbox
                checked={profProgress.patron_orders}
                onChange={(checked) =>
                  handleCheckboxChange(profName, 'patron_orders', checked)
                }
                label="Patron Orders"
                size="sm"
              />
              <Checkbox
                checked={profProgress.treatise}
                onChange={(checked) =>
                  handleCheckboxChange(profName, 'treatise', checked)
                }
                label="Treatise"
                size="sm"
              />

              <div
                style={{
                  width: '1px',
                  height: '20px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  flexShrink: 0,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  KP:
                </label>
                <input
                  type="number"
                  min={0}
                  value={profProgress.knowledge_points}
                  onChange={(e) =>
                    handleNumberChange(
                      profName,
                      'knowledge_points',
                      parseInt(e.target.value, 10) || 0,
                    )
                  }
                  onBlur={() => handleNumberBlur(profName, 'knowledge_points')}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Conc:
                </label>
                <input
                  type="number"
                  min={0}
                  value={profProgress.concentration}
                  onChange={(e) =>
                    handleNumberChange(
                      profName,
                      'concentration',
                      parseInt(e.target.value, 10) || 0,
                    )
                  }
                  onBlur={() => handleNumberBlur(profName, 'concentration')}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        );
      })}

      {assignedProfessions.length === 0 && (
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            margin: 0,
            textAlign: 'center',
            padding: '12px 0',
          }}
        >
          No professions assigned. Select professions above and save.
        </p>
      )}
    </SectionCard>
  );
}
