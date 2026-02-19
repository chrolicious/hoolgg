# Navigation Architecture Redesign

**Date:** 2026-02-19
**Status:** Approved
**Type:** Architecture Design

## Overview

Restructure guild navigation to separate player-focused features from leadership tools. Split the existing unified "Progress" page into "My Roster" (personal tracking) and "Team Progress" (guild management), creating clear sections for different user roles.

## Goals

- Provide dedicated personal progress tracking interface (like hool.gg Roster app)
- Separate player concerns from leadership/management features
- Simplify navigation with clear "My Roster" vs "Guild Management" sections
- Improve role-based landing experience (Raiders → roster, Officers → dashboard)
- Support comprehensive character tracking: BiS lists, vault, professions, alts

## Navigation Architecture

### Sidebar Structure

```
┌─ MY ROSTER (section header, not clickable)
│  └─ Overview (icon: users, route: /roster)
│
└─ GUILD MANAGEMENT (section header, not clickable)
   ├─ Dashboard (icon: home, route: /dashboard, officers+ only)
   ├─ Team Progress (icon: zap, route: /team-progress, officers+ only)
   ├─ Recruitment (icon: search, route: /recruitment, tool-gated)
   └─ Settings (icon: settings, route: /settings, GM only)
```

### Route Structure

**Root redirect:**
- `/guilds/[guildId]` → Role-based redirect:
  - Raiders → `/guilds/[guildId]/roster`
  - Officers+ → `/guilds/[guildId]/dashboard`

**My Roster routes:**
- `/guilds/[guildId]/roster` → Overview with all characters + 12-week timeline
- `/guilds/[guildId]/roster/[characterName]` → Character detail (BiS, vault, professions, gear)

**Guild Management routes:**
- `/guilds/[guildId]/dashboard` → Guild dashboard (officers+)
- `/guilds/[guildId]/team-progress` → Guild-wide progress overview (officers+)
- `/guilds/[guildId]/recruitment` → Existing recruitment (tool-gated)
- `/guilds/[guildId]/settings` → Existing settings (GM only)

### Active State Logic

- "Overview" is active when on `/roster` or `/roster/[characterName]`
- Other navigation items active only on their specific route
- Character detail pages don't create additional sidebar items (breadcrumb shows navigation path)

## Component Structure

### Updated Guild Layout (layout.tsx)

**Sidebar modifications:**

```tsx
<aside>
  <GuildHeader /> {/* existing guild name/realm */}

  <nav>
    {/* MY ROSTER Section */}
    <SectionHeader label="MY ROSTER" />
    <NavItem href="/roster" icon="users" label="Overview" active={isRosterActive} />

    {/* GUILD MANAGEMENT Section */}
    <SectionHeader label="GUILD MANAGEMENT" />
    {isOfficer && <NavItem href="/dashboard" icon="home" label="Dashboard" />}
    {isOfficer && <NavItem href="/team-progress" icon="zap" label="Team Progress" />}
    {canAccess('recruitment') && <NavItem href="/recruitment" icon="search" label="Recruitment" />}
    {isGM && <NavItem href="/settings" icon="settings" label="Settings" />}
  </nav>

  <GuildSwitcher /> {/* existing */}
</aside>
```

**SectionHeader styling:**
- Font size: 0.625rem
- Letter spacing: 0.75rem
- Transform: uppercase
- Color: rgba(255, 255, 255, 0.3)
- Top padding/margin: 0.75rem for visual separation
- Not clickable (just visual divider)

### Breadcrumb Component

New component: `apps/web/app/components/breadcrumb.tsx`

```tsx
interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}
```

**Renders below DashboardHeader, above page content:**
- Items separated by ">" with rgba(255, 255, 255, 0.3) color
- Last item is white (current page, not clickable)
- Previous items clickable with hover state
- Font size: 0.8125rem
- Bottom margin: 0.75rem

**Breadcrumb patterns:**
- On `/roster`: "Guild Name > My Roster"
- On `/roster/[char]`: "Guild Name > My Roster > Character Name"
- On other pages: "Guild Name > Page Name"

