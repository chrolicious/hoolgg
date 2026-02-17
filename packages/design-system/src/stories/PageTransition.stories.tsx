import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTransition } from '../components/animation/PageTransition';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { useState } from 'react';
import { Button } from '../components/primitives/Button';

const meta: Meta<typeof PageTransition> = {
  title: 'Animation/PageTransition',
  component: PageTransition,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['zigzag-wipe', 'fade', 'slide'],
    },
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
    isVisible: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageTransition>;

const PageContent = ({ title, color }: { title: string; color: string }) => (
  <div
    style={{
      width: '100%',
      minHeight: '300px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '24px',
      borderRadius: '6px',
    }}
  >
    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
    <p style={{ margin: 0, opacity: 0.8 }}>This page transitions smoothly</p>
  </div>
);

const StoryWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--hool-space-6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Container padding="lg" style={{ width: '100%', maxWidth: '800px' }}>
      {children}
    </Container>
  </div>
);

export const FadeMode: Story = {
  args: {
    mode: 'fade',
    duration: 0.6,
    isVisible: true,
  },
  render: (args) => (
    <StoryWrapper>
      <PageTransition {...args}>
        <PageContent
          title="Fade Transition"
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
      </PageTransition>
    </StoryWrapper>
  ),
};

export const SlideMode: Story = {
  args: {
    mode: 'slide',
    direction: 'right',
    duration: 0.6,
    isVisible: true,
  },
  render: (args) => (
    <StoryWrapper>
      <PageTransition {...args}>
        <PageContent
          title="Slide Transition"
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
      </PageTransition>
    </StoryWrapper>
  ),
};

export const ZigzagWipeMode: Story = {
  args: {
    mode: 'zigzag-wipe',
    direction: 'right',
    duration: 0.8,
    isVisible: true,
  },
  render: (args) => (
    <StoryWrapper>
      <PageTransition {...args}>
        <PageContent
          title="Zigzag Wipe (Mario Wonder Style)"
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </PageTransition>
    </StoryWrapper>
  ),
};

export const AllDirections: Story = {
  render: () => (
    <StoryWrapper>
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Fade from all directions
        </div>

        <PageTransition mode="fade" direction="left" isVisible={true}>
          <PageContent title="From Left" color="rgba(100, 200, 255, 0.3)" />
        </PageTransition>

        <PageTransition mode="fade" direction="right" isVisible={true}>
          <PageContent title="From Right" color="rgba(255, 100, 200, 0.3)" />
        </PageTransition>

        <PageTransition mode="fade" direction="top" isVisible={true}>
          <PageContent title="From Top" color="rgba(200, 100, 255, 0.3)" />
        </PageTransition>

        <PageTransition mode="fade" direction="bottom" isVisible={true}>
          <PageContent title="From Bottom" color="rgba(100, 255, 200, 0.3)" />
        </PageTransition>
      </Stack>
    </StoryWrapper>
  ),
};

export const SlideAllDirections: Story = {
  render: () => (
    <StoryWrapper>
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          Slide transitions from all directions
        </div>

        <PageTransition mode="slide" direction="left" isVisible={true}>
          <PageContent
            title="Slide from Left"
            color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </PageTransition>

        <PageTransition mode="slide" direction="right" isVisible={true}>
          <PageContent
            title="Slide from Right"
            color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </PageTransition>

        <PageTransition mode="slide" direction="top" isVisible={true}>
          <PageContent
            title="Slide from Top"
            color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </PageTransition>

        <PageTransition mode="slide" direction="bottom" isVisible={true}>
          <PageContent
            title="Slide from Bottom"
            color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </PageTransition>
      </Stack>
    </StoryWrapper>
  ),
};

export const InteractivePageSwitch: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const pages = [
      {
        title: 'Welcome',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        title: 'Features',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        title: 'Contact',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
    ];

    const currentPage = pages[page];

    return (
      <StoryWrapper>
        <Stack direction="vertical" gap="lg">
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {pages.map((_, idx) => (
              <Button
                key={idx}
                variant="primary"
                size="sm"
                onClick={() => setPage(idx)}
                selected={page === idx}
              >
                Page {idx + 1}
              </Button>
            ))}
          </div>

          <PageTransition
            key={page}
            mode="fade"
            duration={0.4}
            isVisible={true}
          >
            <PageContent title={currentPage.title} color={currentPage.color} />
          </PageTransition>
        </Stack>
      </StoryWrapper>
    );
  },
};

export const DirectionalPageSwitch: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const pages = [
      {
        title: 'Previous Page',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        title: 'Current Page',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        title: 'Next Page',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
    ];

    const currentPage = pages[page];
    const direction = page > 1 ? 'left' : 'right';

    return (
      <StoryWrapper>
        <Stack direction="vertical" gap="lg">
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPage(Math.min(2, page + 1))}
              disabled={page === 2}
            >
              Next
            </Button>
          </div>

          <PageTransition
            key={page}
            mode="slide"
            direction={direction}
            duration={0.4}
            isVisible={true}
          >
            <PageContent
              title={currentPage.title}
              color={currentPage.color}
            />
          </PageTransition>
        </Stack>
      </StoryWrapper>
    );
  },
};

export const DurationVariants: Story = {
  render: () => (
    <StoryWrapper>
      <Stack direction="vertical" gap="lg">
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          0.2s (Quick)
        </div>
        <PageTransition mode="fade" duration={0.2} isVisible={true}>
          <PageContent
            title="Quick Transition"
            color="rgba(100, 200, 255, 0.2)"
          />
        </PageTransition>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          0.6s (Normal)
        </div>
        <PageTransition mode="fade" duration={0.6} isVisible={true}>
          <PageContent
            title="Normal Transition"
            color="rgba(200, 100, 255, 0.2)"
          />
        </PageTransition>

        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
          1.2s (Slow)
        </div>
        <PageTransition mode="fade" duration={1.2} isVisible={true}>
          <PageContent
            title="Slow Transition"
            color="rgba(100, 255, 200, 0.2)"
          />
        </PageTransition>
      </Stack>
    </StoryWrapper>
  ),
};
