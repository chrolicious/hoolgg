import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Input, type InputVariant, type InputSize } from '../components/primitives/Input';
import { InputWithLabel } from '../components/primitives/InputWithLabel';
import { InputWithArrows } from '../components/primitives/InputWithArrows';
import { InputWithDropdown } from '../components/primitives/InputWithDropdown';
import { Icon } from '../components/primitives/Icon';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'hero'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// --- Helpers ---

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        color: colors.text.muted,
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <SectionLabel>{title}</SectionLabel>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

const sizes: InputSize[] = ['sm', 'md', 'lg'];

// --- Stories ---

export const Playground: Story = {
  args: {
    placeholder: 'Enter your email...',
    variant: 'default',
    size: 'md',
    error: false,
    disabled: false,
    fullWidth: false,
  },
};

export const SimplePill: Story = {
  name: 'Simple Pill (Default)',
  render: () => (
    <div>
      <Section title="Sizes">
        <Input size="sm" placeholder="Small input" />
        <Input size="md" placeholder="Medium input" />
        <Input size="lg" placeholder="Large input" />
      </Section>

      <Section title="With Icons">
        <Input placeholder="Search..." icon={<Icon name="search" animation="none" />} />
        <Input placeholder="Email address" icon={<Icon name="mail" animation="none" />} />
        <Input
          placeholder="Password"
          type="password"
          icon={<Icon name="lock" animation="none" />}
          iconRight={<Icon name="eye" animation="none" />}
        />
      </Section>

      <Section title="States">
        <Input placeholder="Default" />
        <Input placeholder="Error state" error />
        <Input placeholder="Disabled" disabled />
        <Input placeholder="With value" defaultValue="user@example.com" />
      </Section>
    </div>
  ),
};

export const HeroVariant: Story = {
  name: 'Hero Variant (Chamfered)',
  render: () => (
    <div>
      <Section title="Hero — sharp corners top-left & bottom-right">
        <Input variant="hero" size="lg" placeholder="Enter your character name..." />
        <Input
          variant="hero"
          size="lg"
          placeholder="Search guilds..."
          icon={<Icon name="search" animation="none" />}
        />
      </Section>

      <Section title="Hero sizes">
        <Input variant="hero" size="sm" placeholder="Small hero" />
        <Input variant="hero" size="md" placeholder="Medium hero" />
        <Input variant="hero" size="lg" placeholder="Large hero" />
      </Section>

      <Section title="Hero states">
        <Input variant="hero" placeholder="Focus me for yellow outline!" />
        <Input variant="hero" placeholder="Error state" error />
        <Input variant="hero" placeholder="Disabled" disabled />
      </Section>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div>
      <Section title="Left icon">
        <Input icon={<Icon name="user" animation="none" />} placeholder="Username" />
        <Input icon={<Icon name="mail" animation="none" />} placeholder="Email" />
        <Input icon={<Icon name="lock" animation="none" />} placeholder="Password" type="password" />
      </Section>

      <Section title="Right icon">
        <Input iconRight={<Icon name="arrow-right" animation="none" />} placeholder="Go to..." />
        <Input iconRight={<Icon name="search" animation="none" />} placeholder="Search" />
      </Section>

      <Section title="Both icons">
        <Input
          icon={<Icon name="lock" animation="none" />}
          iconRight={<Icon name="eye" animation="none" />}
          placeholder="Password"
          type="password"
        />
        <Input
          icon={<Icon name="calendar" animation="none" />}
          iconRight={<Icon name="chevron-down" animation="none" />}
          placeholder="Select date"
        />
      </Section>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionLabel>Full width — stretches to container</SectionLabel>
      <Input fullWidth placeholder="Email address" icon={<Icon name="mail" animation="none" />} />
      <Input fullWidth placeholder="Password" type="password" icon={<Icon name="lock" animation="none" />} />
      <Input fullWidth variant="hero" placeholder="Character name" icon={<Icon name="user" animation="none" />} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div>
      <Section title="Default">
        <Input placeholder="Type here..." />
      </Section>

      <Section title="Hover (hover over me)">
        <Input placeholder="Hover to see halftone" />
      </Section>

      <Section title="Focus (click to focus)">
        <Input placeholder="Click me" autoFocus />
      </Section>

      <Section title="Error">
        <Input placeholder="Invalid input" error />
        <Input placeholder="Wrong email format" error icon={<Icon name="mail" animation="none" />} />
      </Section>

      <Section title="Disabled">
        <Input placeholder="Can't edit" disabled />
        <Input placeholder="Disabled with value" disabled defaultValue="Read only" />
      </Section>
    </div>
  ),
};

