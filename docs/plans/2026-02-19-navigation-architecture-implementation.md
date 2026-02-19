# Navigation Architecture Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure guild navigation to separate player-focused features (My Roster) from leadership tools (Guild Management), splitting the unified Progress page into dedicated sections.

**Architecture:** Add section headers to sidebar, create new `/roster` and `/team-progress` routes reusing existing components, implement breadcrumb navigation, add role-based redirects, and migrate away from `/progress` route.

**Tech Stack:** Next.js 15 App Router, TypeScript, React, Tailwind CSS, @hool/design-system, Flask (progress-api)

---

## Phase 1: Sidebar & Navigation Foundation

### Task 1: Add SectionHeader Component

**Files:**
- Create: `apps/web/app/components/section-header.tsx`

**Step 1: Create SectionHeader component**

```tsx
// apps/web/app/components/section-header.tsx
interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div
      style={{
        fontSize: '0.625rem',
        letterSpacing: '0.075rem',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.3)',
        padding: '0.75rem 1rem 0.5rem',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/app/components/section-header.tsx
git commit -m "feat: add SectionHeader component for navigation sections"
```

---

### Task 2: Update Sidebar with Section Headers

**Files:**
- Modify: `apps/web/app/(platform)/guilds/[guildId]/layout.tsx`
- Import: `apps/web/app/components/section-header.tsx`

**Step 1: Import SectionHeader**

Add to imports at top of `layout.tsx`:
```tsx
import { SectionHeader } from '../../../components/section-header';
```

**Step 2: Update navItems with section structure**

Replace the existing `navItems` array (around line 135) with:

```tsx
const navSections = [
  {
    header: 'MY ROSTER',
    items: [
      { href: `${basePath}/roster`, icon: 'users', label: 'Overview', alwaysShow: true },
    ],
  },
  {
    header: 'GUILD MANAGEMENT',
    items: [
      { href: `${basePath}/dashboard`, icon: 'home', label: 'Dashboard', officerOnly: true },
      { href: `${basePath}/team-progress`, icon: 'zap', label: 'Team Progress', officerOnly: true },
      { href: `${basePath}/recruitment`, icon: 'search', label: 'Recruitment', tool: 'recruitment' },
      { href: `${basePath}/settings`, icon: 'settings', label: 'Settings', gmOnly: true },
    ],
  },
];
```

**Step 3: Update isActivePath logic**

Update the `isActivePath` function to handle roster routes:

```tsx
const isActivePath = (href: string) => {
  if (href === basePath) {
    return pathname === basePath || pathname === basePath + '/';
  }
  if (href === `${basePath}/roster`) {
    return pathname.startsWith(`${basePath}/roster`);
  }
  return pathname.startsWith(href);
};
```

**Step 4: Update navigation rendering**

Replace the navigation section (around line 354) with:

```tsx
<nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
  {navSections.map((section) => {
    const visibleItems = section.items.filter((item) => {
      if (item.alwaysShow) return true;
      if (item.gmOnly) return isGM;
      if (item.officerOnly) return isOfficer;
      if (item.tool) return canAccess(item.tool);
      return true;
    });

    if (visibleItems.length === 0) return null;

    return (
      <div key={section.header}>
        <SectionHeader label={section.header} />
        {visibleItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActivePath(item.href)}
            onClick={() => router.push(item.href)}
          />
        ))}
      </div>
    );
  })}
</nav>
```

**Step 5: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[any-guild-id]`
Expected: Sidebar shows "MY ROSTER" and "GUILD MANAGEMENT" section headers with items grouped below

**Step 6: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/layout.tsx'
git commit -m "feat: add section headers to guild sidebar navigation"
```

---

### Task 3: Add Breadcrumb Component

**Files:**
- Create: `apps/web/app/components/breadcrumb.tsx`

**Step 1: Create Breadcrumb component**