**Edge cases:**
- Very long character names → truncate with ellipsis (max 20 chars)
- Guild name too long → truncate (max 30 chars)
- Mobile: Show only last 2 crumbs, collapse earlier ones into "..."

### My Roster Overview (`/roster/page.tsx`)

**Layout:**
```
┌─ Breadcrumb: "Guild Name > My Roster"
├─ Page header: "My Roster" + subtitle
├─ 12-week roadmap timeline (ExpansionRoadmap component)
├─ Character cards grid (3-4 columns, responsive)
│  └─ Each card: name, class badge, spec, ilvl, role, quick stats
│  └─ Click card → navigate to /roster/[characterName]
└─ "+" Add character button (opens character selector)
```

**Character cards show:**
- Character name (with class color)
- Class badge/icon
- Spec and role
- Current ilvl
- Quick progress indicator (on track / behind)
- Click entire card to drill down

**Empty state (no characters):**
- Icon + message: "No characters tracked yet"
- CTA button: "Add Character" → opens character selector
- 12-week roadmap still visible (shows targets)

### Character Detail (`/roster/[characterName]/page.tsx`)

**Layout:**
```
┌─ Breadcrumb: "Guild Name > My Roster > Bloodmoon"
├─ Character header: name, class badge, spec, ilvl, role
├─ Tab navigation: Overview | BiS List | Vault | Professions
└─ Tab content:
   - Overview: progress card, ilvl tracker, gear priority list
   - BiS List: slot-by-slot BiS item tracking
   - Vault: vault slots, progress bars, rewards
   - Professions: profession levels, recipes, crafting stats
```

**Tab persistence:**
- URL param: `/roster/[characterName]?tab=bis`
- Default: Overview tab
- Tab state persists when navigating back

**Missing data states:**
- BiS List: "No BiS list configured for [class/spec]"
- Vault: "Vault data not synced" with "Sync Now" button
- Professions: "No profession data available"
- Gear Priority: "Gear analysis unavailable" (if Blizzard API fails)

### Team Progress (`/team-progress/page.tsx`)

**Layout (officers+ only):**
```
┌─ Breadcrumb: "Guild Name > Team Progress"
├─ Page header + stats cards:
│  └─ Avg iLvl, On Track, Behind Schedule
├─ 12-week roadmap (team aggregate view)
│  └─ Shows guild avg ilvl overlay on timeline
├─ Guild overview table (sortable by name, ilvl, progress, status)
│  └─ Click row → navigate to /roster/[characterName]
└─ Realm comparison (competitive positioning)
```

**Guild overview table:**
- Reuses existing GuildOverviewTable component
- Sortable columns: name, class, ilvl, progress %, status
- Click member → navigate to their character detail page
- Shows all guild members (not just tracked characters)

**Empty state:**
- "No member data available"
- Roadmap still visible
- Realm comparison shows placeholder

## Data Flow & API Integration

### My Roster Overview

**Data needed:**
- User's tracked characters (from `user_tracked_characters` table)
- Current ilvl, spec, role for each character
- 12-week roadmap data

**API calls:**
- `GET /guilds/{guildId}/tracked-characters` → user's characters
- `GET /guilds/{guildId}/progress/roadmap` → existing roadmap endpoint
- `GET /guilds/{guildId}/progress/characters?names=char1,char2,char3` → batch character fetch (new, optimized)

**Caching:**
- Roadmap: 1-2 hour TTL
- Character stats: 15-30 min TTL
- Tracked characters list: Session storage (invalidate on add/remove)

### Character Detail

**Data needed:**
- Full character data (gear, stats, progress)
- BiS list for character's class/spec
- Vault status and rewards
- Profession levels and progress

**API calls:**
- `GET /guilds/{guildId}/progress/character/{characterName}` → existing, returns gear priorities
- `GET /guilds/{guildId}/bis/{characterName}` → **NEW:** BiS list tracking
- `GET /guilds/{guildId}/vault/{characterName}` → **NEW:** vault slots, progress
- `GET /guilds/{guildId}/professions/{characterName}` → **NEW:** profession data

