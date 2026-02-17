# Frontend Platform Specification

Single Next.js app with unified navigation, design system components, route groups per tool. After login, displays accessible guilds (based on character membership + rank). Uses WoW-inspired Epic Tier design system (sticker-style components) for cohesive experience.

## ADDED Requirements

### Requirement: Unified Navigation Structure
The platform SHALL have consistent navigation across all tools.

#### Scenario: User navigates between tools
- **WHEN** user is in Progress tool (`/guilds/{guild_id}/progress`)
- **THEN** navigation shows:
  - Sidebar OR Top navbar with links:
    - Dashboard
    - Progress
    - Recruitment
    - Guild Settings (GMs only)
- **AND** user clicks "Recruitment"
- **THEN** navigates to `/guilds/{guild_id}/recruitment`
- **AND** navigation updates to show Recruitment as active

#### Scenario: Current guild is always visible in navbar
- **WHEN** user is in any tool
- **THEN** navbar displays: "🏰 Guild Name [▼]"
- **AND** clicking dropdown shows list of accessible guilds
- **AND** user can switch guilds from any page

#### Scenario: Navigation reflects user permissions
- **WHEN** user is Raider (restricted recruitment access)
- **THEN** "Recruitment" link is visible (allowed by GM)
- **AND** "Guild Settings" is hidden (GM only)
- **AND** clicking Recruitment loads page (no 403)

---

### Requirement: Responsive Layout
The platform SHALL work on desktop and mobile devices.

#### Scenario: Desktop layout
- **WHEN** viewed on desktop (1024px+)
- **THEN** layout shows:
  - Left sidebar (200px, collapsible)
  - Main content area (full width)
  - Responsive grid for data tables

#### Scenario: Mobile layout
- **WHEN** viewed on mobile (<768px)
- **THEN** layout shows:
  - Hamburger menu (nav collapses)
  - Full-width content
  - Stacked, touch-friendly buttons
  - Tables scroll horizontally

#### Scenario: Tablet layout is optimized
- **WHEN** viewed on tablet (768px-1024px)
- **THEN** sidebar is visible but narrower
- **AND** content area adapts
- **AND** touch targets remain ≥44px

---

### Requirement: Design System Component Usage
All UI elements SHALL use design system components (WoW-inspired Epic Tier, sticker-style).

#### Scenario: Buttons follow sticker style
- **WHEN** user sees action buttons (Login, Save, Cancel, Delete)
- **THEN** all buttons display:
  - Chamfered octagonal corners (sticker style)
  - Gold color (primary), purple (secondary), red (destructive)
  - Hover animation: text hops, halftone fade
  - Click feedback (visual press)

#### Scenario: Forms use design system inputs
- **WHEN** user fills out guild search or settings
- **THEN** all inputs are styled consistently:
  - Hero variant (animated halftone, chamfered corners)
  - Checkboxes: custom styled, animated
  - Dropdowns: consistent with button style
  - All with matching focus/disabled states

#### Scenario: Cards and panels are consistent
- **WHEN** candidate cards or progress cards are displayed
- **THEN** all cards use:
  - Consistent spacing (padding from tokens)
  - Glassmorphism effect (backdrop blur, subtle border)
  - Card shadows and depth
  - Hover lift animation

#### Scenario: Data tables use design system styling
- **WHEN** guild roster or recruitment list is shown
- **THEN** table uses:
  - Custom header styling (not browser default)
  - Row highlighting on hover
  - Sorted column shows visual indicator
  - Alternating row colors (optional, subtle)

---

### Requirement: Theme and Design Tokens
Colors, typography, and spacing SHALL use design system tokens.

#### Scenario: Colors are consistent across platform
- **WHEN** primary action buttons appear anywhere
- **THEN** all use same gold color: #F5D547
- **AND** secondary buttons use cream: #F5F0E8
- **AND** destructive buttons use red consistently

#### Scenario: Typography follows hierarchy
- **WHEN** page content is displayed
- **THEN** headings use design system sizes:
  - H1: 2rem, 800 weight, -0.5px letter-spacing
  - H2: 1.5rem, 800 weight, -0.3px letter-spacing
  - Body: 0.875rem, 400 weight
- **AND** all text uses Inter font family

#### Scenario: Spacing is consistent
- **WHEN** components are laid out
- **THEN** all use spacing tokens:
  - Padding: 2, 4, 6, 8, 12, 16px (from tokens)
  - Margin: consistent gaps between sections
  - Gutter: 16px between columns in grids

---

### Requirement: Dark Mode/Theme Support
Platform SHALL use dark theme consistent with design system.

