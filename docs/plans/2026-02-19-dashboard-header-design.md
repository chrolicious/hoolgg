# Dashboard Header Design

**Date:** 2026-02-19
**Status:** Approved
**Type:** Feature Design

## Overview

Full-width sticker-style badge header for the guild dashboard that displays relevant guild information, user progress, and actionable insights. The header provides role-specific views (GM/Officer vs Raider) with at-a-glance stats and quick navigation to tools.

## Goals

- Provide high-level snapshot of guild and personal progress
- Enable quick navigation to relevant tools and sections
- Surface actionable insights for GMs/Officers (members falling behind)
- Maintain visual consistency with existing Badge component aesthetic
- Support character management (add/remove characters, set main)

## Component Architecture

### DashboardHeader Component

New component in `apps/web` that uses the Badge component with horizontal orientation.

**Structure:**
```
DashboardHeader
├─ Badge (orientation="horizontal", variant based on role/context)
   ├─ profileIcon: Guild emblem/tabard (rendered from Blizzard API data)
   ├─ BadgeHeader: Guild name + realm
   ├─ BadgeBody: Role-specific stats (GM/Officer vs Raider)
   └─ BadgeFooter: Quick action links (clickable sections)
```

### Badge CSS Modifications

- Add `.horizontal` class that swaps width/height CSS variables
- Change flex-direction from column to row
- Reposition star/particle animations for horizontal layout
- Keep all existing layers, textures, outline system intact

### Props

```typescript
interface DashboardHeaderProps {
  guild: Guild;
  userRole: 'gm' | 'officer' | 'raider';
  characterData?: CharacterProgress; // User's main character
  guildStats?: GuildStats; // For GM/Officers
  onClick?: (section: string) => void; // Navigate to tools
}
```

## Data Flow & Character Management

### Guild Emblem/Tabard

- Add new endpoint to `blizzard_service.py`: `fetch_guild_crest(access_token, guild_name, realm_slug, region)`
- Blizzard API provides crest data: emblem icon ID, background color, border type, border color
- Store crest data in Guild model or cache it (avoid repeated API calls)
- Render emblem as SVG or use Blizzard's render service URL: `https://render.worldofwarcraft.com/us/guild/crest/emblem/{emblemId}.png`
- **Dual use:** Also display emblem in navbar next to guild name

### Character Management

**User Character Tracking:**
- User can have multiple WoW characters, selects which to track for this guild
- One character marked as "main" (shown prominently in header)
- Character selector accessible via click on character section

**Character Selector UI:**
- Click character area → dropdown overlay appears
- Shows all user's characters from Blizzard API
- Each character entry:
  - Checkbox: add/remove from tracking
  - Star icon: set as main (filled star = current main)
  - Character info: name, class, ilvl, realm
- Changes auto-save via API

**Data Storage:**
- New table: `user_tracked_characters`
  - Columns: `guild_id`, `bnet_id`, `character_name`, `realm`, `is_main`, `tracked`
- API endpoint: `PATCH /guilds/{guildId}/tracked-characters` for updates
- API endpoint: `GET /guilds/{guildId}/tracked-characters` to fetch user's tracked characters

### Dashboard Stats API

**New endpoint:** `GET /guilds/{guildId}/dashboard-stats?view=team|personal`

**Returns:**
- **For Raiders (personal view only):**
  - Main character stats: name, class, ilvl, spec
  - Weekly progress percentage (vault slots + task completion)
  - Vault slots: 3 objects with `{ unlocked: boolean, ilvlReward: number }`

- **For GM/Officers (team view):**
  - Guild avg ilvl + trend (↑/↓ from last week)
  - Team completion: `{ onTrack: 32, total: 45 }`
  - Members falling behind: `{ count: 8, details: [...] }`

- **For GM/Officers (personal view):**
  - Same as Raider view