**URL encoding:**
- Character names with special characters: `encodeURIComponent(characterName)`
- Example: "Dëathknight" → `/roster/D%C3%ABathknight`
- Decode on server: `decodeURIComponent(params.characterName)`

### Team Progress

**Reuses existing endpoints:**
- `GET /guilds/{guildId}/progress/members` → existing guild overview
- `GET /guilds/{guildId}/progress/roadmap` → existing roadmap
- Stats calculated from members data (avg ilvl, on track, behind)

**Realm comparison:**
- Client-side integration with WarcraftLogs (existing)

### New API Endpoints Summary

1. **`GET /guilds/{guildId}/bis/{characterName}`** → BiS list tracking
   - Returns: slot-by-slot BiS items, current items, status (have/need)

2. **`GET /guilds/{guildId}/vault/{characterName}`** → Vault data
   - Returns: 3 vault slots with unlock status, ilvl rewards, progress %

3. **`GET /guilds/{guildId}/professions/{characterName}`** → Profession data
   - Returns: profession levels, specializations, recipes, crafting stats

4. **`GET /guilds/{guildId}/progress/characters?names=...`** → Batch character fetch
   - Returns: array of character quick stats (ilvl, spec, role, progress)
   - Optimization for overview page

### Existing Endpoints (Reused)

- `GET /guilds/{guildId}/progress/roadmap`
- `GET /guilds/{guildId}/progress/character/{characterName}`
- `GET /guilds/{guildId}/progress/members`
- `GET /guilds/{guildId}/tracked-characters`
- `PATCH /guilds/{guildId}/tracked-characters` (from dashboard-header design)

## Migration Strategy

### Breaking Changes

1. **Route `/guilds/[guildId]/progress` is removed:**
   - Old: `/progress` → unified page with personal + team views
   - New: Split into `/roster` (personal) and `/team-progress` (guild)

2. **Default landing page changes:**
   - Old: `/guilds/[guildId]` → always shows dashboard
   - New: Role-based redirect (Raiders → `/roster`, Officers → `/dashboard`)

### Migration Approach: Hard Cut (Clean Break)

**Phase 1: Build new routes (parallel to existing)**
- Add `/roster` and `/roster/[characterName]` routes
- Add `/team-progress` route
- Keep existing `/progress` route working
- No user-facing changes yet

**Phase 2: Update navigation**
- Add section headers to sidebar (MY ROSTER, GUILD MANAGEMENT)
- Update navigation items to new structure
- Add breadcrumb component
- Both old and new routes still work

**Phase 3: Redirect logic**
- Add role-based redirect from `/guilds/[guildId]`
- Add redirect: `/progress` → `/roster` (for all users)
- Update all internal links to use new routes

**Phase 4: Remove old route**
- Delete `/progress` directory
- Remove old navigation logic
- Clean up unused components

**Why hard cut:**
- No user data migration needed (just routes)
- Cleaner codebase (no legacy support)
- Users will adapt quickly with clear navigation
- Simpler implementation and testing

## Error Handling & Edge Cases

### No Characters Tracked

**My Roster overview:**
- Empty state card with icon
- Message: "No characters tracked yet"
- CTA button: "Add Character" → opens character selector
- 12-week roadmap still visible (shows targets without character overlay)

### Character Detail - Missing Data

**For each section:**
- BiS List: "No BiS list configured for [class/spec]"
- Vault: "Vault data not synced" with "Sync Now" button
- Professions: "No profession data available"
- Gear Priority: "Gear analysis unavailable" (if API fails)

### Team Progress - No Data

- Empty state: "No member data available"
- Roadmap still visible
- Realm comparison shows placeholder or "Not enough data"

### Permission Changes Mid-Session

**User loses officer rank:**
- Auto-redirect from `/team-progress` to `/roster`
- Show toast: "You no longer have access to this page"

**User gains officer rank:**
- Show toast notification: "You can now access Team Progress and Dashboard"
- Sidebar updates to show new items

