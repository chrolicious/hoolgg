import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '../components/layout/Divider';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

const TextBlock = ({ children }: { children: string }) => (
  <div
    style={{
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.5,
    }}
  >
    {children}
  </div>
);

export const Horizontal: Story = {
  render: () => (
    <Container padding="lg" style={{ minWidth: '400px' }}>
      <Stack direction="vertical" gap="md">
        <TextBlock>Section 1</TextBlock>
        <Divider />
        <TextBlock>Section 2</TextBlock>
      </Stack>
    </Container>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <Container padding="lg" style={{ minWidth: '400px' }}>
      <Stack direction="vertical" gap="md">
        <TextBlock>Sign in with email</TextBlock>
        <Divider label="OR" />
        <TextBlock>Sign in with social account</TextBlock>
      </Stack>
    </Container>
  ),
};

export const SpacingVariants: Story = {
  render: () => (
    <Container padding="lg" style={{ minWidth: '400px' }}>
      <Stack direction="vertical">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>Small</div>
        <TextBlock>Content above</TextBlock>
        <Divider spacing="sm" />
        <TextBlock>Content below</TextBlock>

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '24px',
          }}
        >
          Medium
        </div>
        <TextBlock>Content above</TextBlock>
        <Divider spacing="md" />
        <TextBlock>Content below</TextBlock>

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            marginTop: '24px',
          }}
        >
          Large
        </div>
        <TextBlock>Content above</TextBlock>
        <Divider spacing="lg" />
        <TextBlock>Content below</TextBlock>
      </Stack>
    </Container>
  ),
};

export const MultipleWithLabels: Story = {
  render: () => (
    <Container padding="lg" style={{ minWidth: '400px' }}>
      <Stack direction="vertical" gap="md">
        <TextBlock>Step 1: Create account</TextBlock>
        <Divider label="NEXT" />
        <TextBlock>Step 2: Verify email</TextBlock>
        <Divider label="NEXT" />
        <TextBlock>Step 3: Set password</TextBlock>
      </Stack>
    </Container>
  ),
};
