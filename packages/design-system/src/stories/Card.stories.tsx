import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../components/surfaces/Card';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Button } from '../components/primitives/Button';

const meta: Meta<typeof Card> = {
  title: 'Surfaces/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'filled'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    interactive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'lg',
    interactive: false,
  },
  render: (args) => (
    <Container padding="lg">
      <Card {...args}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>
          Card Title
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          This is a card component with sticker-style borders and layers.
        </p>
      </Card>
    </Container>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
          }}
        >
          Card variants
        </div>

        <Card variant="default" padding="lg">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>
            Default Card
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Standard appearance with subtle styling
          </p>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>
            Elevated Card
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Enhanced with shadow for depth and prominence
          </p>
        </Card>

        <Card variant="filled" padding="lg">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>
            Filled Card
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            More opaque background for stronger emphasis
          </p>
        </Card>
      </Stack>
    </Container>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
          }}
        >
          Padding sizes
        </div>

        <Card padding="sm" variant="filled">
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#fff' }}>
            Small padding (12px)
          </p>
        </Card>

        <Card padding="md" variant="filled">
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#fff' }}>
            Medium padding (16px)
          </p>
        </Card>

        <Card padding="lg" variant="filled">
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#fff' }}>
            Large padding (24px)
          </p>
        </Card>
      </Stack>
    </Container>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Container padding="lg">
      <Card interactive variant="default" padding="lg">
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>
          Interactive Card
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Hover over this card to see the interactive effect
        </p>
      </Card>
    </Container>
  ),
};

export const ContentExample: Story = {
  render: () => (
    <Container padding="lg">
      <Card variant="elevated" padding="lg">
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#fff' }}>
          Feature Highlight
        </h2>
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.5,
          }}
        >
          Cards provide a flexible container for grouping related content. They
          work well with buttons, text, images, and other components.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" size="sm">
            Learn More
          </Button>
          <Button variant="secondary" size="sm">
            Dismiss
          </Button>
        </div>
      </Card>
    </Container>
  ),
};

export const Grid: Story = {
  render: () => (
    <Container padding="lg">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} variant="default" padding="lg">
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '1rem',
                color: '#fff',
              }}
            >
              Card {i}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Example card in a responsive grid layout
            </p>
          </Card>
        ))}
      </div>
    </Container>
  ),
};