**User removed from guild:**
- Redirect to `/guilds` with error message
- Clear guild context

### API Failures

**Graceful degradation:**
- Show cached data with timestamp: "Last updated 2h ago"
- Retry button if data is stale (>6 hours)
- Error boundaries catch catastrophic failures
- Toast notifications for failed mutations

**Specific error states:**
- Blizzard API down: "Unable to fetch character data" with manual refresh
- Database error: "Failed to load progress" with retry
- Network timeout: "Request timed out" with automatic retry

### Character Name Not Found

- `/roster/InvalidName` → Custom 404 page
- Message: "Character not found"
- Link back to `/roster` overview
- Suggest similar character names if available (fuzzy match)

### Loading States

**Roster overview:**
- Skeleton cards grid (3-4 placeholders)
- Roadmap skeleton
- Breadcrumb shows immediately (uses route params)

**Character detail:**
- Skeleton for each tab content
- Character header shows immediately (from route params)
- Tab navigation loads first, content follows

**Team progress:**
- Skeleton for stats cards
- Skeleton for table rows
- Roadmap skeleton

**Breadcrumb:**
- No skeleton (renders immediately from route params)
- Truncates long names (max 20 chars for character, 30 for guild)

### Special Characters in Character Names

**Handling:**
- Use `encodeURIComponent(characterName)` for URLs
- Use `decodeURIComponent(params.characterName)` on server
- Always display original character name (with accents/special chars)
- Never show encoded version to users

**Open question (verify during implementation):**
- How does Blizzard API handle special characters?
  1. Preserve exact characters? ("Dëathknight" stays as-is)
  2. Normalize? ("Dëathknight" becomes "Deathknight")
  3. Use character ID instead of name?
- If Blizzard normalizes, store both `display_name` and `normalized_name` in database
- Test with accented character names during implementation

## Technical Considerations

### Performance

**Optimization strategies:**
- Batch character fetch endpoint reduces N+1 queries
- Aggressive caching (1-2 hour TTL for roadmap, 15-30 min for character stats)
- Lazy load character detail tabs (fetch BiS/Vault/Professions on tab click)
- Prefetch likely next page (e.g., first character card on overview)

**Data loading:**
- Overview page: 3 API calls (tracked chars, roadmap, batch character stats)
- Character detail: 1 initial call (overview tab), 3 lazy (other tabs)
- Team progress: 2 calls (members, roadmap)

### Accessibility

**Keyboard navigation:**
- All sidebar items and breadcrumb links keyboard accessible
- Tab navigation in character detail
- Character cards have clear focus states

**Screen reader labels:**
- Section headers: "Navigation section: My Roster"
- Breadcrumb: "Breadcrumb navigation"
- Character cards: "View details for [Character Name]"
- Tab navigation: "Tab 1 of 4: Overview"

**Focus management:**
- Tab switches preserve focus
- Modal/dropdown (character selector) traps focus
- ESC key closes overlays

### Responsive Design

**Mobile adaptations:**
- Sidebar collapses (existing hamburger menu)
- Character cards: 1 column on mobile, 2 on tablet, 3-4 on desktop
- Breadcrumb: Show only last 2 items on mobile ("... > Current Page")
- Tab navigation: Horizontal scroll on mobile
- Table: Horizontal scroll with sticky first column

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Implementation Phases

### Phase 1: Sidebar & Navigation (No breaking changes)

**Tasks:**
- Add section headers (SectionHeader component)
- Update sidebar with MY ROSTER / GUILD MANAGEMENT sections
- Add breadcrumb component
- Update existing navigation to use new structure
- Keep `/progress` route working

**Files:**
- `apps/web/app/(platform)/guilds/[guildId]/layout.tsx` (modify)
- `apps/web/app/components/breadcrumb.tsx` (create)

### Phase 2: My Roster Overview

**Tasks:**
- Create `/roster/page.tsx`
- Character cards grid
- Reuse ExpansionRoadmap component
- Add character button (character selector integration)
- Empty state handling

