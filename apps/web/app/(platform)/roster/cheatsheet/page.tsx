import type { CSSProperties } from 'react';

// Season 1 Cheat Sheet — static reference page, no API calls needed

const TRACK_COLOR: Record<string, string> = {
  Explorer: '#9d9d9d',
  Adventurer: '#c0c0c0',
  Veteran: '#1eff00',
  Champion: '#0070dd',
  Hero: '#a335ee',
  Myth: '#ff8000',
};

const GEAR_TRACKS = [
  {
    name: 'Explorer',
    maxIlvl: 213,
    steps: 8,
    crest: null as string | null,
    crestPerStep: 0,
    sources: 'Open World, Normal Dungeons',
  },
  {
    name: 'Adventurer',
    maxIlvl: 226,
    steps: 8,
    crest: 'Weathered',
    crestPerStep: 15,
    sources: 'Heroic Dungeons, World Quests, Delves T1–3',
  },
  {
    name: 'Veteran',
    maxIlvl: 239,
    steps: 8,
    crest: 'Dawncrest',
    crestPerStep: 15,
    sources: 'M0, LFR Raid, Delves T4–7',
  },
  {
    name: 'Champion',
    maxIlvl: 252,
    steps: 8,
    crest: 'Runed',
    crestPerStep: 15,
    sources: 'Normal Raid, M+2–5, World Boss, Delves T8',
  },
  {
    name: 'Hero',
    maxIlvl: 276,
    steps: 6,
    crest: 'Gilded',
    crestPerStep: 20,
    sources: 'Heroic Raid, M+6–9, PvP Quest',
  },
  {
    name: 'Myth',
    maxIlvl: 289,
    steps: 6,
    crest: 'Gilded',
    crestPerStep: 20,
    sources: 'Mythic Raid, M+10+, Sparks of Midnight',
  },
];

// Vault ilvls from vault_calculator.py
const MPLUS_VAULT = [
  { keys: '+2', vaultIlvl: 249, track: 'Champion' },
  { keys: '+3', vaultIlvl: 252, track: 'Champion' },
  { keys: '+4', vaultIlvl: 255, track: 'Hero' },
  { keys: '+5', vaultIlvl: 258, track: 'Hero' },
  { keys: '+6', vaultIlvl: 262, track: 'Hero' },
  { keys: '+7', vaultIlvl: 265, track: 'Hero' },
  { keys: '+8', vaultIlvl: 268, track: 'Hero' },
  { keys: '+9', vaultIlvl: 272, track: 'Myth' },
  { keys: '+10', vaultIlvl: 275, track: 'Myth' },
  { keys: '+11–12', vaultIlvl: 278, track: 'Myth' },
];

const MPLUS_SLOTS = [
  { slot: '1st slot', runs: 1, desc: 'Complete 1 key' },
  { slot: '2nd slot', runs: 4, desc: 'Complete 4 keys' },
  { slot: '3rd slot', runs: 8, desc: 'Complete 8 keys' },
];

const RAID_VAULT = [
  { difficulty: 'LFR', ilvl: 239, color: '#9d9d9d' },
  { difficulty: 'Normal', ilvl: 252, color: '#1eff00' },
  { difficulty: 'Heroic', ilvl: 265, color: '#0070dd' },
  { difficulty: 'Mythic', ilvl: 278, color: '#ff8000' },
];

// Key delve tiers for the vault
const DELVE_VAULT = [
  { tier: 'T4', ilvl: 242 },
  { tier: 'T5', ilvl: 246 },
  { tier: 'T7', ilvl: 252 },
  { tier: 'T8', ilvl: 255 },
  { tier: 'T9', ilvl: 258 },
  { tier: 'T11', ilvl: 265 },
];

const CREST_SOURCES = [
  {
    name: 'Weathered',
    color: '#9d9d9d',
    track: 'Adventurer',
    sources: ['Heroic Dungeons', 'World Quests', 'Delves T1–3'],
  },
  {
    name: 'Dawncrest',
    color: '#1eff00',
    track: 'Veteran',
    sources: ['M0', 'LFR Raid', 'Delves T4–7'],
  },
  {
    name: 'Runed',
    color: '#0070dd',
    track: 'Champion',
    sources: ['Normal Raid', 'M+2–5', 'Delves T8'],
  },
  {
    name: 'Gilded',
    color: '#ff8000',
    track: 'Hero / Myth',
    sources: ['Heroic Raid', 'M+6+', 'Mythic Raid', 'Delves T9–11'],
  },
];

const card: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
};

const sectionTitle: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: '0.75rem',
};

const th: CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  padding: '0 0.75rem 0.5rem 0',
  textAlign: 'left' as const,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const td: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'rgba(255,255,255,0.75)',
  padding: '0.5rem 0.75rem 0.5rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'middle',
};

