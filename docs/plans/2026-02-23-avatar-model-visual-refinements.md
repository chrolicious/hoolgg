# Avatar Zoom & Equipment Model Visual Refinements

**Date:** 2026-02-23
**Status:** Approved
**Implementation Approach:** Pure CSS inline styles

## Overview

Enhance character avatars and equipment section model with visual effects that add depth and polish. Avatars will have a 3D "escaping the frame" effect, and the equipment model will get a bold sticker-style treatment.

## Goals

1. Create depth perception on circular avatar frames by allowing content to overflow
2. Zoom avatars to show chest-up framing (more character detail visible)
3. Increase equipment model size for better visibility
4. Add sticker-style visual treatment to equipment model (outlines + shadow)

## Design Decisions

### Avatar Overflow Effect

**Components Affected:**
- `character-card.tsx` (roster overview)
- `character-header.tsx` (detail page)

**Changes:**
- Set `overflow: visible` on Avatar container
- Scale image to 112% (`transform: scale(1.12)`)
- Set `objectPosition: "50% 12%"` for chest-up framing
- Result: ~10-15% subtle overflow beyond circular border

**Visual Effect:**
- Character head/helmet extends beyond circle top
- Creates 3D pop-out effect
- Circular border acts as a frame, not a constraint

### Equipment Model Sticker Effect

**Components Affected:**
- `equipment-grid.tsx` (center column)

**Changes:**
- Increase container from 420px to 560px (~33% larger)
- Update grid: `gridTemplateColumns: '1fr 560px 1fr'`
- Add `overflow: hidden` to parent container
- Keep `objectPosition: "50% 5%"` (existing full-body view)
- Apply CSS filter stack:
  ```css
  filter:
    drop-shadow(0 0 3px rgba(0, 0, 0, 0.8))          /* inner black outline */
    drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.9))  /* outer white outline */
    drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));      /* soft elevated shadow */
  ```

**Visual Effect:**
- Model is more prominent, easier to see armor details
- Black inner outline defines character shape
- White outer outline provides contrast
- Drop shadow creates floating/elevated appearance
- Bold sticker aesthetic

## Technical Implementation

### Approach: Pure CSS Inline Styles

**Rationale:**
- These are visual polish features, not design system primitives
- CSS filters are performant and well-supported
- Inline styles keep the effect obvious when reading code
- Easy to iterate and adjust values
- Can extract to components/helpers later if reused elsewhere

**Files Changed:**
1. `character-card.tsx` - add overflow + scale + objectPosition to Avatar
2. `character-header.tsx` - add overflow + scale + objectPosition to Avatar
3. `equipment-grid.tsx` - increase model size, add filter stack
4. `Avatar.module.css` - set overflow: visible on container

## Success Criteria

- Avatars display chest-up framing with subtle overflow effect
- Equipment model is larger and more visible
- Sticker effect creates visual separation from background
- No layout breakage or overlap with equipment slots
- Effects are performant (no jank on scroll/interaction)

## Future Considerations

- If overflow effect is used elsewhere, extract to Avatar component prop
- If sticker effect is reused, create `StickerImage` component or utility class
- Consider making values themeable if we add customization settings
