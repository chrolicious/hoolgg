'use client';

import type { SeasonResponse } from '../types';
import { SectionCard } from './section-card';

interface SeasonTimelineProps {
  seasonData: SeasonResponse;
  currentIlvl: number | null;
  selectedWeek?: number;
  onWeekSelect?: (week: number) => void;
}

export function SeasonTimeline({ seasonData, currentIlvl, selectedWeek, onWeekSelect }: SeasonTimelineProps) {
  const currentWeekData = seasonData.weeks.find((w) => w.is_current);

  const delta =
    currentIlvl !== null ? currentIlvl - seasonData.current_target_ilvl : null;

  const deltaLabel =
    delta !== null
      ? delta >= 0
        ? `+${delta} ahead`
        : `${delta} behind`
      : null;

  const deltaColor =
    delta !== null
      ? delta >= 0
        ? '#22c55e'
        : '#ef4444'
      : 'rgba(255,255,255,0.5)';

  const formatDateRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `${fmt(start)} – ${fmt(end)}`;
  };

  // Use the displayed week info (selected or current)
  const displayedWeek = selectedWeek !== undefined
    ? seasonData.weeks.find((w) => w.week_number === selectedWeek)
    : currentWeekData;

  return (
    <SectionCard title="Season Timeline">
      {/* Scrollable week boxes */}
      <div
        style={{
          overflowX: 'auto',
          display: 'flex',
          gap: '6px',
          scrollbarWidth: 'none',
          paddingBottom: '4px',
        }}
      >
        {seasonData.weeks.map((week) => {
          const isCurrent = week.is_current;
          const isSelected = selectedWeek !== undefined && week.week_number === selectedWeek;
          const isClickable = !!onWeekSelect;

          return (
            <div
              key={week.week_number}
              onClick={isClickable ? () => onWeekSelect(week.week_number) : undefined}
              style={{
                width: '60px',
                minWidth: '60px',
                height: '48px',
                borderRadius: '8px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isClickable ? 'pointer' : 'default',
                backgroundColor: isSelected
                  ? 'rgba(59,130,246,0.3)'
                  : isCurrent
                    ? 'rgba(124,58,237,0.3)'
                    : 'rgba(0,0,0,0.2)',
                border: isSelected
                  ? '2px solid rgba(59,130,246,0.6)'
                  : isCurrent
                    ? '1px solid rgba(124,58,237,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  color: isSelected
                    ? 'rgba(147,197,253,0.9)'
                    : isCurrent
                      ? 'rgba(167,139,250,0.9)'
                      : 'rgba(255,255,255,0.4)',
                  lineHeight: 1,
                }}
              >
                {week.week_number < 0
                  ? `Pre${week.week_number}`
                  : week.week_number === 0
                    ? 'Pre'
                    : `W${week.week_number}`}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isSelected || isCurrent ? '#fff' : 'rgba(255,255,255,0.7)',
                  lineHeight: 1.3,
                }}
              >
                {week.target_ilvl}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current / selected week info */}
      {displayedWeek && (
        <div style={{ marginTop: '12px' }}>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 4px 0',
            }}
          >
            {displayedWeek.name} &middot;{' '}
            {formatDateRange(displayedWeek.start_date)}
            {selectedWeek !== undefined && selectedWeek !== seasonData.current_week && (
              <span style={{ color: 'rgba(147,197,253,0.7)', marginLeft: '8px' }}>
                (viewing)
              </span>
            )}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}
          >
            Target:{' '}
            <span style={{ fontWeight: 700, color: '#fff' }}>
              {seasonData.current_target_ilvl} ilvl
            </span>
            {currentIlvl !== null && (
              <>
                {' '}
                &middot; Your avg:{' '}
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  {currentIlvl} ilvl
                </span>
                {deltaLabel && (
                  <>
                    {' '}
                    &middot;{' '}
                    <span style={{ fontWeight: 700, color: deltaColor }}>
                      {deltaLabel}
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
