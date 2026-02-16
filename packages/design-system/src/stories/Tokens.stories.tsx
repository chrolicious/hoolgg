import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { colors } from '../tokens/colors';
import { shadows } from '../tokens/shadows';
import { borderRadius } from '../tokens/borders';

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: color,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
      <div>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#888', fontSize: 11 }}>{color}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2
        style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 16,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function TokenShowcase() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1
        style={{
          color: '#fff',
          fontSize: 32,
          fontWeight: 900,
          marginBottom: 8,
          letterSpacing: -0.5,
        }}
      >
        hool.gg Design Tokens
      </h1>
      <p style={{ color: '#A8A3B3', fontSize: 14, marginBottom: 48 }}>
        Purple + Gold — Epic Tier palette
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
        <Section title="Backgrounds">
          <Swatch color={colors.bg.base} label="bg-base" />
          <Swatch color={colors.bg.surface} label="bg-surface" />
          <Swatch color={colors.bg.elevated} label="bg-elevated" />
          <Swatch color={colors.bg.overlay} label="bg-overlay" />
        </Section>

        <Section title="Purple">
          <Swatch color={colors.purple[900]} label="purple-900" />
          <Swatch color={colors.purple[700]} label="purple-700" />
          <Swatch color={colors.purple[500]} label="purple-500" />
          <Swatch color={colors.purple[400]} label="purple-400" />
          <Swatch color={colors.purple[200]} label="purple-200" />
        </Section>

        <Section title="Gold">
          <Swatch color={colors.gold[900]} label="gold-900" />
          <Swatch color={colors.gold[700]} label="gold-700" />
          <Swatch color={colors.gold[500]} label="gold-500" />
          <Swatch color={colors.gold[400]} label="gold-400" />
          <Swatch color={colors.gold[200]} label="gold-200" />
        </Section>

        <Section title="Text">
          <Swatch color={colors.text.primary} label="text-primary" />
          <Swatch color={colors.text.secondary} label="text-secondary" />
          <Swatch color={colors.text.muted} label="text-muted" />
          <Swatch color={colors.text.onGold} label="text-on-gold" />
        </Section>

        <Section title="Semantic">
          <Swatch color={colors.semantic.success} label="success" />
          <Swatch color={colors.semantic.error} label="error" />
          <Swatch color={colors.semantic.info} label="info" />
          <Swatch color={colors.semantic.warning} label="warning" />
        </Section>

        <Section title="Slate">
          <Swatch color={colors.slate[500]} label="slate-500" />
          <Swatch color={colors.slate[400]} label="slate-400" />
        </Section>

        <Section title="Cream &amp; Sticker">
          <Swatch color={colors.cream} label="cream" />
          <Swatch color={colors.sticker.border} label="sticker-border" />
          <Swatch color={colors.sticker.outline} label="sticker-outline" />
        </Section>

        <Section title="WoW Class Colors">
          <Swatch color={colors.class.warrior} label="warrior" />
          <Swatch color={colors.class.paladin} label="paladin" />
          <Swatch color={colors.class.hunter} label="hunter" />
          <Swatch color={colors.class.rogue} label="rogue" />
          <Swatch color={colors.class.priest} label="priest" />
          <Swatch color={colors.class.mage} label="mage" />
          <Swatch color={colors.class.warlock} label="warlock" />
          <Swatch color={colors.class.monk} label="monk" />
          <Swatch color={colors.class.demonhunter} label="demonhunter" />
        </Section>

        <Section title="Item Rarity">
          <Swatch color={colors.rarity.common} label="common" />
          <Swatch color={colors.rarity.uncommon} label="uncommon" />
          <Swatch color={colors.rarity.rare} label="rare" />
          <Swatch color={colors.rarity.epic} label="epic" />
          <Swatch color={colors.rarity.legendary} label="legendary" />
          <Swatch color={colors.rarity.mythic} label="mythic" />
        </Section>

        <Section title="UI Colors">
          <Swatch color={colors.ui.black} label="black" />
          <Swatch color={colors.ui.white} label="white" />
          <Swatch color={colors.ui.red} label="red" />
          <Swatch color={colors.ui.orange} label="orange" />
          <Swatch color={colors.ui.yellow} label="yellow" />
          <Swatch color={colors.ui.green} label="green" />
        </Section>

        <Section title="Borders">
          {Object.entries(borderRadius).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: value,
                  border: '2px solid rgba(255,255,255,0.2)',
                  backgroundColor: colors.bg.elevated,
                }}
              />
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{key}</div>
                <div style={{ color: '#888', fontSize: 11 }}>{value}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Shadows">
          {Object.entries(shadows).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.bg.elevated,
                  boxShadow: value,
                }}
              />
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{key}</div>
                <div style={{ color: '#888', fontSize: 11, maxWidth: 200 }}>{value}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Typography">
          <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: -0.5 }}>Display</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: -0.5 }}>Heading 1</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: -0.3 }}>Heading 2</div>
          <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700, letterSpacing: -0.3 }}>Heading 3</div>
          <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 400, marginTop: 8 }}>Body — Regular weight for content</div>
          <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, marginTop: 4 }}>Body Strong — Semibold emphasis</div>
          <div style={{ color: '#A8A3B3', fontSize: '0.75rem', fontWeight: 500, marginTop: 4 }}>Small — Captions and metadata</div>
          <div style={{ color: '#6B6578', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>Tiny — Badges and labels</div>
        </Section>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundation/Tokens',
  component: TokenShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {};
