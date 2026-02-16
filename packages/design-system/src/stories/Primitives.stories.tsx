import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Icon } from '../components/primitives/Icon';
import { InputWithArrows } from '../components/primitives/InputWithArrows';
import { InputWithDropdown } from '../components/primitives/InputWithDropdown';
import { InputWithLabel } from '../components/primitives/InputWithLabel';
import { LinkButton } from '../components/primitives/LinkButton';

// ============================================================================
// Icon Stories
// ============================================================================

const IconMeta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
};

export const IconDefault: StoryObj<typeof Icon> = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Icon name="Heart" size="sm" />
      <Icon name="Star" size="md" />
      <Icon name="Shield" size="lg" />
      <Icon name="Zap" size="xl" />
    </div>
  ),
};

export const IconVariants: StoryObj<typeof Icon> = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', padding: '24px' }}>
      {['Heart', 'Star', 'Shield', 'Zap', 'Flame', 'Sword', 'Crown', 'User'].map((icon) => (
        <div key={icon} style={{ textAlign: 'center' }}>
          <Icon name={icon as any} size="lg" />
          <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#999' }}>{icon}</div>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// InputWithArrows Stories
// ============================================================================

const InputWithArrowsMeta: Meta<typeof InputWithArrows> = {
  title: 'Primitives/InputWithArrows',
  component: InputWithArrows,
  parameters: {
    layout: 'centered',
  },
};

export const InputWithArrowsDefault: StoryObj<typeof InputWithArrows> = {
  render: () => <InputWithArrows label="Quantity" options={['1', '2', '3', '4', '5']} />,
};

export const InputWithArrowsRange: StoryObj<typeof InputWithArrows> = {
  render: () => <InputWithArrows label="Difficulty" options={['Easy', 'Normal', 'Hard', 'Heroic', 'Mythic']} />,
};

// ============================================================================
// InputWithDropdown Stories
// ============================================================================

const InputWithDropdownMeta: Meta<typeof InputWithDropdown> = {
  title: 'Primitives/InputWithDropdown',
  component: InputWithDropdown,
  parameters: {
    layout: 'centered',
  },
};

export const InputWithDropdownDefault: StoryObj<typeof InputWithDropdown> = {
  render: () => (
    <InputWithDropdown
      label="Country"
      options={['United States', 'Canada', 'United Kingdom', 'Australia']}
      placeholder="Select country..."
    />
  ),
};

export const InputWithDropdownClasses: StoryObj<typeof InputWithDropdown> = {
  render: () => (
    <InputWithDropdown
      label="Class"
      options={['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Monk']}
      placeholder="Select class..."
    />
  ),
};

// ============================================================================
// InputWithLabel Stories
// ============================================================================

const InputWithLabelMeta: Meta<typeof InputWithLabel> = {
  title: 'Primitives/InputWithLabel',
  component: InputWithLabel,
  parameters: {
    layout: 'centered',
  },
};

export const InputWithLabelDefault: StoryObj<typeof InputWithLabel> = {
  render: () => <InputWithLabel label="Username" placeholder="Enter username..." />,
};

export const InputWithLabelTypes: StoryObj<typeof InputWithLabel> = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <InputWithLabel label="Email" type="email" placeholder="example@mail.com" />
      <InputWithLabel label="Password" type="password" placeholder="••••••••" />
      <InputWithLabel label="Number" type="number" placeholder="0" />
      <InputWithLabel label="Text" type="text" placeholder="Enter text..." />
    </div>
  ),
};

export const InputWithLabelError: StoryObj<typeof InputWithLabel> = {
  render: () => (
    <InputWithLabel
      label="Guild Name"
      placeholder="Enter guild name..."
    />
  ),
};

// ============================================================================
// LinkButton Stories
// ============================================================================

const LinkButtonMeta: Meta<typeof LinkButton> = {
  title: 'Primitives/LinkButton',
  component: LinkButton,
  parameters: {
    layout: 'centered',
  },
};

export const LinkButtonDefault: StoryObj<typeof LinkButton> = {
  render: () => <LinkButton href="/">Home</LinkButton>,
};

export const LinkButtonVariants: StoryObj<typeof LinkButton> = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <LinkButton href="/" variant="primary">
        Primary
      </LinkButton>
      <LinkButton href="/" variant="secondary">
        Secondary
      </LinkButton>
      <LinkButton href="/" variant="destructive">
        Destructive
      </LinkButton>
    </div>
  ),
};

export const LinkButtonSizes: StoryObj<typeof LinkButton> = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <LinkButton href="/" size="sm">
        Small
      </LinkButton>
      <LinkButton href="/" size="md">
        Medium
      </LinkButton>
      <LinkButton href="/" size="lg">
        Large
      </LinkButton>
    </div>
  ),
};

export default IconMeta;
