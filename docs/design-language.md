# hool.gg Design Language

## Foundation

**Aesthetic**: Game UI adapted for web. Inspired by Super Mario Bros. Wonder's menu system — rounded, bold, tactile, animated. Applied with a WoW-appropriate color palette.

**Mode**: Dark only.

**Personality**: Confident, playful, polished. Feels like a premium game interface, not a generic web app.

---

## Color Palette — "Epic Tier" (Purple + Gold)

### Backgrounds
Dark surfaces with a purple undertone. Layered from deepest to most elevated.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0e0b12` | Page background, deepest layer |
| `bg-surface` | `#19151e` | Cards, panels, primary surfaces |
| `bg-elevated` | `#221d29` | Elevated panels, popovers, dropdowns |
| `bg-overlay` | `#2c2535` | Hover states on surfaces, secondary elevated |

### Primary Accent — Purple
Ambient, atmospheric. Used for surface tinting, borders, badges, selection backgrounds.

| Token | Hex | Usage |
|-------|-----|-------|
| `purple-900` | `#4C1D95` | Darkest — subtle borders, deep tints |
| `purple-700` | `#7C3AED` | Medium — active borders, icon backgrounds |
| `purple-500` | `#A855F7` | Core — selection states, highlighted items |
| `purple-400` | `#C084FC` | Light — text accents, badges, labels |
| `purple-200` | `#DDD6FE` | Lightest — subtle text highlights |

### Action Accent — Gold
Primary calls-to-action. Where the user should click. The "do something" color.

| Token | Hex | Usage |
|-------|-----|-------|
| `gold-900` | `#6B4F10` | Darkest — subtle tints |
| `gold-700` | `#8B6914` | Dark — pressed/active button state |
| `gold-500` | `#D4A017` | Core — primary buttons, active selections |
| `gold-400` | `#E8B82A` | Light — button borders, hover states |
| `gold-200` | `#F5D060` | Lightest — highlights, glow effects |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#FFFFFF` | Headings, important text |
| `text-secondary` | `#A8A3B3` | Body text, descriptions |
| `text-muted` | `#6B6578` | Hints, placeholders, disabled |
| `text-on-gold` | `#1a1400` | Text on gold backgrounds |
| `text-on-purple` | `#FFFFFF` | Text on purple backgrounds |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Success states, confirmations |
| `error` | `#EF4444` | Errors, destructive actions |
| `info` | `#3B82F6` | Informational, links |
| `warning` | `#F59E0B` | Warnings, caution |

---

## Typography

**Font stack**: `Inter` for all UI text. Variable weight for flexibility.

**Fallback**: `system-ui, -apple-system, sans-serif`

### Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `display` | 48px / 3rem | 900 (Black) | Hero sections, landing page |
| `h1` | 32px / 2rem | 800 (ExtraBold) | Page titles |
| `h2` | 24px / 1.5rem | 800 | Section headers |
| `h3` | 18px / 1.125rem | 700 (Bold) | Card titles, subsections |
| `body` | 14px / 0.875rem | 400 (Regular) | Default body text |
| `body-strong` | 14px / 0.875rem | 600 (SemiBold) | Emphasized body text |
| `small` | 12px / 0.75rem | 500 (Medium) | Captions, metadata |
| `tiny` | 11px / 0.6875rem | 600 | Badges, tags, labels |

### Line Heights
- Headings: 1.2
- Body: 1.5
- Small/tiny: 1.4

### Letter Spacing
- Display/H1: -0.5px (tighter)
- H2/H3: -0.3px
- Body: 0 (default)
- Tiny/badges: 0.5px (wider, uppercase)

---

## Spacing

8px base unit. Consistent scale throughout.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Inline spacing, small gaps |
| `space-3` | 12px | Form field padding, list item gaps |
| `space-4` | 16px | Card padding (compact), section gaps |
| `space-5` | 20px | Default element spacing |
| `space-6` | 24px | Card padding (standard) |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Page section gaps |
| `space-12` | 48px | Large section spacing |
| `space-16` | 64px | Page-level vertical rhythm |

---

## Borders

### Radii
Generous, rounded. Nothing sharp.

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Small elements, badges, tags |
| `radius-md` | 12px | Buttons, inputs, list items |
| `radius-lg` | 16px | Cards, panels |
| `radius-xl` | 20px | Modals, drawers |
| `radius-full` | 9999px | Pills, avatars, circular buttons |

### Border Widths
| Token | Value | Usage |
|-------|-------|-------|
| `border-thin` | 1px | Subtle dividers, surface borders |
| `border-medium` | 2px | Grid cells, card outlines |
| `border-thick` | 3px | Buttons (Mario Wonder style), active card borders |

