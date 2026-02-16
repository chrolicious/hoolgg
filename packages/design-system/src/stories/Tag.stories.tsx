import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Tag, type TagVariant } from '../components/primitives/Tag';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
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
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        color: colors.text.muted,
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <SectionLabel>{title}</SectionLabel>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

const variants: TagVariant[] = ['primary', 'secondary', 'purple', 'warning', 'destructive'];

export const Playground: Story = {
  args: {
    children: 'typescript',
    variant: 'primary',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: () => (
    <Section title="Variants">
      {variants.map((v) => (
        <Tag key={v} variant={v}>
          {v === 'primary' ? 'javascript' :
           v === 'secondary' ? 'web' :
           v === 'purple' ? 'frontend' :
           v === 'warning' ? 'wip' :
           'deprecated'}
        </Tag>
      ))}
    </Section>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Section title="Sizes">
      <Tag size="sm">small</Tag>
      <Tag size="md">medium</Tag>
    </Section>
  ),
};

export const Removable: Story = {
  render: () => {
    const [tags, setTags] = useState(['react', 'typescript', 'nextjs']);
    return (
      <Section title="Removable Tags">
        {tags.map((tag) => (
          <Tag
            key={tag}
            variant="primary"
            onRemove={() => setTags(tags.filter((t) => t !== tag))}
          >
            {tag}
          </Tag>
        ))}
      </Section>
    );
  },
};

export const SoftVariants: Story = {
  render: () => (
    <Section title="Soft Variants">
      <Tag variant="primary-soft">skill</Tag>
      <Tag variant="purple-soft">feature</Tag>
      <Tag variant="destructive-soft">removed</Tag>
    </Section>
  ),
};

export const Mixed: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Section title="Project Tags">
        <Tag variant="primary">javascript</Tag>
        <Tag variant="secondary">react</Tag>
        <Tag variant="purple">design-system</Tag>
      </Section>

      <Section title="Status Tags">
        <Tag variant="warning" size="sm">in-progress</Tag>
        <Tag variant="primary" size="sm">completed</Tag>
        <Tag variant="destructive" size="sm">blocked</Tag>
      </Section>

      <Section title="With Remove">
        <Tag variant="primary" onRemove={() => {}}>
          removable
        </Tag>
        <Tag variant="secondary" size="sm" onRemove={() => {}}>
          small removable
        </Tag>
      </Section>
    </div>
  ),
};