#### Scenario: All backgrounds are dark
- **WHEN** user loads any page
- **THEN** background is dark (near black #1d2119 or dark blue)
- **AND** text is light/white
- **AND** contrast meets WCAG AA

#### Scenario: Glass morphism backgrounds
- **WHEN** modals, cards, or panels appear
- **THEN** they use glassmorphism:
  - Semi-transparent background (5-15% opacity)
  - Backdrop blur (8-10px)
  - Subtle border (white, 10-20% opacity)

---

### Requirement: Loading and Error States
All pages SHALL have clear loading and error states.

#### Scenario: Page shows loading indicator
- **WHEN** guild roster is being fetched
- **THEN** system displays:
  - Loading spinner (animated)
  - Message: "Fetching guild roster..."
  - Placeholder cards (skeleton loaders)

#### Scenario: Error message is helpful
- **WHEN** API call fails
- **THEN** system displays:
  - Error icon
  - Message: "Could not load guild roster. Please try again."
  - "Retry" button
  - Optional: "Contact support" link

#### Scenario: Offline state is handled
- **WHEN** user loses internet connection
- **THEN** system displays: "You are offline. Some features are unavailable."
- **AND** cached data is shown (if available)

---

### Requirement: Guild Selection Flow
After login, user is guided to select a guild to access.

#### Scenario: Login redirects to guild selection
- **WHEN** user logs in via Blizzard OAuth
- **THEN** system processes token
- **AND** fetches user's accessible guilds
- **AND** redirects to `/guilds` (guild selection page)

#### Scenario: Guild selection page shows options
- **WHEN** user is on guild selection
- **THEN** system displays:
  - "Your Accessible Guilds"
  - Cards for each guild: Guild Name, Realm, Rank, Number of Members
  - "Create Guild Instance" button (if user is Officer/GM)

#### Scenario: User clicks guild to enter
- **WHEN** user clicks guild card
- **THEN** system redirects to `/guilds/{guild_id}/dashboard`
- **AND** sets guild_id in context/state
- **AND** all subsequent requests use this guild context

#### Scenario: Logout clears guild context
- **WHEN** user clicks Logout
- **THEN** system:
  - Clears JWT tokens
  - Clears guild context
  - Redirects to login/landing page

---

### Requirement: Route Groups and Code Organization
The app SHALL use Next.js route groups for logical separation.

#### Scenario: Route structure is organized
- **WHEN** code is structured
- **THEN** routes follow pattern:
  ```
  app/
  ├─ auth/
  │  ├─ login/
  │  ├─ callback/  (Blizzard OAuth callback)
  │  └─ logout/
  ├─ (platform)/
  │  ├─ guilds/
  │  │  └─ [guildId]/
  │  │     ├─ dashboard/
  │  │     ├─ progress/
  │  │     ├─ recruitment/
  │  │     ├─ settings/
  │  │     └─ layout.tsx (guild nav)
  │  └─ layout.tsx (platform nav)
  └─ layout.tsx (root, auth check)
  ```

#### Scenario: Shared layout per guild
- **WHEN** user navigates between progress and recruitment
- **THEN** both share `/guilds/[guildId]/layout.tsx`
- **AND** nav and sidebar persist (no re-render)
- **AND** only content area changes

---

### Requirement: Performance and Optimization
Frontend SHALL load and respond quickly.

#### Scenario: Pages load in <2 seconds
- **WHEN** user navigates to guild dashboard
- **THEN** page loads and displays within 2 seconds
- **AND** TBT (Total Blocking Time) < 100ms
- **AND** Core Web Vitals are green

#### Scenario: Data is cached appropriately
- **WHEN** user views guild roster
- **THEN** system caches response (5 min)
- **AND** navigating away and back shows cached data instantly
- **AND** user can click "Refresh" to force fetch

#### Scenario: Images and assets are optimized
- **WHEN** candidate profiles load
- **THEN** class icons, realm icons are:
  - WebP format (with fallback)
  - Lazy-loaded (below the fold)
  - Optimized size (<100KB per image)

---

### Requirement: Accessibility
Platform SHALL be accessible to users with disabilities (WCAG 2.1 AA).

#### Scenario: Keyboard navigation works
- **WHEN** user navigates without mouse
- **THEN** all links, buttons, inputs are keyboard-accessible
- **AND** Tab order is logical (left-to-right, top-to-bottom)
- **AND** Focus outline is visible (not removed)

#### Scenario: Screen readers announce content
- **WHEN** screen reader user browses
- **THEN** all images have alt text
- **AND** buttons have ARIA labels
- **AND** form inputs have labels
- **AND** table headers are marked as `<th>`

#### Scenario: Color is not the only indicator
- **WHEN** showing validation errors
- **THEN** errors show:
  - Icon (✗)
  - Color (red)
  - Text message ("This field is required")
  - Not just color alone

---

### Requirement: Error Boundary
The platform SHALL handle component errors gracefully.

#### Scenario: Component crash is isolated
- **WHEN** one component throws an error
- **THEN** Error Boundary catches it
- **AND** displays: "Something went wrong. Please refresh the page."
- **AND** other components continue working
- **AND** page doesn't show white screen of death

#### Scenario: Error is logged for debugging
- **WHEN** error occurs
- **THEN** system logs to monitoring service
- **AND** includes: error message, stack trace, page URL, user context
- **AND** developer can review logs
