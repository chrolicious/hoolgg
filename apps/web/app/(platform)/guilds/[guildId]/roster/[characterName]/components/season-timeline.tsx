'use client';

import type { SeasonResponse, TasksSummaryResponse } from '../types';
import { Icon } from '@hool/design-system';
import { SectionCard } from './section-card';

interface SeasonTimelineProps {
  seasonData: SeasonResponse;
  currentIlvl: number | null;
  selectedWeek?: number;
  onWeekSelect?: (week: number) => void;
  tasksSummary?: TasksSummaryResponse | null;
}

export function SeasonTimeline({ seasonData, currentIlvl, selectedWeek, onWeekSelect, tasksSummary }: SeasonTimelineProps) {
  const currentWeekData = seasonData.weeks.find((w) => w.is_current);

  const delta =
    currentIlvl !== null ? currentIlvl - seasonData.current_target_ilvl : null;

  const deltaLabel =
    delta !== null
      ? delta >= 0
        ? `+${delta.toFixed(1)} ahead`
        : `${delta.toFixed(1)} behind`
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
          overflowY: 'visible',
          display: 'flex',
          gap: '6px',
          scrollbarWidth: 'none',
          paddingTop: '6px',
          paddingBottom: '4px',
        }}
      >
        {seasonData.weeks.map((week) => {
          const isCurrent = week.is_current;
          const isSelected = selectedWeek !== undefined && week.week_number === selectedWeek;
          const isClickable = !!onWeekSelect;
          const weekSummary = tasksSummary?.weeks?.[String(week.week_number)];
          const allDone = weekSummary?.all_done ?? false;

          return (
            <div
              key={week.week_number}
              onClick={isClickable ? () => onWeekSelect(week.week_number) : undefined}
              style={{
                position: 'relative',
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
                backgroundColor: allDone
                  ? 'rgba(34,197,94,0.15)'
                  : isSelected
                    ? 'rgba(59,130,246,0.3)'
                    : isCurrent
                      ? 'rgba(124,58,237,0.3)'
                      : 'rgba(0,0,0,0.2)',
                border: allDone
                  ? '1px solid rgba(34,197,94,0.4)'
                  : isSelected
                    ? '2px solid rgba(59,130,246,0.6)'
                    : isCurrent
                      ? '1px solid rgba(124,58,237,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            >
              {allDone && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '9999px',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="check" size={9} />
                </div>
              )}
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