```tsx
// apps/web/app/components/breadcrumb.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@hool/design-system';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
  };

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8125rem',
        marginBottom: '0.75rem',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = truncate(item.label, index === 0 ? 30 : 20);

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {index > 0 && (
              <Icon
                name="chevron-right"
                size={12}
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
            )}
            {isLast ? (
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{label}</span>
            ) : (
              <button
                onClick={() => item.href && router.push(item.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                {label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/app/components/breadcrumb.tsx
git commit -m "feat: add Breadcrumb component for navigation paths"
```

---

## Phase 2: My Roster Overview

### Task 4: Create Roster Overview Page Structure

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx`

**Step 1: Create roster page with basic structure**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx
'use client';

import { useGuild } from '../../../../lib/guild-context';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { Card, Icon } from '@hool/design-system';

export default function RosterPage() {
  const { guild, guildId } = useGuild();

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          My Roster
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {/* Empty state placeholder */}
      <Card padding="lg" variant="elevated">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <Icon name="user" size={48} style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}
          >
            No Characters Yet
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              maxWidth: 320,
            }}
          >
            Add your characters to start tracking progress
          </p>
        </div>
      </Card>
    </div>
  );
}
```

**Step 2: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[any-guild-id]/roster`
Expected: Page loads with breadcrumb "Guild Name > My Roster" and empty state

**Step 3: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx'
git commit -m "feat: create roster overview page with empty state"
```

---

### Task 5: Add CharacterCard Component

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/roster/components/character-card.tsx`

**Step 1: Create CharacterCard component**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/roster/components/character-card.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, Icon } from '@hool/design-system';

interface CharacterCardProps {
  guildId: string;
  characterName: string;
  className: string;
  spec: string;
  role: string;
  currentIlvl: number;
  status: 'ahead' | 'behind' | 'unknown';
}

const CLASS_COLORS: Record<string, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  Druid: '#FF7C0A',
  Evoker: '#33937F',
  Hunter: '#AAD372',
  Mage: '#3FC7EB',
  Monk: '#00FF98',
  Paladin: '#F48CBA',
  Priest: '#FFFFFF',
  Rogue: '#FFF468',
  Shaman: '#0070DD',
  Warlock: '#8788EE',
  Warrior: '#C69B6D',
};

export function CharacterCard({
  guildId,
  characterName,
  className,
  spec,
  role,
  currentIlvl,
  status,
}: CharacterCardProps) {
  const router = useRouter();
  const classColor = CLASS_COLORS[className] || '#ffffff';

  return (
    <Card padding="md" variant="elevated" interactive>
      <button
        onClick={() => router.push(`/guilds/${guildId}/roster/${encodeURIComponent(characterName)}`)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Character name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: classColor,
              margin: 0,
              flex: 1,
            }}
          >
            {characterName}
          </h3>
          {status === 'ahead' && (
            <Icon name="check" size={16} style={{ color: '#10b981' }} />
          )}
          {status === 'behind' && (
            <Icon name="alert-circle" size={16} style={{ color: '#ef4444' }} />
          )}
        </div>

        {/* Spec and role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {spec} {className}
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {role}
          </span>
        </div>

        {/* iLvl */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Icon name="zap" size={14} style={{ color: '#8b5cf6' }} />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {currentIlvl} iLvl
          </span>
        </div>
      </button>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/roster/components/character-card.tsx'
git commit -m "feat: add CharacterCard component for roster overview"
```

---

### Task 6: Integrate Character Cards with Roster Overview

**Files:**
- Modify: `apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx`

**Step 1: Add imports and hooks**

Add to imports:
```tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../lib/auth-context';
import { progressApi } from '../../../../lib/api';
import { CharacterCard } from './components/character-card';
import { PageSkeleton } from '../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../components/error-message';
```

**Step 2: Add data fetching logic**

Replace the entire component with:

