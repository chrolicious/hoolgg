'use client';

import { useEffect, useState } from 'react';
import type { GearResponse, GearSlotData } from '../types';
import { SectionCard } from './section-card';

interface EquipmentGridProps {
  gearData: GearResponse | null;
  renderUrl?: string | null;
}

const LEFT_SLOTS = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist'] as const;
const RIGHT_SLOTS = ['hands', 'waist', 'legs', 'feet', 'ring1', 'ring2', 'trinket1', 'trinket2'] as const;
const WEAPON_SLOTS = ['main_hand', 'off_hand'] as const;

const SLOT_LABELS: Record<string, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder: 'Shoulder',
  back: 'Back',
  chest: 'Chest',
  wrist: 'Wrist',
  hands: 'Hands',
  waist: 'Waist',
  legs: 'Legs',
  feet: 'Feet',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  trinket1: 'Trinket 1',
  trinket2: 'Trinket 2',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
};

const TRACK_COLORS: Record<string, { bg: string; text: string }> = {
  Myth:        { bg: '#ff8000', text: '#000000' },
  Hero:        { bg: '#a335ee', text: '#ffffff' },
  Champion:    { bg: '#0070dd', text: '#ffffff' },
  Veteran:     { bg: '#1eff00', text: '#000000' },
  Explorer:    { bg: '#1eff00', text: '#000000' },
  Adventurer:  { bg: '#9d9d9d', text: '#ffffff' },
};

const QUALITY_COLORS: Record<string, string> = {
  LEGENDARY: '#ff8000',
  EPIC:      '#a335ee',
  RARE:      '#0070dd',
  UNCOMMON:  '#1eff00',
  COMMON:    '#9d9d9d',
  POOR:      '#9d9d9d',
};

interface SlotCardProps {
  slotKey: string;
  item: GearSlotData | undefined;
  alignRight?: boolean;
}

