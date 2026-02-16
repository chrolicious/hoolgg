import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlideIn } from '../components/animation/SlideIn';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { useState } from 'react';
import { Button } from '../components/primitives/Button';

const meta: Meta<typeof SlideIn> = {
  title: 'Animation/SlideIn',
  component: SlideIn,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    duration: {
      control: 'number',
      min: 0.1,
      max: 2,
      step: 0.1,
    },
    delay: {
      control: 'number',
      min: 0,
      max: 1,
      step: 0.1,
    },
    distance: {
      control: 'number',
      min: 10,
      max: 300,
      step: 10,
    },
    trigger: {
      control: 'select',
      options: ['scroll', 'immediate'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SlideIn>;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      padding: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: 500,
      textAlign: 'center',
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label}
  </div>
);

export const FromLeft: Story = {
  args: {
    direction: 'left',
    duration: 0.6,
    distance: 100,
    trigger: 'immediate',
  },
  render: (args) => (
    <Container padding="lg">
      <SlideIn {...args}>
        <Box label="Slides in from left" />
      </SlideIn>
    </Container>
  ),
};

export const AllDirections: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <SlideIn direction="left" trigger="immediate">
          <Box label="From Left" />
        </SlideIn>

        <SlideIn direction="right" trigger="immediate">
          <Box label="From Right" />
        </SlideIn>

        <SlideIn direction="top" trigger="immediate">
          <Box label="From Top" />
        </SlideIn>

        <SlideIn direction="bottom" trigger="immediate">
          <Box label="From Bottom" />
        </SlideIn>
      </Stack>
    </Container>
  ),
};

export const PageTransition: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const pages = [
      { title: 'Page 1', color: 'rgba(255, 100, 100, 0.2)' },
      { title: 'Page 2', color: 'rgba(100, 255, 100, 0.2)' },
      { title: 'Page 3', color: 'rgba(100, 100, 255, 0.2)' },
    ];

    const currentPage = pages[page];
    const direction = page > (page - 1) ? 'right' : 'left';

    return (
      <Stack direction="vertical" gap="lg">
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPage(0)}
            selected={page === 0}
          >
            Page 1
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPage(1)}
            selected={page === 1}
          >
            Page 2
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPage(2)}
            selected={page === 2}
          >
            Page 3
          </Button>
        </div>

        <Container padding="lg" style={{ backgroundColor: currentPage.color, minHeight: '200px' }}>
          <SlideIn
            key={page}
            direction={direction}
            duration={0.4}
            distance={80}
            trigger="immediate"
          >
            <div
              style={{
                color: '#fff',
                fontFamily: 'Inter, system-ui, sans-serif',
                textAlign: 'center',
              }}
            >
              <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>
                {currentPage.title}
              </h2>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Page content slides in smoothly
              </p>
            </div>
          </SlideIn>
        </Container>
      </Stack>
    );
  },
};

export const StaggeredSlides: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="md">
        {Array.from({ length: 4 }).map((_, i) => (
          <SlideIn key={i} direction="left" delay={i * 0.1} trigger="immediate">
            <Box label={`Slide ${i + 1}`} />
          </SlideIn>
        ))}
      </Stack>
    </Container>
  ),
};

export const DistanceVariants: Story = {
  render: () => (
    <Container padding="lg">
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Distance: 50px
        </div>
        <SlideIn direction="left" distance={50} trigger="immediate">
          <Box label="Short slide" />
        </SlideIn>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Distance: 100px
        </div>
        <SlideIn direction="left" distance={100} trigger="immediate">
          <Box label="Medium slide" />
        </SlideIn>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Distance: 200px
        </div>
        <SlideIn direction="left" distance={200} trigger="immediate">
          <Box label="Long slide" />
        </SlideIn>
      </Stack>
    </Container>
  ),
};
