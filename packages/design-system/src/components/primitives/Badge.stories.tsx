import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, BadgeHeader, BadgeBody, BadgeFooter } from './Badge';
import { StickerIcon } from './StickerIcon';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Vertical class variants ---

const classVariants = [
  { variant: 'deathknight', name: 'Death Knight', spec: 'Blood', realm: 'Illidan' },
  { variant: 'demonhunter', name: 'Demon Hunter', spec: 'Havoc', realm: 'Tichondrius' },
  { variant: 'druid', name: 'Druid', spec: 'Balance', realm: 'Stormrage' },
  { variant: 'evoker', name: 'Evoker', spec: 'Devastation', realm: 'Area 52' },
  { variant: 'hunter', name: 'Hunter', spec: 'Beast Mastery', realm: 'Mal\'Ganis' },
  { variant: 'mage', name: 'Mage', spec: 'Frost', realm: 'Sargeras' },
  { variant: 'monk', name: 'Monk', spec: 'Windwalker', realm: 'Bleeding Hollow' },
  { variant: 'paladin', name: 'Paladin', spec: 'Retribution', realm: 'Dalaran' },
  { variant: 'priest', name: 'Priest', spec: 'Shadow', realm: 'Moon Guard' },
  { variant: 'rogue', name: 'Rogue', spec: 'Assassination', realm: 'Frostmourne' },
  { variant: 'shaman', name: 'Shaman', spec: 'Restoration', realm: 'Thrall' },
  { variant: 'warlock', name: 'Warlock', spec: 'Affliction', realm: 'Ragnaros' },
  { variant: 'warrior', name: 'Warrior', spec: 'Arms', realm: 'Proudmoore' },
] as const;

export const AllClassVariants: Story = {
  args: {
    variant: 'deathknight',
    size: 'md',
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '24px' }}>
      {classVariants.map(({ variant, name, spec, realm }) => (
        <Badge key={variant} variant={variant} size="md">
          <BadgeHeader>
            <div>{name}</div>
          </BadgeHeader>
          <BadgeBody>
            <div>{spec}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>623.4</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ilvl</div>
          </BadgeBody>
          <BadgeFooter>
            <div>{realm}</div>
          </BadgeFooter>
        </Badge>
      ))}
    </div>
  ),
};

export const VerticalDeathKnight: Story = {
  args: {
    variant: 'deathknight',
    size: 'md',
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Death Knight</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Blood</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>645.2</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ilvl</div>
      </BadgeBody>
      <BadgeFooter>
        <div>Illidan-US</div>
      </BadgeFooter>
    </Badge>
  ),
};

export const VerticalMage: Story = {
  args: {
    variant: 'mage',
    size: 'md',
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Mage</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Frost</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>638.7</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ilvl</div>
      </BadgeBody>
      <BadgeFooter>
        <div>Sargeras-US</div>
      </BadgeFooter>
    </Badge>
  ),
};

export const VerticalDruid: Story = {
  args: {
    variant: 'druid',
    size: 'md',
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Druid</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Balance</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>641.3</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ilvl</div>
      </BadgeBody>
      <BadgeFooter>
        <div>Stormrage-US</div>
      </BadgeFooter>
    </Badge>
  ),
};

export const SizeVariants: Story = {
  args: {
    variant: 'warrior',
    size: 'md',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '24px' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Badge key={size} variant="warrior" size={size}>
          <BadgeHeader>
            <div>Warrior ({size})</div>
          </BadgeHeader>
          <BadgeBody>
            <div>Arms</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>640</div>
          </BadgeBody>
          <BadgeFooter>
            <div>Proudmoore-US</div>
          </BadgeFooter>
        </Badge>
      ))}
    </div>
  ),
};

// --- Horizontal variants ---

export const Horizontal: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="trophy" size={48} />,
  },
  render: (args) => (
    <Badge {...args}>
      <BadgeHeader>
        <div>Guild Name</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Realm Name</div>
      </BadgeHeader>
      <BadgeBody>
        <div>Character Name</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>650 ilvl</div>
        <div>Weekly Progress: 75%</div>
      </BadgeBody>
      <BadgeFooter>
        <button>View Details</button>
      </BadgeFooter>
    </Badge>
  ),
};

export const HorizontalClassVariants: Story = {
  args: {
    variant: 'deathknight',
    size: 'md',
    orientation: 'horizontal',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '600px', padding: '24px' }}>
      {classVariants.slice(0, 5).map(({ variant, name, spec, realm }) => (
        <Badge key={variant} variant={variant} size="md" orientation="horizontal">
          <BadgeHeader>
            <div>{name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{realm}</div>
          </BadgeHeader>
          <BadgeBody>
            <div>{spec}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {(620 + Math.random() * 30).toFixed(1)} ilvl
            </div>
          </BadgeBody>
          <BadgeFooter>
            <div>3/6 tasks</div>
          </BadgeFooter>
        </Badge>
      ))}
    </div>
  ),
};

export const HorizontalFullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    orientation: 'horizontal',
    profileIcon: <StickerIcon name="shield" size={48} />,
  },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <Badge {...args}>
        <BadgeHeader>
          <div>Epic Guild</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Illidan-US</div>
        </BadgeHeader>
        <BadgeBody>
          <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Team Overview</div>
          <div>Avg ilvl: 645</div>
          <div>32/45 on track</div>
        </BadgeBody>
        <BadgeFooter>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button>&larr;</button>
            <div>&bull;&bull;</div>
            <button>&rarr;</button>
          </div>
        </BadgeFooter>
      </Badge>
    </div>
  ),
};
