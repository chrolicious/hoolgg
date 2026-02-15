import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Toggle } from '../components/primitives/Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Primitives/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {
  args: {
    checked: false,
    label: 'Enable notifications',
    variant: 'primary',
    size: 'md',
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <Toggle checked={checked} onChange={setChecked} label="Toggle me" />;
  },
};

export const AllSizes: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Toggle size="sm" checked={checked} onChange={setChecked} label="Small" />
        <Toggle size="md" checked={checked} onChange={setChecked} label="Medium" />
        <Toggle size="lg" checked={checked} onChange={setChecked} label="Large" />
      </div>
    );
  },
};
