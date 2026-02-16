import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from '../components/layout/Grid';
import { Container } from '../components/layout/Container';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    columns: {
      control: 'number',
      min: 1,
      max: 6,
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    autoFit: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

const GridItem = ({ label }: { label: string | number }) => (
  <div
    style={{
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '0.875rem',
      textAlign: 'center',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label}
  </div>
);

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: 'md',
  },
  render: (args) => (
    <Container padding="lg" style={{ minWidth: '600px' }}>
      <Grid {...args}>
        {Array.from({ length: 9 }).map((_, i) => (
          <GridItem key={i} label={i + 1} />
        ))}
      </Grid>
    </Container>
  ),
};

export const FourColumns: Story = {
  args: {
    columns: 4,
    gap: 'md',
  },
  render: (args) => (
    <Container padding="lg" style={{ minWidth: '700px' }}>
      <Grid {...args}>
        {Array.from({ length: 12 }).map((_, i) => (
          <GridItem key={i} label={i + 1} />
        ))}
      </Grid>
    </Container>
  ),
};

export const AutoFit: Story = {
  args: {
    autoFit: true,
    minItemWidth: '150px',
    gap: 'md',
  },
  render: (args) => (
    <Container padding="lg" style={{ minWidth: '700px' }}>
      <Grid {...args}>
        {Array.from({ length: 9 }).map((_, i) => (
          <GridItem key={i} label={i + 1} />
        ))}
      </Grid>
    </Container>
  ),
};

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Container padding="lg" style={{ minWidth: '600px' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginBottom: '12px' }}>
          Gap: Small
        </div>
        <Grid columns={3} gap="sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <GridItem key={i} label={i + 1} />
          ))}
        </Grid>
      </Container>

      <Container padding="lg" style={{ minWidth: '600px' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginBottom: '12px' }}>
          Gap: Medium
        </div>
        <Grid columns={3} gap="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <GridItem key={i} label={i + 1} />
          ))}
        </Grid>
      </Container>

      <Container padding="lg" style={{ minWidth: '600px' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginBottom: '12px' }}>
          Gap: Large
        </div>
        <Grid columns={3} gap="lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <GridItem key={i} label={i + 1} />
          ))}
        </Grid>
      </Container>
    </div>
  ),
};

export const WithinContainer: Story = {
  render: () => (
    <Container padding="lg" style={{ minWidth: '600px' }}>
      <div style={{ color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
        Grid inside Container (with animated background)
      </div>
      <Grid columns={3} gap="md">
        {Array.from({ length: 9 }).map((_, i) => (
          <GridItem key={i} label={i + 1} />
        ))}
      </Grid>
    </Container>
  ),
};
