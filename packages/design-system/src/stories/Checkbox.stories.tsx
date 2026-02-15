import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Checkbox, type CheckboxVariant } from '../components/primitives/Checkbox';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Checkbox> = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
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
      options: ['sm', 'md', 'lg'],
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

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

const variants: CheckboxVariant[] = ['primary', 'secondary', 'purple', 'warning', 'destructive'];

// --- Stories ---

export const Playground: Story = {
  args: {
    checked: false,
    label: 'Accept terms and conditions',
    variant: 'primary',
    size: 'md',
    disabled: false,
    indeterminate: false,
  },
};

export const AllVariants: Story = {
  render: () => {
    const [states, setStates] = React.useState<Record<string, boolean>>({
      primary: true,
      secondary: false,
      purple: true,
      warning: false,
      destructive: true,
    });

    return (
      <Section title="Variants — empty when unchecked, checkmark when checked">
        {variants.map((v) => (
          <Checkbox
            key={v}
            variant={v}
            checked={states[v]}
            onChange={(checked) => setStates({ ...states, [v]: checked })}
            label={v.charAt(0).toUpperCase() + v.slice(1)}
          />
        ))}
      </Section>
    );
  },
};

export const AllSizes: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);

    return (
      <Section title="Sizes">
        <Checkbox size="sm" checked={checked} onChange={setChecked} label="Small" />
        <Checkbox size="md" checked={checked} onChange={setChecked} label="Medium" />
        <Checkbox size="lg" checked={checked} onChange={setChecked} label="Large" />
      </Section>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <SectionLabel>With label + description</SectionLabel>
        <Checkbox
          checked={checked}
          onChange={setChecked}
          label="Email notifications"
          description="Receive updates about your account activity"
        />
        <Checkbox
          checked={!checked}
          onChange={() => setChecked(!checked)}
          variant="purple"
          label="Marketing emails"
          description="Get the latest news and special offers"
        />
      </div>
    );
  },
};

export const StandaloneCheckboxes: Story = {
  name: 'Standalone (no label)',
  render: () => {
    const [states, setStates] = React.useState<Record<string, boolean>>({
      check1: true,
      check2: false,
      check3: true,
      check4: false,
    });

    return (
      <Section title="Standalone checkboxes">
        <Checkbox variant="primary" checked={states.check1} onChange={(c) => setStates({ ...states, check1: c })} />
        <Checkbox variant="secondary" checked={states.check2} onChange={(c) => setStates({ ...states, check2: c })} />
        <Checkbox variant="purple" checked={states.check3} onChange={(c) => setStates({ ...states, check3: c })} />
        <Checkbox variant="destructive" checked={states.check4} onChange={(c) => setStates({ ...states, check4: c })} />
      </Section>
    );
  },
};