**Files:**
- `apps/web/app/(platform)/guilds/[guildId]/roster/page.tsx` (create)
- `apps/web/app/(platform)/guilds/[guildId]/roster/components/character-card.tsx` (create)

**API work:**
- Implement batch character endpoint: `GET /progress/characters?names=...`

### Phase 3: Character Detail Pages

**Tasks:**
- Create `/roster/[characterName]/page.tsx`
- Tab navigation (Overview, BiS, Vault, Professions)
- Overview tab: reuse existing components (CharacterProgressCard, IlvlTracker, GearPriorityList)
- BiS tab: new component
- Vault tab: new component
- Professions tab: new component

**Files:**
- `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/page.tsx` (create)
- `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/components/bis-list.tsx` (create)
- `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/components/vault-tracker.tsx` (create)
- `apps/web/app/(platform)/guilds/[guildId]/roster/[characterName]/components/profession-overview.tsx` (create)

**API work:**
- Implement BiS endpoint: `GET /bis/{characterName}`
- Implement Vault endpoint: `GET /vault/{characterName}`
- Implement Professions endpoint: `GET /professions/{characterName}`

### Phase 4: Team Progress Page

**Tasks:**
- Create `/team-progress/page.tsx`
- Reuse existing components: GuildOverviewTable, ExpansionRoadmap, RealmComparison
- Stats cards at top
- Add click handler on table rows → navigate to character detail

**Files:**
- `apps/web/app/(platform)/guilds/[guildId]/team-progress/page.tsx` (create)

**API work:**
- Reuse existing endpoints (no new API work)

### Phase 5: Migration & Cleanup

**Tasks:**
- Add role-based redirect at `/guilds/[guildId]`
- Add redirect: `/progress` → `/roster`
- Update all internal links to new routes
- Delete `/progress` directory
- Clean up unused components
- Test all edge cases

**Files:**
- `apps/web/app/(platform)/guilds/[guildId]/page.tsx` (modify for redirect)
- `apps/web/app/(platform)/guilds/[guildId]/progress/` (delete entire directory)

## Testing Strategy

### Unit Tests

**Component tests:**
- SectionHeader renders correctly
- Breadcrumb handles truncation
- Character cards display correct data
- Tab navigation switches content
- Empty states render

### Integration Tests

**Navigation flow:**
- Role-based redirect works (Raider → roster, Officer → dashboard)
- Breadcrumb updates on navigation
- Sidebar active state updates
- Character selector integration

**Data flow:**
- API calls fetch correct data
- Batch character endpoint optimization
- Caching works as expected
- Error states handled gracefully

### Visual Regression

**Storybook stories:**
- Section headers
- Breadcrumb (various lengths, truncation)
- Character cards (different classes, stats)
- Empty states
- Loading skeletons
- Tab navigation

### E2E Tests

**User flows:**
- Raider lands on roster, views character detail, switches tabs
- Officer views team progress, clicks member, views their detail
- Officer switches between dashboard and team progress
- User with no characters sees empty state, adds character
- Permission change redirects correctly

## Open Questions

1. **Blizzard API character name handling:**
   - How does Blizzard API handle special characters (accents, non-Latin)?
   - Do they preserve exact characters or normalize?
   - Should we store both `display_name` and `normalized_name`?
   - **Action:** Test with accented character names during Phase 3

2. **BiS List Data Source:**
   - Where does BiS list data come from? (Manual entry? Import from external source?)
   - Who can edit BiS lists? (GMs only? Officers? Individual players for their chars?)
   - **Action:** Clarify during Phase 3 implementation

3. **Vault Sync Strategy:**
   - How often should vault data sync from Blizzard API?
   - Manual "Sync Now" button + automatic background sync?
   - **Action:** Define sync strategy during Phase 3

## References

- Existing Progress page: `apps/web/app/(platform)/guilds/[guildId]/progress/page.tsx`
- Guild context: `apps/web/app/lib/guild-context.tsx`
- Dashboard header design: `docs/plans/2026-02-19-dashboard-header-design.md`
- Design system: `packages/design-system/`