### Border Colors
| Token | Usage |
|-------|-------|
| `border-subtle` | `rgba(255,255,255,0.08)` — barely visible surface edges |
| `border-muted` | `rgba(255,255,255,0.12)` — inactive card borders |
| `border-default` | `rgba(255,255,255,0.2)` — visible borders, dividers |
| `border-accent` | `purple-700` — active/focused borders |
| `border-action` | `gold-400` — primary button borders |

---

## Shadows

Minimal — depth is communicated more through background layering and borders than shadow.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` | Tooltips, small popovers |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` | Cards, dropdowns |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modals, drawers |
| `shadow-glow-purple` | `0 0 20px rgba(168,85,247,0.3)` | Purple glow on hover/focus |
| `shadow-glow-gold` | `0 0 20px rgba(212,160,23,0.3)` | Gold glow on primary actions |

---

## Surface Texture

### Checkered Pattern
Signature texture on dark surfaces. Subtle, low-opacity, adds depth.

- 45-degree diagonal checkerboard
- Pattern size: 16px cells
- Opacity: 4-6% on surfaces, 8-10% on elevated surfaces
- Color: matches the accent (purple tint)
- Applied via CSS pseudo-element or background-image

### Blurred Backgrounds
For full-page backgrounds and hero sections:
- Stylized WoW-themed artwork, heavily blurred (20-40px blur)
- Dark overlay on top (60-80% opacity of `bg-base`)
- Content sits on top with surface cards

---

## Animation Principles

All powered by Framer Motion.

### Timing
| Token | Duration | Usage |
|-------|----------|-------|
| `duration-fast` | 150ms | Hover states, color transitions |
| `duration-normal` | 250ms | Component enter/exit, selection changes |
| `duration-slow` | 400ms | Page transitions, modals |
| `duration-slower` | 600ms | Stagger groups, complex sequences |

### Easing
| Token | Value | Usage |
|-------|-------|-------|
| `ease-out` | `[0, 0, 0.2, 1]` | Elements entering — fast start, gentle stop |
| `ease-in` | `[0.4, 0, 1, 1]` | Elements exiting — gentle start, fast out |
| `ease-in-out` | `[0.4, 0, 0.2, 1]` | Moving/resizing elements |
| `ease-bounce` | `[0.34, 1.56, 0.64, 1]` | Playful emphasis (badges, notifications) |

### Spring Physics
For elements that should feel physical and tactile:

| Token | Config | Usage |
|-------|--------|-------|
| `spring-snappy` | `{ stiffness: 400, damping: 30 }` | Quick snaps — button press, toggle |
| `spring-gentle` | `{ stiffness: 200, damping: 20 }` | Smooth movement — cards, panels |
| `spring-bouncy` | `{ stiffness: 300, damping: 15 }` | Playful bounce — notifications, badges |

### Animation Patterns

**Enter/Mount**:
- Fade in + slight scale up (0.96 → 1.0)
- Or: slide in from direction + fade

**Exit/Unmount**:
- Fade out + slight scale down (1.0 → 0.96)
- Or: slide out in direction + fade

**Selection/Active State**:
- Background color fill with spring transition
- Subtle scale bump on select (1.0 → 1.02 → 1.0)

**Hover**:
- Gentle lift: translateY(-2px) + shadow increase
- Border color transition to accent
- Subtle glow effect for primary actions

**Stagger Groups**:
- Children animate in sequence with 50-80ms delay between items
- Used for lists, grids, navigation items

**Page Transitions**:
- Directional slide (content slides left/right based on navigation direction)
- Cross-fade between pages (150ms overlap)
- Navbar stays fixed, only content area transitions

**Pattern/Texture Animation**:
- Subtle slow drift on checkered background patterns
- Slight parallax on background texture layers on scroll
- Button patterns: shimmer effect on hover (gradient sweep across texture)

**Loading/Progress**:
- Skeleton pulse with purple-tinted gradient
- Spinner: rotating with gold accent

---

## Component Inventory

All components follow these patterns:
- Thick rounded borders (Mario Wonder style)
- Gold for primary actions, purple for ambient/selection
- Checkered texture on dark surfaces
- Framer Motion enter/exit/hover animations
- TypeScript props with variants (size, color, state)

### Primitives
Button, Input, Select, Checkbox, Toggle, Badge, Tag, Avatar, Icon, Tooltip

### Layout
Container, Stack, Grid, Divider, Spacer

### Surfaces
Card, Panel, Modal, Drawer, Sheet, Popover

### Navigation
Navbar, Sidebar, Tabs, Breadcrumb, Pagination

### Data Display
Table, DataGrid, List, Stat, Progress

### Feedback
Spinner, Skeleton, Alert, Toast, EmptyState

### Animation Wrappers
FadeIn, SlideIn, StaggerGroup, PageTransition, GlowEffect, ParallaxScroll