```tsx
export default function RosterPage() {
  const { guild, guildId, members: guildMembers } = useGuild();
  const { user } = useAuth();

  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster' },
  ];

  // Fetch user's characters
  const fetchCharacters = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get characters data
      const response = await progressApi.get<any>(
        `/guilds/${guildId}/progress/characters`
      );

      // Filter to user's characters based on bnet_id
      const userGuildMembers = guildMembers.filter(
        (m) => m.bnet_id === user.bnet_id
      );
      const userCharNames = new Set(
        userGuildMembers.map((m) => m.character_name.toLowerCase())
      );

      const userCharacters = response.characters.filter((c: any) =>
        userCharNames.has(c.character_name.toLowerCase())
      );

      setCharacters(userCharacters);
    } catch (err: any) {
      setError(err.message || 'Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, user, guildMembers]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage message={error} onRetry={fetchCharacters} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          My Roster
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          Track your characters, progress, and weekly goals
        </p>
      </div>

      {characters.length === 0 ? (
        <Card padding="lg" variant="elevated">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <Icon name="user" size={48} style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              No Characters Yet
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
                maxWidth: 320,
              }}
            >
              Add your characters to start tracking progress
            </p>
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {characters.map((char) => (
            <CharacterCard
              key={char.character_name}
              guildId={guildId}
              characterName={char.character_name}
              className={char.class_name}
              spec={char.spec}
              role={char.role}
              currentIlvl={char.current_ilvl}
              status={char.progress?.status || 'unknown'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[any-guild-id]/roster`
Expected: Character cards display if user has characters, otherwise empty state

**Step 4: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx'
git commit -m "feat: integrate character cards with data fetching in roster overview"
```

---

## Phase 3: Character Detail Pages

### Task 7: Create Character Detail Page Structure

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx`

**Step 1: Create character detail page with tabs**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useGuild } from '../../../../../lib/guild-context';
import { progressApi } from '../../../../../lib/api';
import { Breadcrumb } from '../../../../../components/breadcrumb';
import { Card, Icon } from '@hool/design-system';
import { PageSkeleton } from '../../../../../components/loading-skeleton';
import { ErrorMessage } from '../../../../../components/error-message';

type Tab = 'overview' | 'bis' | 'vault' | 'professions';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'bis', label: 'BiS List', icon: 'target' },
  { id: 'vault', label: 'Vault', icon: 'award' },
  { id: 'professions', label: 'Professions', icon: 'zap' },
];

export default function CharacterDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { guild, guildId } = useGuild();

  const characterName = decodeURIComponent(params.characterName as string);
  const activeTab = (searchParams.get('tab') as Tab) || 'overview';

  const [characterData, setCharacterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'My Roster', href: `/guilds/${guildId}/roster` },
    { label: characterName },
  ];

  const fetchCharacterData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await progressApi.get<any>(
        `/guilds/${guildId}/progress/character/${encodeURIComponent(characterName)}`
      );
      setCharacterData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load character data');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, characterName]);

  useEffect(() => {
    fetchCharacterData();
  }, [fetchCharacterData]);

  const handleTabClick = (tabId: Tab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.push(url.pathname + url.search);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage message={error} onRetry={fetchCharacterData} />
      </div>
    );
  }

  if (!characterData) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <Card padding="lg" variant="elevated">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <Icon name="alert-circle" size={48} style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Character Not Found
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
              }}
            >
              {characterName} could not be found
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Character header */}
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          {characterName}
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          {characterData.character?.spec_name} {characterData.character?.class_name} • {characterData.character?.current_ilvl} iLvl
        </p>
      </div>

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.25rem',
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }
              }}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <Card padding="lg" variant="elevated">
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Overview content coming soon</p>
          </Card>
        )}
        {activeTab === 'bis' && (
          <Card padding="lg" variant="elevated">
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>BiS List coming soon</p>
          </Card>
        )}
        {activeTab === 'vault' && (
          <Card padding="lg" variant="elevated">
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Vault coming soon</p>
          </Card>
        )}
        {activeTab === 'professions' && (
          <Card padding="lg" variant="elevated">
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Professions coming soon</p>
          </Card>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]/roster/[character-name]`
Expected: Character detail page loads with breadcrumb, tabs, and placeholder content

**Step 3: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx'
git commit -m "feat: create character detail page with tab navigation"
```

---

### Task 8: Integrate Overview Tab with Existing Components

**Files:**
- Modify: `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx`

**Step 1: Import existing progress components**

Add to imports:
```tsx
import { CharacterProgressCard } from '../../../progress/components/character-progress-card';
import { IlvlTracker } from '../../../progress/components/ilvl-tracker';
import { GearPriorityList } from '../../../progress/components/gear-priority-list';
```

**Step 2: Replace overview tab content**

Replace the overview tab section with:

```tsx
{activeTab === 'overview' && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 1fr) minmax(300px, 2fr)',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <CharacterProgressCard
        character={{
          character_name: characterData.character?.character_name,
          class_name: characterData.character?.class_name,
          spec: characterData.character?.spec_name,
          role: 'DPS', // TODO: Get from API
          current_ilvl: characterData.character?.current_ilvl,
          target_ilvl: characterData.target_ilvl,
          status: 'unknown', // TODO: Calculate from progress
        }}
        isSelected
      />
      <IlvlTracker
        currentIlvl={characterData.character?.current_ilvl || 0}
        targetIlvl={characterData.target_ilvl || 0}
        characterName={characterData.character?.character_name || ''}
      />
    </div>
    <div>
      <GearPriorityList
        priorities={characterData.gear_priorities || []}
        characterName={characterData.character?.character_name || ''}
      />
    </div>
  </div>
)}
```

**Step 3: Add responsive styles**

Add at the end of the return statement, before closing `</div>`:

```tsx
<style>{`
  @media (max-width: 768px) {
    [style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }
  }
`}</style>
```

**Step 4: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]/roster/[character-name]`
Expected: Overview tab shows character progress card, ilvl tracker, and gear priorities

**Step 5: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx'
git commit -m "feat: integrate overview tab with existing progress components"
```

