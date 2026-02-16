import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, type TooltipPosition } from '../components/primitives/Tooltip';
import { Button } from '../components/primitives/Button';
import { Icon } from '../components/primitives/Icon';
import { colors } from '../tokens/colors';

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    delay: {
      control: 'number',
      min: 0,
      max: 500,
      step: 50,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

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
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

export const Playground: Story = {
  render: () => (
    <Tooltip
      position="top"
      delay={0}
      trigger={<Button variant="primary">Hover me</Button>}
    >
      Try hovering and moving your cursor around!
    </Tooltip>
  ),
};

export const AllPositions: Story = {
  render: () => {
    const positions: TooltipPosition[] = ['top', 'right', 'bottom', 'left'];
    return (
      <Section title="All Positions">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 48,
            padding: 32,
          }}
        >
          {positions.map((position) => (
            <Tooltip
              key={position}
              position={position}
              trigger={<Button variant="primary">{`Position: ${position}`}</Button>}
            >
              {`Tooltip appears ${position}`}
            </Tooltip>
          ))}
        </div>
      </Section>
    );
  },
};

export const WithIcons: Story = {
  render: () => (
    <Section title="With Icons">
      <Tooltip
        position="top"
        trigger={
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              fontSize: '1.5rem',
            }}
          >
            <Icon name="info" />
          </button>
        }
      >
        Information
      </Tooltip>

      <Tooltip
        position="top"
        trigger={
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              fontSize: '1.5rem',
            }}
          >
            <Icon name="help-circle" />
          </button>
        }
      >
        Help
      </Tooltip>

      <Tooltip
        position="top"
        trigger={
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              fontSize: '1.5rem',
            }}
          >
            <Icon name="alert-circle" />
          </button>
        }
      >
        Warning
      </Tooltip>
    </Section>
  ),
};

export const LongText: Story = {
  render: () => (
    <Tooltip
      position="top"
      trigger={<Button variant="primary">Hover me</Button>}
    >
      This is a longer tooltip message to test text wrapping and layout
    </Tooltip>
  ),
};
