'use client';

import { useEffect } from 'react';
import type { GearResponse } from '../types';
import { GEAR_SLOT_ORDER, GEAR_SLOT_LABELS } from '../types';
import { SectionCard } from './section-card';

interface EquipmentGridProps {
  gearData: GearResponse | null;
}

const TRACK_COLORS: Record<string, string> = {
  Hero: '#a855f7',
  Myth: '#f59e0b',
  Champion: '#3b82f6',
  Veteran: '#22c55e',
  Explorer: '#6b7280',
  Adventurer: '#6b7280',
};

export function EquipmentGrid({ gearData }: EquipmentGridProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      (window as any).$WowheadPower?.refreshLinks?.();
    }, 100);
    return () => clearTimeout(timer);
  }, [gearData]);

  return (
    <SectionCard
      title="Equipment"
      subtitle={`Avg ilvl: ${gearData?.avg_ilvl?.toFixed(1) ?? '\u2014'}`}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {GEAR_SLOT_ORDER.map((slot) => {
          const item = gearData?.parsed_gear?.[slot];
          const hasItem = item && item.ilvl > 0;
          const label = GEAR_SLOT_LABELS[slot] ?? slot;

          return (
            <div
              key={slot}
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '4px',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </div>

              {hasItem ? (
                <>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                    }}
                  >
                    {item.item_id ? (
                      <a
                        href={`https://www.wowhead.com/item=${item.item_id}`}
                        data-wowhead={`item=${item.item_id}`}
                        target="_blank"
                        rel="noopener"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {item.item_name}
                      </a>
                    ) : (
                      item.item_name
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {item.ilvl}
                  </div>

                  {item.track && (
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#fff',
                        backgroundColor: TRACK_COLORS[item.track] ?? '#6b7280',
                        borderRadius: '9999px',
                        padding: '2px 6px',
                        lineHeight: '1.2',
                      }}
                    >
                      {item.track}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.2)',
                    marginTop: '4px',
                  }}
                >
                  Empty
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
