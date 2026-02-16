# Design Tokens - Quick Reference Guide

## Font Weights
Use these tokens for all typography weights in components.

```css
var(--font-weight-regular)    /* 400 - Body text */
var(--font-weight-medium)     /* 500 - Form labels */
var(--font-weight-semibold)   /* 600 - Badge text */
var(--font-weight-bold)       /* 700 - Button text, headings */
var(--font-weight-extrabold)  /* 800 - Large headings */
var(--font-weight-black)      /* 900 - Display text */
```

**Location:** `/packages/design-system/src/css/globals.css`

---

## Spacing

Use spacing tokens for padding, margin, and gaps. All values are in 4px increments.

```css
var(--hool-space-1)     /* 4px   - Extra tight spacing */
var(--hool-space-2)     /* 8px   - Tight spacing */
var(--hool-space-3)     /* 12px  - Small spacing */
var(--hool-space-4)     /* 16px  - Standard spacing */
var(--hool-space-5)     /* 20px  - Medium spacing */
var(--hool-space-6)     /* 24px  - Large spacing */
var(--hool-space-8)     /* 32px  - Extra large */
var(--hool-space-10)    /* 40px  - Double large */
var(--hool-space-12)    /* 48px  - Extra double large */
var(--hool-space-16)    /* 64px  - Maximum */
```

**Location:** `/packages/design-system/src/css/variables.css`

**Usage Example:**
```css
padding: var(--hool-space-4);
gap: var(--hool-space-2);
margin-bottom: var(--hool-space-6);
```

---

## Durations (Animation & Transitions)

Use duration tokens for all animations and transitions.

```css
var(--hool-duration-fast)      /* 150ms - Quick interactions */
var(--hool-duration-normal)    /* 250ms - Standard transitions */
var(--hool-duration-slow)      /* 400ms - Slower animations */
var(--hool-duration-slower)    /* 600ms - Very slow effects */
```

**Location:** `/packages/design-system/src/css/variables.css`

**Usage Example:**
```css
transition: all var(--hool-duration-fast) ease;
animation: fadeIn var(--hool-duration-normal) ease-out;
```

---

## Border Properties

### Border Width
```css
var(--hool-border-thin)      /* 1px  - Subtle borders */
var(--hool-border-medium)    /* 2px  - Standard borders */
var(--hool-border-thick)     /* 3px  - Bold borders */
```

### Border Radius
```css
var(--hool-radius-sm)        /* 8px   - Small corner radius */
var(--hool-radius-md)        /* 12px  - Medium radius */
var(--hool-radius-lg)        /* 16px  - Large radius */
var(--hool-radius-xl)        /* 20px  - Extra large radius */
var(--hool-radius-full)      /* 9999px - Fully rounded (pills) */
```

**Location:** `/packages/design-system/src/css/variables.css`

**Usage Example:**
```css
border: var(--hool-border-medium) solid #000;
border-radius: var(--hool-radius-lg);
```

---

## Color Tokens

### Primary Colors
```css
var(--hool-gold-900)        /* #6B4F10 - Darkest gold */
var(--hool-gold-700)        /* #8B6914 - Dark gold */
var(--hool-gold-500)        /* #D4A017 - Standard gold */
var(--hool-gold-400)        /* #E8B82A - Light gold */
var(--hool-gold-200)        /* #F5D060 - Lightest gold */

var(--hool-purple-900)      /* #4C1D95 - Darkest purple */
var(--hool-purple-700)      /* #7C3AED - Dark purple */
var(--hool-purple-500)      /* #A855F7 - Standard purple */
var(--hool-purple-400)      /* #C084FC - Light purple */
var(--hool-purple-200)      /* #DDD6FE - Lightest purple */
```

### Semantic Colors
```css
var(--hool-success)         /* #22C55E - Green for success */
var(--hool-error)           /* #EF4444 - Red for errors */
var(--hool-warning)         /* #F59E0B - Yellow for warnings */
var(--hool-info)            /* #3B82F6 - Blue for info */
```

