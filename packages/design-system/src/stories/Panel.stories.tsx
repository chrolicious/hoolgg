import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from '../components/surfaces/Panel';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Button } from '../components/primitives/Button';

const meta: Meta<typeof Panel> = {
  title: 'Surfaces/Panel',
  component: Panel,
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
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'lg',
    title: 'Panel Title',
    children: 'Panel content goes here',
  },
  render: (args) => (
    <Container padding="lg">
      <Panel {...args} />
    </Container>
  ),
};

export const WithSubtitle: Story = {
  render: () => (
    <Container padding="lg">
      <Panel
        variant="default"
        padding="lg"
        title="Settings"
        subtitle="Manage your account preferences"
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          This panel has a title and subtitle to provide context about its
          content.
        </p>
      </Panel>
    </Container>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Container padding="lg">
      <Panel
        variant="default"
        padding="lg"
        title="Confirm Action"
        subtitle="This action cannot be undone"
        footer={
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
            <Button variant="destructive" size="sm">
              Confirm
            </Button>
          </div>
        }
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to proceed with this action? The footer section
          is perfect for action buttons and controls.
        </p>
      </Panel>
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
          Panel variants
        </div>

        <Panel variant="default" padding="lg" title="Default Panel">
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Standard appearance
          </p>
        </Panel>

        <Panel variant="elevated" padding="lg" title="Elevated Panel">
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Enhanced with shadow for prominence
          </p>
        </Panel>

        <Panel variant="filled" padding="lg" title="Filled Panel">
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            More opaque background
          </p>
        </Panel>
      </Stack>
    </Container>
  ),
};

export const FormPanel: Story = {
  render: () => (
    <Container padding="lg">
      <Panel
        variant="elevated"
        padding="lg"
        title="User Profile"
        subtitle="Update your account information"
        footer={
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4px',
              }}
            >
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4px',
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>
      </Panel>
    </Container>
  ),
};

export const SideBySide: Story = {
  render: () => (
    <Container padding="lg">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Panel
          variant="default"
          padding="lg"
          title="Left Panel"
          subtitle="First column"
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Panels work great in multi-column layouts
          </p>
        </Panel>

        <Panel
          variant="default"
          padding="lg"
          title="Right Panel"
          subtitle="Second column"
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Use them for comparing information side-by-side
          </p>
        </Panel>
      </div>
    </Container>
  ),
};