export default function CheatSheetPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
          Season 1 Cheat Sheet
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Midnight Season 1 — gear sources, upgrade tracks & vault rewards ·{' '}
          <a
            href="https://docs.google.com/document/d/e/2PACX-1vTGkZ2Cjr0jlv90XqW9vy9VXsVucd-yMCgHdyCvX_kQfOrexNDAC7Lf3LifuhqxrcWqJ0W3zIhvK3ii/pub"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(139,92,246,0.8)', textDecoration: 'none' }}
          >
            Laria&apos;s Raider&apos;s Guide
          </a>
        </p>
      </div>

      {/* Gear Tracks — full width */}
      <section style={card}>
        <p style={sectionTitle}>Gear Tracks</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Track</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Max ilvl</th>
              <th style={th}>Steps</th>
              <th style={th}>Crest</th>
              <th style={{ ...th, textAlign: 'right' as const }}>Cost/step</th>
              <th style={th}>Sources</th>
            </tr>
          </thead>
          <tbody>
            {GEAR_TRACKS.map((t) => (
              <tr key={t.name}>
                <td style={{ ...td, paddingLeft: '0.5rem', borderLeft: `3px solid ${TRACK_COLOR[t.name]}` }}>
                  <span style={{ color: TRACK_COLOR[t.name], fontWeight: 700 }}>{t.name}</span>
                </td>
                <td style={{ ...td, textAlign: 'right' as const, fontWeight: 700, color: TRACK_COLOR[t.name] }}>
                  {t.maxIlvl}
                </td>
                <td style={td}>{t.steps}</td>
                <td style={td}>
                  {t.crest ? (
                    <span style={{ color: TRACK_COLOR[t.name] }}>{t.crest}</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                  )}
                </td>
                <td style={{ ...td, textAlign: 'right' as const }}>
                  {t.crestPerStep > 0 ? (
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>{t.crestPerStep}</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                  )}
                </td>
                <td style={{ ...td, color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{t.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Middle row: M+ vault + Raid vault + Delve vault */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>

        {/* M+ Vault */}
        <section style={card}>
          <p style={sectionTitle}>M+ Key → Vault ilvl</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Key</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Vault</th>
                <th style={th}>Track</th>
                <th style={{ ...th, color: 'rgba(255,255,255,0.2)', fontSize: '0.625rem' }}>Slots unlock at 1 / 4 / 8 runs</th>
              </tr>
            </thead>
            <tbody>
              {MPLUS_VAULT.map((row) => (
                <tr key={row.keys}>
                  <td style={{ ...td, fontWeight: 700, color: '#fff' }}>{row.keys}</td>
                  <td style={{ ...td, textAlign: 'right' as const, fontWeight: 700, color: TRACK_COLOR[row.track] }}>
                    {row.vaultIlvl}
                  </td>
                  <td style={{ ...td, color: TRACK_COLOR[row.track], fontSize: '0.75rem' }}>{row.track}</td>
                  <td style={td} />
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Raid Vault */}
        <section style={card}>
          <p style={sectionTitle}>Raid Vault</p>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', margin: '-0.25rem 0 0.75rem', fontStyle: 'italic' }}>
            Slots unlock at 2 / 4 / 6 kills
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Difficulty</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Vault</th>
              </tr>
            </thead>
            <tbody>
              {RAID_VAULT.map((row) => (
                <tr key={row.difficulty}>
                  <td style={{ ...td, color: row.color, fontWeight: 600 }}>{row.difficulty}</td>
                  <td style={{ ...td, textAlign: 'right' as const, fontWeight: 700, color: row.color }}>{row.ilvl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Delve Vault */}
        <section style={card}>
          <p style={sectionTitle}>Delve Vault</p>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.25)', margin: '-0.25rem 0 0.75rem', fontStyle: 'italic' }}>
            Slot unlocks at 1 run
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Tier</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Vault</th>
              </tr>
            </thead>
            <tbody>
              {DELVE_VAULT.map((row) => (
                <tr key={row.tier}>
                  <td style={{ ...td, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{row.tier}</td>
                  <td style={{ ...td, textAlign: 'right' as const, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{row.ilvl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Crest Sources — full width */}
      <section style={card}>
        <p style={sectionTitle}>Crest Sources <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'rgba(255,255,255,0.2)' }}>— 100/week cap · 20 crests per upgrade step</span></p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {CREST_SOURCES.map((crest) => (
            <div
              key={crest.name}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${crest.color}30`,
                borderTop: `3px solid ${crest.color}`,
                borderRadius: 8,
                padding: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 700, color: crest.color, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                {crest.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {crest.track} track
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {crest.sources.map((s) => (
                  <li key={s} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: crest.color, flexShrink: 0, opacity: 0.7 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
        Data based on Laria&apos;s Raider&apos;s Guide for Midnight. Some ilvl values may shift with tuning — verify against the guide.
        Vault ilvls from in-game data.
      </p>

    </div>
  );
}