---

## Phase 4: Team Progress Page

### Task 9: Create Team Progress Page

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/team-progress/page.tsx`

**Step 1: Create team progress page**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/team-progress/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard, Icon, Divider } from '@hool/design-system';
import { ProtectedRoute } from '../../../../components/protected-route';
import { RoleGate } from '../../../../components/role-gate';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { ErrorMessage } from '../../../../components/error-message';
import { PageSkeleton, StatCardSkeleton } from '../../../../components/loading-skeleton';
import { useGuild } from '../../../../lib/guild-context';
import { progressApi } from '../../../../lib/api';
import { ExpansionRoadmap } from '../progress/components/expansion-roadmap';
import { GuildOverviewTable } from '../progress/components/guild-overview-table';
import { RealmComparison } from '../progress/components/realm-comparison';
import type { GuildMemberProgress } from '../progress/components/guild-overview-table';
import type { RoadmapWeek } from '../progress/components/expansion-roadmap';

interface MembersResponse {
  guild_id: string;
  members: GuildMemberProgress[];
  target_ilvl: number;
  current_week: number;
}

interface RoadmapResponse {
  expansion_id: number;
  weeks: RoadmapWeek[];
}

export default function TeamProgressPage() {
  return (
    <RoleGate minRank={1}>
      <TeamProgressContent />
    </RoleGate>
  );
}

function TeamProgressContent() {
  const { guildId, guild } = useGuild();
  const router = useRouter();

  const [guildOverview, setGuildOverview] = useState<MembersResponse | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'Team Progress' },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        progressApi.get<MembersResponse>(`/guilds/${guildId}/progress/members`),
        progressApi.get<RoadmapResponse>(`/guilds/${guildId}/progress/roadmap`),
      ]);

      if (results[0].status === 'fulfilled') {
        setGuildOverview(results[0].value);
      }

      if (results[1].status === 'fulfilled') {
        setRoadmap(results[1].value);
      }

      if (results.every((r) => r.status === 'rejected')) {
        const firstError = results[0] as PromiseRejectedResult;
        throw firstError.reason;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load team progress data');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    if (!guildOverview?.members) return null;

    const members = guildOverview.members;
    const totalMembers = members.length;
    const avgIlvl =
      totalMembers > 0
        ? members.reduce((sum, m) => sum + m.current_ilvl, 0) / totalMembers
        : 0;
    const onTrack = members.filter((m) => m.status === 'ahead').length;
    const behind = members.filter((m) => m.status === 'behind').length;

    return { totalMembers, avgIlvl, onTrack, behind };
  }, [guildOverview]);

  const handleMemberClick = useCallback(
    (member: GuildMemberProgress) => {
      router.push(`/guilds/${guildId}/roster/${encodeURIComponent(member.character_name)}`);
    },
    [guildId, router]
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error && !guildOverview) {
    return (
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorMessage message={error} onRetry={fetchData} title="Team Progress Unavailable" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Team Progress
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          Guild-wide progress tracking and roster overview
        </p>
      </div>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard
            label="Total Members"
            value={stats.totalMembers}
            icon={<Icon name="user" size={20} />}
            variant="default"
            subtitle="In this guild"
          />
          <StatCard
            label="Average iLvl"
            value={stats.avgIlvl.toFixed(1)}
            icon={<Icon name="zap" size={20} />}
            variant="highlighted"
            subtitle="Across all members"
          />
          <StatCard
            label="On Track"
            value={stats.onTrack}
            icon={<Icon name="check" size={20} />}
            variant="success"
            subtitle={`${stats.totalMembers > 0 ? ((stats.onTrack / stats.totalMembers) * 100).toFixed(0) : 0}% of roster`}
          />
          <StatCard
            label="Behind Schedule"
            value={stats.behind}
            icon={<Icon name="alert-circle" size={20} />}
            variant={stats.behind > 0 ? 'danger' : 'default'}
            subtitle={stats.behind > 0 ? 'Need attention' : 'No one behind'}
          />
        </div>
      )}

      <Divider spacing="md" />

      <ExpansionRoadmap
        weeks={roadmap?.weeks || []}
        currentWeek={guildOverview?.current_week || 1}
        currentIlvl={stats?.avgIlvl}
        expansionId={roadmap?.expansion_id}
      />

      <Divider spacing="md" />

      <GuildOverviewTable
        members={guildOverview?.members || []}
        targetIlvl={guildOverview?.target_ilvl || 0}
        currentWeek={guildOverview?.current_week || 1}
        onMemberClick={handleMemberClick}
        isLoading={false}
      />

      <Divider spacing="md" />

      <RealmComparison guildId={guildId} guildName={guild?.name} realm={guild?.realm} />
    </div>
  );
}
```

