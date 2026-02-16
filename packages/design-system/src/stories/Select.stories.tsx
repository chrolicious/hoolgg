import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Select, type SelectVariant } from '../components/primitives/Select';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'purple',
        'warning',
        'destructive',
        'primary-soft',
        'purple-soft',
        'destructive-soft',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

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

const variants: SelectVariant[] = ['primary', 'secondary', 'purple', 'warning', 'destructive'];

export const Playground: Story = {
  args: {
    options: fruits,
    placeholder: 'Select a fruit',
    variant: 'primary',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: () => {
    const [values, setValues] = React.useState<Record<string, string>>({});
    return (
      <Section title="Variants">
        {variants.map((v) => (
          <Select
            key={v}
            variant={v}
            options={fruits}
            value={values[v] || ''}
            onChange={(val) => setValues({ ...values, [v]: val })}
            placeholder={v.charAt(0).toUpperCase() + v.slice(1)}
          />
        ))}
      </Section>
    );
  },
};

export const AllSizes: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <Section title="Sizes">
        <Select size="sm" options={fruits} value={value} onChange={setValue} placeholder="Small" />
        <Select size="md" options={fruits} value={value} onChange={setValue} placeholder="Medium" />
        <Select size="lg" options={fruits} value={value} onChange={setValue} placeholder="Large" />
      </Section>
    );
  },
};

export const SoftVariants: Story = {
  name: 'Soft Variants',
  render: () => {
    const [values, setValues] = React.useState<Record<string, string>>({});
    return (
      <Section title="Soft variants (cream → color)">
        <Select
          variant="primary-soft"
          options={fruits}
          value={values['primary-soft'] || ''}
          onChange={(val) => setValues({ ...values, 'primary-soft': val })}
          placeholder="Primary Soft"
        />
        <Select
          variant="purple-soft"
          options={fruits}
          value={values['purple-soft'] || ''}
          onChange={(val) => setValues({ ...values, 'purple-soft': val })}
          placeholder="Purple Soft"
        />
        <Select
          variant="destructive-soft"
          options={fruits}
          value={values['destructive-soft'] || ''}
          onChange={(val) => setValues({ ...values, 'destructive-soft': val })}
          placeholder="Destructive Soft"
        />
      </Section>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <Select
        label="Select a fruit"
        options={fruits}
        value={value}
        onChange={setValue}
        placeholder="Pick one"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Section title="Disabled">
      <Select disabled options={fruits} placeholder="Disabled select" />
    </Section>
  ),
};
