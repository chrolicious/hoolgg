import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Button, type ButtonVariant } from '../components/primitives/Button';
import { LinkButton } from '../components/primitives/LinkButton';
import { Icon } from '../components/primitives/Icon';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'purple', 'warning', 'destructive', 'primary-soft', 'purple-soft', 'destructive-soft'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

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
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

const variants: ButtonVariant[] = ['primary', 'secondary', 'purple', 'warning', 'destructive'];

// --- Stories ---

export const Playground: Story = {
  args: {
    children: 'View Results',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <Section title="Variants — hover for halftone + shadow lift">
      {variants.map((v) => (
        <Button key={v} variant={v}>
          {v === 'primary' ? 'Start Scan' :
           v === 'secondary' ? 'View Guild' :
           v === 'purple' ? 'Epic Loot' :
           v === 'warning' ? 'Cancel' :
           'Delete'}
        </Button>
      ))}
    </Section>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Section title="Sizes">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl" variant="secondary" icon={<Icon name="plus" animation="spin" />}>Add New User</Button>
    </Section>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Section title="With Icons">
      <Button icon={<Icon name="plus" animation="bounce" />}>Create Guild</Button>
      <Button variant="secondary" iconRight={<Icon name="arrow-right" animation="slide" />}>Next Step</Button>
      <Button variant="purple" icon={<Icon name="user" animation="pulse" />}>Add Player</Button>
      <Button variant="warning" icon={<Icon name="x" animation="spin" />}>Cancel</Button>
    </Section>
  ),
};

export const IconOnly: Story = {
  name: 'Icon-Only',
  render: () => (
    <div>
      <Section title="Icon-only — default shape">
        <Button icon={<Icon name="plus" animation="spin" />} />
        <Button variant="secondary" icon={<Icon name="pencil" animation="wiggle" />} />
        <Button variant="purple" icon={<Icon name="star" animation="pulse" />} />
        <Button variant="destructive" icon={<Icon name="trash-2" animation="wiggle" />} />
      </Section>
      <Section title="Icon-only — sizes">
        <Button size="sm" icon={<Icon name="plus" animation="spin" />} />
        <Button size="md" icon={<Icon name="plus" animation="spin" />} />
        <Button size="lg" icon={<Icon name="plus" animation="spin" />} />
      </Section>
      <Section title="Icon-only — square shape">
        <Button shape="square" variant="secondary" icon={<Icon name="menu" animation="bounce" />} />
        <Button shape="square" variant="primary" icon={<Icon name="settings" animation="spin" />} />
      </Section>
      <Section title="Icon-only — circle shape">
        <Button shape="circle" variant="primary" icon={<Icon name="plus" animation="spin" />} />
        <Button shape="circle" variant="secondary" icon={<Icon name="arrow-right" animation="slide" />} />
        <Button shape="circle" variant="purple" icon={<Icon name="heart" animation="pulse" />} />
      </Section>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionLabel>Full width — stretches to container</SectionLabel>
      <Button fullWidth>Join Guild</Button>
      <Button fullWidth variant="secondary" icon={<Icon name="search" animation="pulse" />}>Search Guilds</Button>
      <Button fullWidth variant="purple" iconRight={<Icon name="arrow-right" animation="slide" />}>Continue</Button>
      <Button fullWidth variant="destructive">Leave Guild</Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Section title="Loading States">
      <Button loading>Scanning...</Button>
      <Button variant="secondary" loading>Loading...</Button>
      <Button variant="purple" loading>Please Wait</Button>
    </Section>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Section title="Disabled States">
      <Button disabled>Start Scan</Button>
      <Button variant="secondary" disabled>View Guild</Button>
      <Button variant="purple" disabled>Epic Loot</Button>
      <Button variant="warning" disabled>Cancel</Button>
    </Section>
  ),
};

export const SoftVariants: Story = {
  name: 'Soft Variants (cream \u2192 color on hover)',
  render: () => (
    <Section title="Soft \u2014 cream default, colored on hover">
      <Button variant="primary-soft">Join Guild</Button>
      <Button variant="purple-soft">Epic Loot</Button>
      <Button variant="destructive-soft">Leave Guild</Button>
    </Section>
  ),
};

function ToggleDemo() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({
    tank: true,
    healer: false,
    mdps: false,
    rdps: false,
  });
  return (
    <Section title="Click to toggle \u2014 soft variants with selected state">
      {(['tank', 'healer', 'mdps', 'rdps'] as const).map((role) => (
        <Button
          key={role}
          variant="primary-soft"
          selected={selected[role]}
          onClick={() => setSelected((s) => ({ ...s, [role]: !s[role] }))}
          icon={<Icon
            name={role === 'tank' ? 'shield' : role === 'healer' ? 'heart' : role === 'mdps' ? 'swords' : 'flame'}
            animation={role === 'tank' ? 'shake' : role === 'healer' ? 'pulse' : role === 'mdps' ? 'swing' : 'bounce'}
          />}
        >
          {role === 'tank' ? 'Tank' : role === 'healer' ? 'Healer' : role === 'mdps' ? 'M-DPS' : 'R-DPS'}
        </Button>
      ))}
    </Section>
  );
}

function TogglePurpleDemo() {
  const [sel, setSel] = React.useState(0);
  const options = ['Normal', 'Heroic', 'Mythic'];
  return (
    <Section title="Single-select \u2014 purple soft">
      {options.map((label, i) => (
        <Button
          key={label}
          variant="purple-soft"
          selected={sel === i}
          onClick={() => setSel(i)}
        >
          {label}
        </Button>
      ))}
    </Section>
  );
}