**Step 2: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]/team-progress`
Expected: Team progress page loads with stats, roadmap, member table, and realm comparison (officers+ only)

**Step 3: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/team-progress/page.tsx'
git commit -m "feat: create team progress page for guild-wide overview"
```

---

## Phase 5: Migration & Cleanup

### Task 10: Add Role-Based Redirect at Guild Root

**Files:**
- Modify: `apps/web/app/(platform)/guilds/[guildId]/page.tsx`

**Step 1: Import redirect**

Add to imports:
```tsx
import { redirect } from 'next/navigation';
```

**Step 2: Add redirect logic at top of component**

Add this code right after the `useGuild()` hook:

```tsx
// Role-based redirect
useEffect(() => {
  if (isOfficer) {
    // Officers+ land on dashboard
    router.push(`/guilds/${guildId}/dashboard`);
  } else {
    // Raiders land on roster
    router.push(`/guilds/${guildId}/roster`);
  }
}, [isOfficer, guildId, router]);
```

**Step 3: Add router import**

Add to imports:
```tsx
import { useRouter } from 'next/navigation';
```

Add router hook:
```tsx
const router = useRouter();
```

**Step 4: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]`
Expected:
- Raiders redirect to `/roster`
- Officers redirect to `/dashboard`

**Step 5: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/page.tsx'
git commit -m "feat: add role-based redirect from guild root"
```

---