### Background Colors
```css
var(--hool-bg-base)         /* #0e0b12 - Primary background */
var(--hool-bg-surface)      /* #19151e - Secondary surface */
var(--hool-bg-elevated)     /* #221d29 - Elevated surface */
var(--hool-bg-overlay)      /* #2c2535 - Overlay background */
```

### Text Colors
```css
var(--hool-text-primary)    /* #FFFFFF - Main text */
var(--hool-text-secondary)  /* #A8A3B3 - Secondary text */
var(--hool-text-muted)      /* #6B6578 - Muted text */
var(--hool-text-on-gold)    /* #1a1400 - Text on gold */
var(--hool-text-on-purple)  /* #FFFFFF - Text on purple */
```

### Utility Colors
```css
var(--hool-cream)           /* #F5F0E8 - Light cream */
var(--hool-slate-500)       /* #64748B - Dark slate */
var(--hool-slate-400)       /* #7C8DA2 - Light slate */
var(--hool-ui-white)        /* #FFFFFF - Pure white */
var(--hool-ui-black)        /* #000000 - Pure black */
```

**Location:** `/packages/design-system/src/css/variables.css`

---

## Refactored Files Summary

### Core Components
| File | Key Tokens |
|---|---|
| Button.module.css | Font weight, Durations |
| Badge.module.css | Font weight, Spacing, Durations |
| Tag.module.css | Font weight, Spacing |
| Checkbox.module.css | Font weight, Spacing, Colors |
| Toggle.module.css | Font weight, Spacing, Durations, Border radius |

### Display Components
| File | Key Tokens |
|---|---|
| Avatar.module.css | Font weight, Border, Border radius, Colors |
| Tooltip.module.css | Font weight, Spacing, Border, Durations |

### Form Components
| File | Key Tokens |
|---|---|
| InputWithLabel.module.css | Font weight, Spacing, Durations, Colors |
| InputWithArrows.module.css | Font weight, Spacing |
| InputWithDropdown.module.css | Font weight, Spacing, Border, Colors |

### Layout Components
| File | Key Tokens |
|---|---|
| Divider.module.css | Font weight, Spacing, Border |

---

## Best Practices

### DO
✓ Use tokens for all spacing values
✓ Use tokens for all timing/duration values
✓ Use tokens for all color values
✓ Use tokens for border radius values
✓ Use tokens for font weights
✓ Create new tokens if a pattern repeats

### DON'T
✗ Use hardcoded pixel values
✗ Use hardcoded color hex codes
✗ Use arbitrary duration values
✗ Create one-off values just for one component

---

## Adding New Tokens

When you need a new value:

1. **Check if it exists** - Search tokens.css files first
2. **Follow naming convention** - `--hool-category-variant`
3. **Add to variables.css** - Add the token definition
4. **Update TypeScript** - If using tokens.ts, update types
5. **Document usage** - Add example to this guide

Example:
```css
/* In variables.css */
:root {
  --hool-new-token: 24px;
}

/* In component */
.element {
  padding: var(--hool-new-token);
}
```

---

## File Locations

```
packages/design-system/
├── src/
│   ├── css/
│   │   ├── variables.css      ← Color, spacing, duration tokens
│   │   └── globals.css         ← Font weight tokens
│   └── components/
│       ├── primitives/         ← Button, Badge, Tag, etc.
│       ├── form/               ← Input components
│       ├── display/            ← Avatar, Tooltip, etc.
│       └── layout/             ← Divider, Container, etc.
```

---

## Validation Status

All refactored files have been validated:
- ✓ CSS Syntax: Valid
- ✓ Token References: 100% exist
- ✓ Component Integrity: Preserved
- ✓ Functionality: Unchanged

**Last Updated:** 2026-02-16
**Status:** PRODUCTION READY