**"Falling Behind" Detection Criteria:**
- Weekly vault progress < 50% complete (e.g., only 1-2 slots unlocked mid-week)
- ilvl below guild target or significantly below average (e.g., 15+ ilvl gap)
- Missing enchants/gems on equipped gear
- No weekly activity (hasn't completed any tracked tasks)

### Data Fetching Strategy

- Use existing `useGuild()` context (provides guild, userRank, members)
- Add new hook: `useDashboardStats()` that fetches dashboard-specific data
- Cache aggressively (1-2 hour TTL) since this is summary data
- Real-time updates not critical for dashboard header

## Visual Layout & Content

### Horizontal Badge Dimensions

- Full width of content area (adapts to container)
- Height: ~120-140px (shorter than vertical badge)
- Same bevel, border, layer system as existing Badge

### Content Layout (Left to Right)

**1. Guild Emblem (profileIcon position)**
- 80x80px guild tabard/crest
- Left-most section, visually anchors the badge
- Clickable → Guild info/settings

**2. Guild Info (BadgeHeader)**
- Guild name (larger, bold)
- Realm name (smaller, dimmed)
- Stacked vertically, centered

**3. Stats Section (BadgeBody)**

**Raider View:**
- Main character name + class icon
- ilvl (large number)
- Weekly progress bar + percentage
- Vault slots: 3 boxes showing unlock status (✓/empty) with ilvl rewards

**Team View (GM/Officers):**
- "Team Overview" label
- Guild avg ilvl + trend indicator
- Completion: "32/45 on track"
- ⚠️ Action badge: "8 need attention" (red, pulsing)
  - Click → opens modal with list of members falling behind
  - Shows: character name, issue (missing enchants, low ilvl, no progress)
  - Quick actions: copy to clipboard, filter by issue type

**My Character View (GM/Officers):**
- Same as Raider View

**4. Navigation/Actions (BadgeFooter or integrated)**

**Raiders:**
- Character selector icon (clickable)

**GM/Officers:**
- Left/right arrows for view switching (Team ↔ My Character)
- View indicator dots (•○ or ○•)
- Character selector icon when in "My Character" view

### Clickable Regions

- Whole badge is interactive (subtle hover effect)
- Each stat section clickable → navigates to relevant tool (Progress, Vault, etc.)
- Emblem click → Guild info/settings
- Character selector icon → opens dropdown
- View arrows → switch between Team/Personal views (GM/Officers only)

## Header View Modes (GM/Officers)

**Team View:**
- Guild-wide stats (avg ilvl, roster completion %, team vault progress)
- Highlights members falling behind with action badge

**My Character View:**
- Personal stats (main char ilvl, weekly progress, vault slots)
- Same experience as Raiders

**Navigation:**
- Arrow buttons on left/right edges of badge
- Small indicator dots show which view is active (2 dots: •○ or ○•)
- Swipe gesture support (optional, future enhancement)

**Raiders:**
- Only see "My Character View" (no toggle needed)
- Click character area opens character selector dropdown

## Error Handling & Edge Cases

### Missing Data Scenarios

**1. No Guild Emblem Available:**
- Fallback: Faction icon (Alliance/Horde shield) or guild initial letter
- Styled to match badge aesthetic

**2. No Characters Tracked:**
- Show placeholder: "Add your characters to start tracking"
- CTA button: "Select Characters"
- Opens character selector immediately

**3. No Main Character Set:**
- Show first tracked character's stats
- Prompt: "Set a main character" with star icon

**4. Blizzard API Failure:**
- Show cached data with timestamp: "Last updated 2h ago"
- Retry button if data is stale (>6 hours)
- Error state: "Unable to fetch data" with manual refresh option

**5. No Weekly Progress Data:**
- Show 0% with message: "Start your weekly progress"
- Link to tasks/vault tracking

### Loading States

- Skeleton badge while fetching data
- Same dimensions/shape as full badge
- Pulsing animation on content areas
- Emblem loads first (cached), stats load second

### Permission Edge Cases

- If user loses guild membership → show "You are no longer in this guild"
- If rank changes mid-session → refresh permissions and view mode
- If tools get disabled → gray out relevant stat sections

## Testing & Implementation Phases

### Testing Strategy

**1. Component Testing:**
- Badge horizontal variant renders correctly
- Character selector dropdown opens/closes
- View toggle works for GM/Officers
- Stat sections are clickable and navigate correctly

**2. Integration Testing:**
- Guild emblem fetches and displays from Blizzard API
- Character data syncs with progress-api
- User tracked characters persist across sessions
- Team view calculations are accurate

**3. Visual Regression:**
- Storybook stories for all variants (Raider, GM Team, GM Character)
- Different data states (full data, loading, error, empty)
- Responsive behavior (different container widths)

### Implementation Phases

**Phase 1: Badge Horizontal Variant**
- Add horizontal CSS to Badge component
- Test with static data in Storybook
- Verify all visual layers work (outline, particles, stars)

**Phase 2: DashboardHeader Component**
- Build component structure using Badge
- Wire up with mock data
- Implement character selector UI
- Add view toggle for GM/Officers

**Phase 3: Backend Integration**
- Add guild crest endpoint to blizzard_service.py
- Create dashboard-stats endpoint in progress-api
- Implement user_tracked_characters table and API
- Cache strategy for emblem and stats

**Phase 4: Polish & Edge Cases**
- Loading states, error handling
- Animations and transitions
- Click handlers and navigation
- "Falling behind" detection logic

## Technical Considerations

### Performance

- Cache guild emblem (rarely changes)
- Cache dashboard stats with 1-2 hour TTL
- Lazy load character selector (only fetch when opened)
- Optimize "falling behind" calculation (run server-side, not client)

### Accessibility

- Keyboard navigation for all interactive elements
- Screen reader labels for stats and icons
- Focus management for dropdown/modal
- ARIA labels for view toggle and clickable regions

### Responsive Design

- Badge adapts to container width (full-width)
- Stack content vertically on mobile (< 768px)
- Reduce emblem size on smaller screens
- Collapse some stats into expandable sections on mobile

## Future Enhancements

- Swipe gestures for view switching on mobile
- Animated transitions between Team/Personal views
- Customizable stats (let users choose what to display)
- Historical trend graphs (hover to see ilvl over time)
- Quick actions: "Message all falling behind" button for GMs
- Integration with Discord bot for automated reminders

## Open Questions

None - all design sections approved.

## References

- Existing Badge component: `packages/design-system/src/components/primitives/Badge.tsx`
- Guild context: `apps/web/app/lib/guild-context.tsx`
- Blizzard service: `services/guild-api/app/services/blizzard_service.py`