### Task 11: Add Dashboard Page

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/dashboard/page.tsx`

**Step 1: Create dashboard page**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/dashboard/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, StatCard, Button, Icon } from '@hool/design-system';
import { RoleGate } from '../../../../components/role-gate';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { useGuild } from '../../../../lib/guild-context';

export default function DashboardPage() {
  return (
    <RoleGate minRank={1}>
      <DashboardContent />
    </RoleGate>
  );
}

function DashboardContent() {
  const { guild, memberCount, permissions, canAccess, guildId, isGM } = useGuild();
  const router = useRouter();

  const enabledTools = permissions.filter((p) => p.enabled);

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'Dashboard' },
  ];

  const availableTools = [
    {
      name: 'team-progress',
      label: 'Team Progress',
      description: 'Track guild-wide progress, ilvl targets, and member status',
      icon: 'zap',
      href: `/guilds/${guildId}/team-progress`,
    },
    {
      name: 'recruitment',
      label: 'Recruitment',
      description: 'Find, evaluate, and organize recruitment candidates',
      icon: 'search',
      href: `/guilds/${guildId}/recruitment`,
      requiresTool: true,
    },
  ].filter((tool) => !tool.requiresTool || canAccess(tool.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Guild Dashboard
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.45)',
            margin: '0.25rem 0 0 0',
          }}
        >
          Manage your guild and access leadership tools
        </p>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          label="Members"
          value={memberCount}
          icon={<Icon name="user" size={20} style={{ color: '#8b5cf6' }} />}
        />
        <StatCard
          label="Tools Enabled"
          value={enabledTools.length}
          icon={<Icon name="zap" size={20} style={{ color: '#8b5cf6' }} />}
        />
      </div>

      {/* Available tools */}
      {availableTools.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 1rem',
            }}
          >
            Guild Tools
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {availableTools.map((tool) => (
              <Card key={tool.name} padding="lg" variant="elevated" interactive>
                <button
                  onClick={() => router.push(tool.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={tool.icon} size={20} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: 0,
                      }}
                    >
                      {tool.label}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: '0.25rem 0 0',
                        lineHeight: 1.5,
                      }}
                    >
                      {tool.description}
                    </p>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* GM quick actions */}
      {isGM && (
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 1rem',
            }}
          >
            Guild Master Actions
          </h2>
          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push(`/guilds/${guildId}/settings`)}
            icon={<Icon name="settings" size={16} />}
          >
            Guild Settings
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Test in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]/dashboard`
Expected: Dashboard page loads with stats, tools, and GM actions (officers+ only)

**Step 3: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/dashboard/page.tsx'
git commit -m "feat: create guild dashboard page for officers"
```

---

### Task 12: Add Progress Route Redirect

**Files:**
- Create: `apps/web/app/(platform)/guilds/[guildId]/progress/page.tsx`

**Step 1: Create redirect page**

```tsx
// apps/web/app/(platform)/guilds/[guildId]/progress/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProgressRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;

  useEffect(() => {
    // Redirect old /progress route to new /roster route
    router.replace(`/guilds/${guildId}/roster`);
  }, [guildId, router]);

  return null;
}
```

**Step 2: Test redirect**

Run: `pnpm dev`
Navigate to: `http://localhost:3001/guilds/[guild-id]/progress`
Expected: Auto-redirects to `/guilds/[guild-id]/roster`

**Step 3: Commit**

```bash
git add 'apps/web/app/(platform)/guilds/[guildId]/progress/page.tsx'
git commit -m "feat: add redirect from old progress route to roster"
```

---

### Task 13: Update Internal Links

**Files:**
- Modify: `apps/web/app/(platform)/guilds/[guildId]/layout.tsx`
- Modify: `apps/web/app/components/dashboard-header.tsx` (if needed)

**Step 1: Verify all navigation links use new routes**

Check that layout.tsx navigation already uses the new route structure from Task 2.

**Step 2: Check for any hardcoded /progress links**

Run search:
```bash
grep -r "href.*progress" apps/web/app/(platform)/guilds
```

Expected: No results except the redirect page

**Step 3: If any links found, update them**

