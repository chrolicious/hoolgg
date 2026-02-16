import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarSize, type AvatarStatus } from '../components/primitives/Avatar';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'away', 'offline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

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
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

export const Playground: Story = {
  args: {
    fallback: 'JD',
    size: 'md',
    status: 'online',
  },
};

export const AllSizes: Story = {
  render: () => (
    <Section title="All Sizes">
      <Avatar fallback="SM" size="sm" />
      <Avatar fallback="MD" size="md" />
      <Avatar fallback="LG" size="lg" />
      <Avatar fallback="XL" size="xl" />
    </Section>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Section title="Fallback Initials">
      <Avatar fallback="AB" size="md" />
      <Avatar fallback="CD" size="md" />
      <Avatar fallback="EF" size="md" />
      <Avatar fallback="GH" size="md" />
    </Section>
  ),
};

export const WithStatus: Story = {
  render: () => {
    const statuses: AvatarStatus[] = ['online', 'away', 'offline'];
    return (
      <Section title="Status Indicators">
        {statuses.map((status) => (
          <div key={status} style={{ textAlign: 'center' }}>
            <Avatar
              fallback="JD"
              size="lg"
              status={status}
            />
            <div style={{
              fontSize: '0.75rem',
              color: colors.text.muted,
              marginTop: 8,
              textTransform: 'capitalize',
            }}>
              {status}
            </div>
          </div>
        ))}
      </Section>
    );
  },
};

export const SizeWithStatus: Story = {
  render: () => {
    const sizes: AvatarSize[] = ['sm', 'md', 'lg', 'xl'];
    return (
      <Section title="Sizes with Status">
        {sizes.map((size) => (
          <Avatar
            key={size}
            fallback={size.toUpperCase()}
            size={size}
            status="online"
          />
        ))}
      </Section>
    );
  },
};

export const Group: Story = {
  render: () => (
    <Section title="Avatar Group">
      <div style={{
        display: 'flex',
        gap: '-8px',
        marginLeft: -4,
      }}>
        {['AB', 'CD', 'EF', 'GH'].map((initials) => (
          <div key={initials} style={{ marginLeft: -8 }}>
            <Avatar
              fallback={initials}
              size="md"
              status={Math.random() > 0.5 ? 'online' : 'offline'}
              style={{ zIndex: 10, position: 'relative' }}
            />
          </div>
        ))}
      </div>
    </Section>
  ),
};
