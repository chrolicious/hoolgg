import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar, TextureOverlay, ActionFooter, ScreenLayout } from '../components/navigation';

// ============================================================================
// Navbar Stories
// ============================================================================

const NavbarMeta: Meta<typeof Navbar> = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default NavbarMeta;
type NavbarStory = StoryObj<typeof Navbar>;

export const Default: NavbarStory = {
  render: () => (
    <Navbar
      icon="⚔️"
      title="Guild Finder"
      subtitle="Browse and join guilds"
    />
  ),
};

export const WithActions: NavbarStory = {
  render: () => (
    <Navbar
      icon="👤"
      title="Profile"
      actions={
        <button
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          ⚙️ Settings
        </button>
      }
    />
  ),
};

export const Variants: NavbarStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '40px' }}>
      <Navbar icon="🏛️" title="Guilds" subtitle="Guild management" />
      <Navbar icon="👥" title="Members" subtitle="View your roster" />
      <Navbar icon="📊" title="Statistics" subtitle="Guild analytics" />
    </div>
  ),
};

// ============================================================================
// TextureOverlay Stories
// ============================================================================

const TextureOverlayMeta: Meta<typeof TextureOverlay> = {
  title: 'Navigation/TextureOverlay',
  component: TextureOverlay,
  parameters: {
    layout: 'fullscreen',
  },
};

export const CheckerboardTexture: StoryObj<typeof TextureOverlay> = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 200, 140, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TextureOverlay pattern="checkerboard" opacity={0.15} animated={true} />
      <div style={{ position: 'relative', zIndex: 20, color: '#fff', fontSize: '2rem' }}>
        Checkerboard Texture
      </div>
    </div>
  ),
};

export const GridTexture: StoryObj<typeof TextureOverlay> = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 200, 140, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TextureOverlay pattern="grid" opacity={0.1} animated={false} />
      <div style={{ position: 'relative', zIndex: 20, color: '#fff', fontSize: '2rem' }}>
        Grid Texture
      </div>
    </div>
  ),
};

export const DotsTexture: StoryObj<typeof TextureOverlay> = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 200, 140, 0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TextureOverlay pattern="dots" opacity={0.12} animated={true} />
      <div style={{ position: 'relative', zIndex: 20, color: '#fff', fontSize: '2rem' }}>
        Dots Texture
      </div>
    </div>
  ),
};

// ============================================================================
// ActionFooter Stories
// ============================================================================

const ActionFooterMeta: Meta<typeof ActionFooter> = {
  title: 'Navigation/ActionFooter',
  component: ActionFooter,
  parameters: {
    layout: 'fullscreen',
  },
};

export const BottomRight: StoryObj<typeof ActionFooter> = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1a1a' }}>
      <ActionFooter
        position="bottom-right"
        actions={[
          { key: 'back', label: 'Back', variant: 'secondary' },
          { key: 'select', label: 'Select', variant: 'primary' },
        ]}
      />
    </div>
  ),
};

export const BottomCenter: StoryObj<typeof ActionFooter> = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1a1a' }}>
      <ActionFooter
        position="bottom-center"
        actions={[
          { key: 'cancel', label: 'Cancel', variant: 'secondary' },
          { key: 'confirm', label: 'Confirm', variant: 'primary' },
        ]}
      />
    </div>
  ),
};

export const WithIcons: StoryObj<typeof ActionFooter> = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#1a1a1a' }}>
      <ActionFooter
        position="bottom-right"
        showDarkOverlay={true}
        actions={[
          { key: 'back', label: 'Back', icon: '←', variant: 'secondary' },
          { key: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
          { key: 'confirm', label: 'Confirm', icon: '✓', variant: 'primary' },
        ]}
      />
    </div>
  ),
};

// ============================================================================
// ScreenLayout Stories
// ============================================================================

const ScreenLayoutMeta: Meta<typeof ScreenLayout> = {
  title: 'Navigation/ScreenLayout',
  component: ScreenLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Complete: StoryObj<typeof ScreenLayout> = {
  render: () => (
    <ScreenLayout
      navbar={{
        icon: '⚔️',
        title: 'Guild Finder',
        subtitle: 'Find your next adventure',
      }}
      texture={{
        pattern: 'checkerboard',
        opacity: 0.15,
        animated: true,
      }}
      actions={{
        position: 'bottom-right',
        actions: [
          { key: 'back', label: 'Back', variant: 'secondary' },
          { key: 'next', label: 'Next', variant: 'primary' },
        ],
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 600,
        }}
      >
        Select a Guild
      </div>
    </ScreenLayout>
  ),
};

export const CharacterSelection: StoryObj<typeof ScreenLayout> = {
  render: () => (
    <ScreenLayout
      navbar={{
        icon: '👤',
        title: 'Characters',
        subtitle: 'Choose your character',
      }}
      texture={{
        pattern: 'checkerboard',
        opacity: 0.15,
      }}
      actions={{
        position: 'bottom-right',
        showDarkOverlay: true,
        actions: [
          { key: 'back', label: 'Back', icon: '←' },
          { key: 'select', label: 'Select', icon: '✓', variant: 'primary' },
        ],
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem' }}>Play as this character?</h2>
        <div
          style={{
            fontSize: '3rem',
            marginBottom: '20px',
          }}
        >
          ⚔️ Mario
        </div>
      </div>
    </ScreenLayout>
  ),
};

export const RosterView: StoryObj<typeof ScreenLayout> = {
  render: () => (
    <ScreenLayout
      navbar={{
        icon: '👥',
        title: 'Guild Roster',
      }}
      texture={{
        pattern: 'grid',
        opacity: 0.1,
      }}
      actions={{
        position: 'bottom-right',
        actions: [
          { key: 'back', label: 'Back', variant: 'secondary' },
        ],
      }}
    >
      <div style={{ color: '#fff', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>48 Members</h2>
        <p style={{ opacity: 0.7 }}>Avg iLvl: 489</p>
      </div>
    </ScreenLayout>
  ),
};