Replace any `/progress` links with `/roster` or `/team-progress` as appropriate.

**Step 4: Commit if changes made**

```bash
git add [any-modified-files]
git commit -m "fix: update internal links to use new routes"
```

---

### Task 14: Final Testing & Documentation

**Files:**
- Create: `docs/navigation-migration.md`

**Step 1: Create migration guide**

```markdown
# Navigation Migration Guide

## Summary

The guild navigation has been restructured to separate player-focused features from leadership tools.

## Route Changes

### Removed Routes
- `/guilds/[guildId]/progress` → Redirects to `/guilds/[guildId]/roster`

### New Routes
- `/guilds/[guildId]/roster` - My Roster overview (all users)
- `/guilds/[guildId]/roster/[characterName]` - Character detail (all users)
- `/guilds/[guildId]/dashboard` - Guild dashboard (officers+)
- `/guilds/[guildId]/team-progress` - Team progress (officers+)

### Modified Routes
- `/guilds/[guildId]` - Now redirects based on role:
  - Raiders → `/roster`
  - Officers+ → `/dashboard`

## Sidebar Changes

Navigation now has two sections:
- **MY ROSTER** - Personal character tracking
- **GUILD MANAGEMENT** - Leadership tools

## Breadcrumb Navigation

All pages now show breadcrumb navigation below the DashboardHeader for easier navigation.

## For Developers

- Old `/progress` route kept as redirect for backwards compatibility
- Existing progress components reused in new pages
- No database migrations required
- No API changes required

## Testing Checklist

- [ ] Roster overview loads with character cards
- [ ] Character detail page loads with tabs
- [ ] Team progress page loads for officers
- [ ] Dashboard page loads for officers
- [ ] Role-based redirect works from guild root
- [ ] Old /progress route redirects to /roster
- [ ] Breadcrumb navigation works
- [ ] Sidebar section headers visible
- [ ] Character cards clickable → navigate to detail
- [ ] Member table rows clickable → navigate to character detail
```

**Step 2: Commit documentation**

```bash
git add docs/navigation-migration.md
git commit -m "docs: add navigation migration guide"
```

**Step 3: Full test suite**

Manual testing checklist:

1. As Raider:
   - Navigate to `/guilds/[id]` → should redirect to `/roster`
   - Click character card → should navigate to detail page
   - Try all tabs in character detail
   - Old `/progress` link → should redirect to `/roster`

2. As Officer:
   - Navigate to `/guilds/[id]` → should redirect to `/dashboard`
   - Navigate to `/team-progress` → should load
   - Click member in table → should navigate to their character detail
   - Navigate to `/roster` → should work (not exclusive to raiders)

3. As GM:
   - All above tests
   - Settings page accessible

**Step 4: Create final commit**

```bash
git add -A
git commit -m "chore: navigation architecture redesign complete"
```

---

## Implementation Complete

All tasks complete. The navigation architecture has been successfully restructured:

✅ Phase 1: Sidebar with section headers
✅ Phase 2: My Roster overview with character cards
✅ Phase 3: Character detail pages with tabs
✅ Phase 4: Team Progress page
✅ Phase 5: Migration with redirects

**Next Steps:**

1. **API Endpoints** - Implement new endpoints for BiS, Vault, and Professions (deferred to separate work)
2. **Tab Content** - Build out BiS List, Vault, and Professions tab components (deferred to separate work)
3. **12-Week Roadmap** - Add roadmap to roster overview (can reuse existing ExpansionRoadmap component)
4. **User Testing** - Gather feedback from guild members
5. **Performance Optimization** - Add caching and lazy loading

**Open Items:**

- BiS endpoint: `GET /guilds/{guildId}/bis/{characterName}`
- Vault endpoint: `GET /guilds/{guildId}/vault/{characterName}`
- Professions endpoint: `GET /guilds/{guildId}/professions/{characterName}`
- Batch characters endpoint: `GET /guilds/{guildId}/progress/characters?names=...`
- Test with special character names (accented characters)