export const FormExample: Story = {
  name: 'Form Example',
  render: () => (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <h2
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.3px',
            marginBottom: 4,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            color: colors.text.muted,
            fontSize: '0.875rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Join the guild finder and recruitment platform
        </p>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            color: colors.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Character Name
        </label>
        <Input
          fullWidth
          variant="hero"
          placeholder="Enter your main character"
          icon={<Icon name="user" animation="none" />}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            color: colors.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Email
        </label>
        <Input
          fullWidth
          type="email"
          placeholder="you@example.com"
          icon={<Icon name="mail" animation="none" />}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            color: colors.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Password
        </label>
        <Input
          fullWidth
          type="password"
          placeholder="At least 8 characters"
          icon={<Icon name="lock" animation="none" />}
          iconRight={<Icon name="eye" animation="none" />}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const ConnectedLabel: Story = {
  name: 'Connected Label (Options Style)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
      <SectionLabel>Hover or focus — label and input merge into one pill</SectionLabel>

      <InputWithLabel
        label="Character Name"
        description="Your main character"
        placeholder="Enter name..."
      />

      <InputWithLabel
        label="Server"
        description="US or EU realm"
        placeholder="Select server..."
        icon={<Icon name="globe" animation="none" />}
      />

      <InputWithLabel
        label="Preferred Role"
        placeholder="Tank, Healer, DPS"
        icon={<Icon name="shield" animation="none" />}
      />

      <InputWithLabel
        label="Item Level"
        description="Current max ilvl"
        type="number"
        placeholder="480"
      />
    </div>
  ),
};

export const ArrowSelector: Story = {
  name: 'Arrow Selector',
  render: () => {
    const [difficulty, setDifficulty] = React.useState('Normal');
    const [role, setRole] = React.useState('DPS');
    const [faction, setFaction] = React.useState('Alliance');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <SectionLabel>Click arrows to cycle through options</SectionLabel>

        <InputWithArrows
          label="Difficulty"
          description="Raid difficulty"
          options={['Normal', 'Heroic', 'Mythic']}
          value={difficulty}
          onChange={setDifficulty}
        />

        <InputWithArrows
          label="Preferred Role"
          options={['Tank', 'Healer', 'DPS']}
          value={role}
          onChange={setRole}
        />

        <InputWithArrows
          label="Faction"
          description="Alliance or Horde"
          options={['Alliance', 'Horde']}
          value={faction}
          onChange={setFaction}
        />
      </div>
    );
  },
};

export const DropdownSelector: Story = {
  name: 'Dropdown Selector',
  render: () => {
    const [server, setServer] = React.useState('');
    const [region, setRegion] = React.useState('');
    const [class_, setClass] = React.useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <SectionLabel>Click to open dropdown menu</SectionLabel>

        <InputWithDropdown
          label="Server"
          description="Select your realm"
          options={['Area 52', 'Illidan', 'Stormrage', 'Tichondrius', 'Mal\'Ganis']}
          value={server}
          onChange={setServer}
          placeholder="Choose server..."
        />

        <InputWithDropdown
          label="Region"
          options={['US East', 'US West', 'EU', 'Oceanic', 'Asia']}
          value={region}
          onChange={setRegion}
        />

        <InputWithDropdown
          label="Class"
          description="Your main class"
          options={['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Shaman', 'Mage', 'Warlock', 'Monk', 'Druid', 'Demon Hunter']}
          value={class_}
          onChange={setClass}
          placeholder="Select class..."
        />
      </div>
    );
  },
};

export const Showcase: Story = {
  render: () => {
    const [difficulty, setDifficulty] = React.useState('Heroic');
    const [server, setServer] = React.useState('Illidan');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              marginBottom: 4,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Input Component
          </h2>
          <p
            style={{
              color: colors.text.muted,
              fontSize: '0.875rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Mario Wonder-inspired inputs with pill shapes, halftone animations, and elastic merge effects.
            Three variants: simple pill, hero (chamfered), and connected label system.
          </p>
        </div>

        <Section title="Simple Pill">
          <Input placeholder="Search..." icon={<Icon name="search" animation="none" />} />
          <Input placeholder="Email" icon={<Icon name="mail" animation="none" />} />
          <Input placeholder="Error state" error icon={<Icon name="x" animation="none" />} />
        </Section>

        <Section title="Hero Variant (Chamfered)">
          <Input variant="hero" placeholder="Character name" icon={<Icon name="user" animation="none" />} />
          <Input variant="hero" size="lg" placeholder="Guild search" icon={<Icon name="search" animation="none" />} />
        </Section>

        <Section title="Connected Label (Merge Animation)">
          <InputWithLabel
            label="Character Name"
            description="Your main character"
            placeholder="Enter name..."
            icon={<Icon name="user" animation="none" />}
          />
          <InputWithLabel
            label="Item Level"
            placeholder="480"
            type="number"
          />
        </Section>

        <Section title="Arrow Selector">
          <InputWithArrows
            label="Difficulty"
            description="Raid difficulty"
            options={['Normal', 'Heroic', 'Mythic']}
            value={difficulty}
            onChange={setDifficulty}
          />
        </Section>

        <Section title="Dropdown Selector">
          <InputWithDropdown
            label="Server"
            description="Your realm"
            options={['Area 52', 'Illidan', 'Stormrage', 'Tichondrius', 'Mal\'Ganis']}
            value={server}
            onChange={setServer}
          />
        </Section>

        <Section title="Sizes">
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </Section>

        <Section title="States">
          <Input placeholder="Default" />
          <Input placeholder="Error" error />
          <Input placeholder="Disabled" disabled />
        </Section>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};