function SlotCard({ slotKey, item, alignRight = false }: SlotCardProps) {
  const [iconError, setIconError] = useState(false);
  const hasItem = item && item.ilvl > 0;
  const label = SLOT_LABELS[slotKey] ?? slotKey;
  const qualityColor = hasItem && item.quality ? (QUALITY_COLORS[item.quality] ?? '#9d9d9d') : '#333';
  const trackColor = hasItem && item.track ? TRACK_COLORS[item.track] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: alignRight ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(0,0,0,0.25)',
        border: `1px solid ${hasItem ? qualityColor + '50' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '6px',
        padding: '4px 6px',
        minHeight: '44px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Item icon */}
      <div
        style={{
          flexShrink: 0,
          width: '34px',
          height: '34px',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#111',
          border: `1px solid ${hasItem ? qualityColor + '80' : 'rgba(255,255,255,0.08)'}`,
          position: 'relative',
        }}
      >
        {hasItem && item.icon_url && !iconError ? (
          <img
            src={item.icon_url}
            alt={item.item_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setIconError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Text content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: alignRight ? 'right' : 'left',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.6px',
            lineHeight: 1,
            marginBottom: '3px',
          }}
        >
          {label}
        </div>

        {hasItem ? (
          <>
            <div
              style={{
                fontSize: '11px',
                color: hasItem && item.quality ? (QUALITY_COLORS[item.quality] ?? 'rgba(255,255,255,0.85)') : 'rgba(255,255,255,0.85)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexDirection: alignRight ? 'row-reverse' : 'row' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {item.ilvl}
              </span>

              {item.track && trackColor && (
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    backgroundColor: trackColor.bg,
                    color: trackColor.text,
                    borderRadius: '3px',
                    padding: '1px 4px',
                    lineHeight: '1.4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {item.track}
                </span>
              )}

              {item.sockets != null && item.sockets > 0 && (
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(100,200,255,0.2)',
                    color: '#64c8ff',
                    borderRadius: '3px',
                    padding: '1px 4px',
                    lineHeight: '1.4',
                  }}
                >
                  {item.sockets}S
                </span>
              )}

              {item.enchanted && (
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(160,100,255,0.2)',
                    color: '#c87dff',
                    borderRadius: '3px',
                    padding: '1px 4px',
                    lineHeight: '1.4',
                  }}
                >
                  E
                </span>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.18)',
              lineHeight: 1.2,
            }}
          >
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

export function EquipmentGrid({ gearData, renderUrl }: EquipmentGridProps) {
  const [renderError, setRenderError] = useState(false);

  // Responsive character model width
  // Uses min() to prevent layout breaks on smaller viewports
  const CHARACTER_MODEL_WIDTH = 560;
  const CHARACTER_MODEL_MAX_WIDTH = 'min(560px, 40vw)';

  useEffect(() => {
    const timer = setTimeout(() => {
      (window as any).$WowheadPower?.refreshLinks?.();
    }, 100);
    return () => clearTimeout(timer);
  }, [gearData]);

  // Reset render error if renderUrl changes (e.g. after sync)
  useEffect(() => {
    setRenderError(false);
  }, [renderUrl]);

  const characterRender = !renderError ? renderUrl : null;

  const parsedGear = gearData?.parsed_gear ?? {};
  const avgIlvl = gearData?.avg_ilvl ?? 0;

  // Count equipped slots
  const equippedCount = Object.values(parsedGear).filter(
    (s) => s && typeof s === 'object' && (s as GearSlotData).ilvl > 0
  ).length;

  const subtitleText = gearData
    ? `${equippedCount}/16 slots — Avg ${avgIlvl.toFixed(1)} ilvl`
    : 'No gear data';

  return (
    <SectionCard title="Equipment" subtitle={subtitleText}>
      {/* Main three-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr ${CHARACTER_MODEL_MAX_WIDTH} 1fr`,
          gap: '8px',
          alignItems: 'start',
        }}
      >
        {/* Left column: head, neck, shoulder, back, chest, wrist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {LEFT_SLOTS.map((slot) => (
            <SlotCard
              key={slot}
              slotKey={slot}
              item={parsedGear[slot] as GearSlotData | undefined}
              alignRight={false}
            />
          ))}
        </div>

        {/* Center column: character avatar + avg ilvl */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            overflow: 'hidden',
            marginTop: '-150px',
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* SVG filter for character outline effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <filter id="character-outline-filter" colorInterpolationFilters="sRGB">
                  {/* Black outline - dilate alpha channel by 3px */}
                  <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="dilated-black" />
                  <feFlood floodColor="black" result="black" />
                  <feComposite in="black" in2="dilated-black" operator="in" result="black-outline" />

                  {/* White outline - dilate alpha channel by 5px */}
                  <feMorphology operator="dilate" radius="5" in="SourceAlpha" result="dilated-white" />
                  <feFlood floodColor="white" result="white" />
                  <feComposite in="white" in2="dilated-white" operator="in" result="white-outline" />

                  {/* Stack layers: white outline (bottom), black outline (middle), original image (top) */}
                  <feMerge>
                    <feMergeNode in="white-outline" />
                    <feMergeNode in="black-outline" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {characterRender ? (
              <img
                src={characterRender}
                alt="Character"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% -5%',
                  display: 'block',
                  filter: 'url(#character-outline-filter)',
                }}
                onError={() => setRenderError(true)}
              />
            ) : (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          {/* Avg ilvl display */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {avgIlvl > 0 ? avgIlvl.toFixed(1) : '—'}
            </div>
            <div
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.5px',
                marginTop: '2px',
              }}
            >
              Avg ilvl
            </div>
          </div>
        </div>

        {/* Right column: hands, waist, legs, feet, ring1, ring2, trinket1, trinket2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {RIGHT_SLOTS.map((slot) => (
            <SlotCard
              key={slot}
              slotKey={slot}
              item={parsedGear[slot] as GearSlotData | undefined}
              alignRight={true}
            />
          ))}
        </div>
      </div>

      {/* Weapons row at bottom */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr ${CHARACTER_MODEL_MAX_WIDTH} 1fr`,
          gap: '8px',
          marginTop: '8px',
        }}
      >
        <SlotCard
          slotKey="main_hand"
          item={parsedGear['main_hand'] as GearSlotData | undefined}
          alignRight={false}
        />
        {/* Empty center spacer to align with avatar column */}
        <div />
        <SlotCard
          slotKey="off_hand"
          item={parsedGear['off_hand'] as GearSlotData | undefined}
          alignRight={true}
        />
      </div>
    </SectionCard>
  );
}