export const IndeterminateState: Story = {
  render: () => {
    const [parentChecked, setParentChecked] = React.useState(false);
    const [children, setChildren] = React.useState([false, false, false]);

    const allChecked = children.every((c) => c);
    const someChecked = children.some((c) => c) && !allChecked;

    const handleParentChange = (checked: boolean) => {
      setParentChecked(checked);
      setChildren([checked, checked, checked]);
    };

    const handleChildChange = (index: number, checked: boolean) => {
      const newChildren = [...children];
      newChildren[index] = checked;
      setChildren(newChildren);
      setParentChecked(newChildren.every((c) => c));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionLabel>Indeterminate — empty/minus/check states</SectionLabel>
        <Checkbox
          variant="primary"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleParentChange}
          label="Select All"
          description="Check all items below"
        />
        <div style={{ paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Checkbox
            variant="primary"
            checked={children[0]}
            onChange={(c) => handleChildChange(0, c)}
            label="Item 1"
          />
          <Checkbox
            variant="primary"
            checked={children[1]}
            onChange={(c) => handleChildChange(1, c)}
            label="Item 2"
          />
          <Checkbox
            variant="primary"
            checked={children[2]}
            onChange={(c) => handleChildChange(2, c)}
            label="Item 3"
          />
        </div>
      </div>
    );
  },
};

export const SoftVariants: Story = {
  name: 'Soft Variants (cream → color on check)',
  render: () => {
    const [states, setStates] = React.useState<Record<string, boolean>>({
      'primary-soft': true,
      'purple-soft': false,
      'destructive-soft': true,
    });

    return (
      <Section title="Soft — cream default, colored when checked">
        <Checkbox
          variant="primary-soft"
          checked={states['primary-soft']}
          onChange={(c) => setStates({ ...states, 'primary-soft': c })}
          label="Primary Soft"
        />
        <Checkbox
          variant="purple-soft"
          checked={states['purple-soft']}
          onChange={(c) => setStates({ ...states, 'purple-soft': c })}
          label="Purple Soft"
        />
        <Checkbox
          variant="destructive-soft"
          checked={states['destructive-soft']}
          onChange={(c) => setStates({ ...states, 'destructive-soft': c })}
          label="Destructive Soft"
        />
      </Section>
    );
  },
};

export const DisabledState: Story = {
  render: () => (
    <Section title="Disabled">
      <Checkbox disabled checked={false} label="Unchecked Disabled" />
      <Checkbox disabled checked label="Checked Disabled" />
      <Checkbox disabled checked label="With Description" description="This checkbox cannot be changed" />
    </Section>
  ),
};

function CheckboxList() {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({
    tank: true,
    healer: false,
    mdps: true,
    rdps: false,
  });

  return (
    <Section title="Checkbox list (role selection)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Checkbox
          variant="primary"
          checked={selected.tank}
          onChange={(c) => setSelected({ ...selected, tank: c })}
          label="Tank"
          description="Protect your team and control enemies"
        />
        <Checkbox
          variant="primary"
          checked={selected.healer}
          onChange={(c) => setSelected({ ...selected, healer: c })}
          label="Healer"
          description="Keep your allies alive"
        />
        <Checkbox
          variant="primary"
          checked={selected.mdps}
          onChange={(c) => setSelected({ ...selected, mdps: c })}
          label="Melee DPS"
          description="Close-range damage dealer"
        />
        <Checkbox
          variant="primary"
          checked={selected.rdps}
          onChange={(c) => setSelected({ ...selected, rdps: c })}
          label="Ranged DPS"
          description="Long-range damage dealer"
        />
      </div>
    </Section>
  );
}

export const CheckboxGroup: Story = {
  name: 'Checkbox Group',
  render: () => <CheckboxList />,
};

export const FullShowcase: Story = {
  render: () => {
    const [states, setStates] = React.useState<Record<string, boolean>>({
      variant1: true,
      variant2: false,
      variant3: true,
      size1: true,
      standalone: true,
      soft1: false,
      soft2: true,
    });

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
            Checkbox Component
          </h2>
          <p
            style={{
              color: colors.text.muted,
              fontSize: '0.875rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Empty when unchecked, checkmark appears when selected. Use soft variants for cream → color transition.
          </p>
        </div>

        <Section title="Variants">
          {variants.map((v) => (
            <Checkbox
              key={v}
              variant={v}
              checked={states[`variant-${v}`] ?? false}
              onChange={(c) => setStates({ ...states, [`variant-${v}`]: c })}
              label={v.charAt(0).toUpperCase() + v.slice(1)}
            />
          ))}
        </Section>

        <Section title="Sizes">
          <Checkbox size="sm" checked={states.size1} onChange={(c) => setStates({ ...states, size1: c })} label="Small" />
          <Checkbox size="md" checked={states.size1} onChange={(c) => setStates({ ...states, size1: c })} label="Medium" />
          <Checkbox size="lg" checked={states.size1} onChange={(c) => setStates({ ...states, size1: c })} label="Large" />
        </Section>

        <Section title="With Descriptions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox
              checked={states.desc1 ?? false}
              onChange={(c) => setStates({ ...states, desc1: c })}
              label="Email notifications"
              description="Receive updates about your account"
            />
            <Checkbox
              variant="purple"
              checked={states.desc2 ?? true}
              onChange={(c) => setStates({ ...states, desc2: c })}
              label="Marketing emails"
              description="Get news and special offers"
            />
          </div>
        </Section>

        <Section title="Standalone">
          <Checkbox variant="primary" checked={states.standalone} onChange={(c) => setStates({ ...states, standalone: c })} />
          <Checkbox variant="secondary" checked={!states.standalone} onChange={(c) => setStates({ ...states, standalone: !c })} />
          <Checkbox variant="purple" checked={states.standalone} onChange={(c) => setStates({ ...states, standalone: c })} />
        </Section>

        <Section title="Soft Variants">
          <Checkbox variant="primary-soft" checked={states.soft1} onChange={(c) => setStates({ ...states, soft1: c })} label="Primary Soft" />
          <Checkbox variant="purple-soft" checked={states.soft2} onChange={(c) => setStates({ ...states, soft2: c })} label="Purple Soft" />
        </Section>

        <Section title="States">
          <Checkbox disabled checked={false} label="Disabled Unchecked" />
          <Checkbox disabled checked label="Disabled Checked" />
        </Section>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};
