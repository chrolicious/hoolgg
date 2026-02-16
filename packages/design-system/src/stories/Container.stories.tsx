import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    animated: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    padding: 'md',
    animated: true,
  },
  render: (args) => (
    <Container {...args}>
      <p style={{ margin: 0, color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
        This is a container with checkered background and glassmorphism border.
      </p>
    </Container>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Container padding="lg">
      <div style={{ color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600 }}>Container Title</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
          This container holds grouped related content. The checkered background and glassmorphism
          border create visual separation while maintaining a cohesive design aesthetic.
        </p>
      </div>
    </Container>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Container padding="sm">
        <div style={{ color: '#fff', fontSize: '0.875rem' }}>Small Padding</div>
      </Container>
      <Container padding="md">
        <div style={{ color: '#fff', fontSize: '0.875rem' }}>Medium Padding</div>
      </Container>
      <Container padding="lg">
        <div style={{ color: '#fff', fontSize: '0.875rem' }}>Large Padding</div>
      </Container>
    </div>
  ),
};

export const AnimatedToggle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Container animated={true}>
        <div style={{ color: '#fff', fontSize: '0.875rem' }}>Animated</div>
      </Container>
      <Container animated={false}>
        <div style={{ color: '#fff', fontSize: '0.875rem' }}>Static</div>
      </Container>
    </div>
  ),
};

export const NestedContainers: Story = {
  render: () => (
    <Container padding="lg">
      <div style={{ color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Outer Container</h3>
        <Container padding="md">
          <div style={{ color: '#fff', fontSize: '0.875rem' }}>Nested Container</div>
        </Container>
      </div>
    </Container>
  ),
};