export const Shapes: Story = {
  render: () => (
    <div>
      <Section title="Default (octagonal sticker)">
        <Button>Default</Button>
        <Button variant="purple">Purple</Button>
      </Section>
      <Section title="Square">
        <Button shape="square" variant="secondary" icon={<Icon name="plus" animation="spin" />}>Add</Button>
        <Button shape="square" variant="primary" icon={<Icon name="plus" animation="spin" />}>New</Button>
        <Button shape="square" variant="purple" icon={<Icon name="arrow-right" animation="slide" />}>Go</Button>
      </Section>
      <Section title="Circle">
        <Button shape="circle" variant="primary" icon={<Icon name="plus" animation="spin" />}>Add</Button>
        <Button shape="circle" variant="secondary" icon={<Icon name="arrow-right" animation="slide" />}>Go</Button>
        <Button shape="circle" variant="purple" icon={<Icon name="plus" animation="spin" />}>New</Button>
      </Section>
    </div>
  ),
};

export const Toggleable: Story = {
  name: 'Toggle / Selectable',
  render: () => (
    <div>
      <ToggleDemo />
      <TogglePurpleDemo />
    </div>
  ),
};

export const DialogPair: Story = {
  name: 'Dialog Pair (Back / OK)',
  render: () => (
    <Section title="Back / OK pattern from reference">
      <Button variant="warning" icon={<Icon name="arrow-left" animation="slide" />}>Back</Button>
      <Button variant="primary" icon={<Icon name="check" animation="spin" />}>OK</Button>
    </Section>
  ),
};

export const LinkButtonStory: Story = {
  name: 'LinkButton',
  render: () => (
    <div>
      <Section title="LinkButton \u2014 renders as <a> tag">
        <LinkButton href="https://example.com">Visit Site</LinkButton>
        <LinkButton href="https://example.com" variant="secondary" iconRight={<Icon name="arrow-right" animation="slide" />}>
          Learn More
        </LinkButton>
        <LinkButton href="https://example.com" variant="purple" icon={<Icon name="link-2" animation="wiggle" />}>
          Open Link
        </LinkButton>
      </Section>
      <Section title="LinkButton \u2014 icon-only">
        <LinkButton href="https://example.com" icon={<Icon name="arrow-right" animation="slide" />} />
        <LinkButton href="https://example.com" variant="secondary" icon={<Icon name="link-2" animation="wiggle" />} />
      </Section>
    </div>
  ),
};

export const FullShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.3px',
          marginBottom: 4,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          Button Component
        </h2>
        <p style={{
          color: colors.text.muted,
          fontSize: '0.875rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          Sticker-style with chamfered corners, layered clip-path octagon,
          white outline, solid shadow, animated halftone dots on hover.
        </p>
      </div>

      <Section title="Variants">
        {variants.map((v) => (
          <Button key={v} variant={v}>
            {v === 'primary' ? 'Start Scan' :
             v === 'secondary' ? 'View Guild' :
             v === 'purple' ? 'Epic Loot' :
             v === 'warning' ? 'Cancel' :
             'Delete'}
          </Button>
        ))}
      </Section>

      <Section title="Sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl" variant="secondary" icon={<Icon name="plus" animation="spin" />}>Add New User</Button>
      </Section>

      <Section title="With Icons">
        <Button icon={<Icon name="plus" animation="spin" />}>Create Guild</Button>
        <Button variant="secondary" iconRight={<Icon name="arrow-right" animation="slide" />}>Next Step</Button>
        <Button variant="purple" icon={<Icon name="user" animation="pulse" />}>Add Player</Button>
      </Section>

      <Section title="Icon-Only">
        <Button icon={<Icon name="plus" animation="spin" />} />
        <Button variant="secondary" icon={<Icon name="pencil" animation="wiggle" />} />
        <Button variant="purple" icon={<Icon name="star" animation="pulse" />} />
        <Button variant="destructive" icon={<Icon name="trash-2" animation="wiggle" />} />
      </Section>

      <Section title="Loading">
        <Button loading>Scanning...</Button>
        <Button variant="secondary" loading>Loading...</Button>
      </Section>

      <Section title="Disabled">
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </Section>

      <Section title="Soft Variants">
        <Button variant="primary-soft">Join Guild</Button>
        <Button variant="purple-soft">Epic Loot</Button>
        <Button variant="destructive-soft">Leave Guild</Button>
      </Section>

      <Section title="Shapes">
        <Button shape="square" variant="secondary" icon={<Icon name="plus" animation="spin" />}>Add</Button>
        <Button shape="square" variant="primary" icon={<Icon name="plus" animation="spin" />}>New</Button>
        <Button shape="circle" variant="primary" icon={<Icon name="plus" animation="spin" />}>Add</Button>
        <Button shape="circle" variant="purple" icon={<Icon name="plus" animation="spin" />}>New</Button>
      </Section>

      <Section title="Toggle (primary-soft)">
        <Button variant="primary-soft" selected>Selected</Button>
        <Button variant="primary-soft">Unselected</Button>
      </Section>

      <Section title="Dialog Pair">
        <Button variant="warning" icon={<Icon name="arrow-left" animation="slide" />}>Back</Button>
        <Button icon={<Icon name="check" animation="spin" />}>OK</Button>
      </Section>

      <Section title="LinkButton">
        <LinkButton href="#">Visit Site</LinkButton>
        <LinkButton href="#" variant="secondary" iconRight={<Icon name="arrow-right" animation="slide" />}>Learn More</LinkButton>
      </Section>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
