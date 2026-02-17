import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from '../components/primitives/Badge';
import { Icon } from '../components/primitives/Icon';
import { StickerIcon } from '../components/primitives/StickerIcon';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  render: () => (
    <Badge variant="primary" profileIcon={<Icon name="user" size={32} animation="none" />}>
      <BadgeHeader>Level 45</BadgeHeader>
      <BadgeBody>Warrior</BadgeBody>
      <BadgeFooter>Active</BadgeFooter>
    </Badge>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {([
        'primary',
        'secondary',
        'purple',
        'warning',
        'destructive',
        'deathknight',
        'demonhunter',
        'druid',
        'evoker',
        'hunter',
        'mage',
        'monk',
        'paladin',
        'priest',
        'rogue',
        'shaman',
        'warlock',
        'warrior',
      ] as const).map((v) => (
        <Badge key={v} variant={v} profileIcon={<Icon name="user" size={32} animation="none" />}>
          <BadgeHeader>{v}</BadgeHeader>
          <BadgeBody>Character</BadgeBody>
          <BadgeFooter>Lvl 50</BadgeFooter>
        </Badge>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Badge size="sm" profileIcon={<Icon name="user" size={24} animation="none" />}>
        <BadgeHeader>Small</BadgeHeader>
        <BadgeBody>Lvl 10</BadgeBody>
      </Badge>
      <Badge size="md" profileIcon={<Icon name="user" size={32} animation="none" />}>
        <BadgeHeader>Medium</BadgeHeader>
        <BadgeBody>Lvl 45</BadgeBody>
      </Badge>
      <Badge size="lg" profileIcon={<Icon name="user" size={40} animation="none" />}>
        <BadgeHeader>Large</BadgeHeader>
        <BadgeBody>Lvl 99</BadgeBody>
      </Badge>
    </div>
  ),
};

export const SoftVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Badge variant="primary-soft" profileIcon={<Icon name="user" size={32} animation="none" />}>
        <BadgeHeader>Primary</BadgeHeader>
        <BadgeBody>Soft</BadgeBody>
      </Badge>
      <Badge variant="purple-soft" profileIcon={<Icon name="user" size={32} animation="none" />}>
        <BadgeHeader>Purple</BadgeHeader>
        <BadgeBody>Soft</BadgeBody>
      </Badge>
      <Badge variant="destructive-soft" profileIcon={<Icon name="user" size={32} animation="none" />}>
        <BadgeHeader>Destructive</BadgeHeader>
        <BadgeBody>Soft</BadgeBody>
      </Badge>
    </div>
  ),
};

export const NoProfileIcon: Story = {
  render: () => {
    const stickerStyle = {
      textShadow: `
        -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white,
        2px 4px 6px rgba(0, 0, 0, 0.4)
      `,
    };
    return (
      <Badge variant="primary" profileIcon={<StickerIcon name="gem" size={40} style={stickerStyle} />}>
        <BadgeHeader>Treasure</BadgeHeader>
        <BadgeBody>Rare Item</BadgeBody>
        <BadgeFooter>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <StickerIcon name="star" size={20} style={stickerStyle} />
            <StickerIcon name="star" size={20} style={stickerStyle} />
            <StickerIcon name="star" size={20} style={stickerStyle} />
          </div>
        </BadgeFooter>
      </Badge>
    );
  },
};

export const WithoutSections: Story = {
  render: () => (
    <Badge variant="purple" profileIcon={<Icon name="star" size={32} animation="none" />}>
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Achievement</div>
        <div style={{ fontSize: '0.625rem' }}>Unlocked!</div>
      </div>
    </Badge>
  ),
};
