# Avatar Zoom & Equipment Model Visual Refinements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 3D overflow effect to avatars and sticker-style treatment to equipment model for enhanced visual depth and polish.

**Architecture:** Pure CSS inline styles for avatar overflow (scale + objectPosition) and equipment model sticker effect (CSS filters with dual outlines + drop shadow). No component API changes needed.

**Tech Stack:** React, CSS (inline styles + CSS filters), Framer Motion (existing)

---

## Task 1: Avatar Component - Enable Overflow

**Files:**
- Modify: `packages/design-system/src/components/primitives/Avatar.module.css`

**Step 1: Update Avatar CSS to allow overflow**

Open `packages/design-system/src/components/primitives/Avatar.module.css` and modify the `.avatar` class to allow overflow:

```css
.avatar {
  position: relative;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible; /* Changed from hidden to visible */
}
```

**Step 2: Verify in browser**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/roster`
Expected: No visual change yet (avatars still circular, but now allow content to extend beyond)

**Step 3: Commit**

```bash
git add packages/design-system/src/components/primitives/Avatar.module.css
git commit -m "style(avatar): enable overflow for 3D pop-out effect"
```

---

## Task 2: Character Card - Avatar Overflow & Zoom

**Files:**
- Modify: `apps/web/app/(platform)/roster/components/character-card.tsx:232-239`

**Step 1: Add overflow and zoom styles to Avatar**

In `character-card.tsx`, locate the Avatar component (around line 232) and update it:

```tsx
<Avatar
  src={getBustUrl(avatarUrl)}
  fallback={characterName.substring(0, 2).toUpperCase()}
  alt={characterName}
  size="lg"
  className={cardStyles.cardAvatar}
  style={{
    position: 'absolute',
    top: 0,
    left: '16px',
    zIndex: 10,
    overflow: 'visible',
  }}
  objectPosition="50% 12%"
/>
```

**Step 2: Add image scale transformation**

Update the `.image` class targeting in the Avatar to add scale. Since we can't modify Avatar internals here, we'll add a wrapper style. Update the Avatar parent div:

Actually, let's add the scale directly via the style prop. The Avatar component accepts a style prop that gets applied to the container. We need to also ensure the image inside scales. Let me revise:

```tsx
<div style={{
  position: 'absolute',
  top: 0,
  left: '16px',
  zIndex: 10,
  overflow: 'visible',
}}>
  <Avatar
    src={getBustUrl(avatarUrl)}
    fallback={characterName.substring(0, 2).toUpperCase()}
    alt={characterName}
    size="lg"
    className={cardStyles.cardAvatar}
    style={{
      overflow: 'visible',
    }}
    objectPosition="50% 12%"
  />
</div>
```

Wait, the Avatar component already has objectPosition support. Let me check the actual implementation again and provide the correct update.

Since Avatar component accepts objectPosition prop and style prop, we need to add a transform to scale the image. The cleanest way is to wrap the Avatar or modify its internal image. Let me provide the correct approach:

```tsx
<Avatar
  src={getBustUrl(avatarUrl)}
  fallback={characterName.substring(0, 2).toUpperCase()}
  alt={characterName}
  size="lg"
  className={cardStyles.cardAvatar}
  style={{
    position: 'absolute',
    top: 0,
    left: '16px',
    zIndex: 10,
  }}
  objectPosition="50% 12%"
/>
```

Then we need to update the Avatar component CSS to scale the image. Let me revise the task structure.

Actually, looking at the Avatar component code earlier, the image gets the objectPosition applied directly. To add scale, we need to modify the Avatar.module.css to scale the .image class. Let me restructure this properly:

**Step 1: Update character-card Avatar with new objectPosition**

In `character-card.tsx`, locate the Avatar component (around line 232) and update the objectPosition:

```tsx
<Avatar
  src={getBustUrl(avatarUrl)}
  fallback={characterName.substring(0, 2).toUpperCase()}
  alt={characterName}
  size="lg"
  className={cardStyles.cardAvatar}
  style={{ position: 'absolute', top: 0, left: '16px', zIndex: 10 }}
  objectPosition="50% 12%"
/>
```

**Step 2: Add scale transform to Avatar module CSS**

In `packages/design-system/src/components/primitives/Avatar.module.css`, update the `.image` class:

```css
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
  transform: scale(1.12);
}
```

**Step 3: Verify in browser**

Navigate to: `http://localhost:3000/roster`
Expected: Avatar images now show chest-up framing with subtle overflow beyond the circular border (head/helmet extends out of the top)

**Step 4: Commit**

```bash
git add apps/web/app/(platform)/roster/components/character-card.tsx packages/design-system/src/components/primitives/Avatar.module.css
git commit -m "feat(roster): add avatar overflow effect with chest-up framing

- Scale avatar image to 112% for subtle 3D pop-out effect
- Set objectPosition to 50% 12% for chest-up framing
- Avatar content now extends beyond circular border"
```

---

## Task 3: Character Header - Avatar Overflow & Zoom

**Files:**
- Modify: `apps/web/app/(platform)/roster/[characterName]/components/character-header.tsx:162-168`

**Step 1: Update character header Avatar with new objectPosition**

In `character-header.tsx`, locate the Avatar component (around line 162) and update it to match the card style:

```tsx
<Avatar
  src={character.avatar_url ?? undefined}
  fallback={character.character_name.substring(0, 2).toUpperCase()}
  alt={character.character_name}
  size="xl"
  objectPosition="50% 12%"
/>
```

Note: The scale transform is already applied globally in Avatar.module.css from Task 2, so we only need to update the objectPosition here.

**Step 2: Verify in browser**

Navigate to: `http://localhost:3000/roster/[character-name]`
Expected: Header avatar shows chest-up framing with overflow effect (consistent with roster cards)

**Step 3: Commit**

```bash
git add apps/web/app/(platform)/roster/[characterName]/components/character-header.tsx
git commit -m "feat(roster): apply avatar overflow to character detail header

- Use consistent chest-up framing (50% 12%)
- Avatar now matches roster card 3D effect"
```

---

## Task 4: Equipment Grid - Increase Model Size

**Files:**
- Modify: `apps/web/app/(platform)/roster/[characterName]/components/equipment-grid.tsx:300-406`

**Step 1: Update grid column sizes**

In `equipment-grid.tsx`, locate the main grid container (around line 300) and update the gridTemplateColumns:

```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 560px 1fr',  // Changed from 420px
    gap: '8px',
    alignItems: 'start',
  }}
>
```

**Step 2: Update weapon row grid to match**

Locate the weapons row grid (around line 410) and update it:

```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 560px 1fr',  // Changed from 420px
    gap: '8px',
    marginTop: '8px',
  }}
>
```

**Step 3: Add overflow hidden to center column container**

Locate the center column div (around line 320) and add overflow:

```tsx
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',  // Add this line
  }}
>
```

**Step 4: Verify in browser**

Navigate to: `http://localhost:3000/roster/[character-name]`
Expected: Character model in equipment section is noticeably larger (~33% increase), sides are cleanly cropped

**Step 5: Commit**

```bash
git add apps/web/app/(platform)/roster/[characterName]/components/equipment-grid.tsx
git commit -m "feat(equipment): increase character model size to 560px

- Model is now 33% larger for better visibility
- Add overflow hidden to prevent layout issues
- Update both main grid and weapon row"
```

---

## Task 5: Equipment Grid - Add Sticker Effect

**Files:**
- Modify: `apps/web/app/(platform)/roster/[characterName]/components/equipment-grid.tsx:339-351`

**Step 1: Add sticker filter to character image**

In `equipment-grid.tsx`, locate the character render image (around line 340) and update the style:

```tsx
{renderUrl ? (
  <img
    src={renderUrl}
    alt="Character"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '50% 5%',
      display: 'block',
      filter: `
        drop-shadow(0 0 3px rgba(0, 0, 0, 0.8))
        drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.9))
        drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))
      `,
    }}
    onError={() => setRenderError(true)}
  />
) : (
```

**Step 2: Verify in browser**

Navigate to: `http://localhost:3000/roster/[character-name]`
Expected: Character model has:
- Black inner outline defining the shape
- White outer outline for contrast
- Soft drop shadow creating elevated/floating appearance
- Bold sticker-like aesthetic

**Step 3: Test with different characters/classes**

Navigate through multiple characters to ensure the sticker effect works across different armor colors and styles.

**Step 4: Commit**

```bash
git add apps/web/app/(platform)/roster/[characterName]/components/equipment-grid.tsx
git commit -m "feat(equipment): add sticker effect to character model

- Apply dual outline effect (black inner, white outer)
- Add soft drop shadow for elevated appearance
- Creates bold, punchy visual separation"
```

---

## Task 6: Final Verification & Polish

**Files:**
- N/A (verification only)

**Step 1: Full visual regression check**

Navigate through the following pages and verify all changes:

1. Roster overview (`/roster`):
   - All character cards show chest-up avatars
   - Avatars have subtle overflow effect
   - Layout is not broken

2. Character detail pages (multiple characters):
   - Header avatar has overflow effect
   - Equipment model is larger and has sticker effect
   - Equipment slots are properly aligned
   - No overlap or layout issues

**Step 2: Test responsive behavior**

1. Resize browser window
2. Verify equipment grid adapts properly (may need to check if 560px causes issues on smaller screens)
3. If issues found, note them for follow-up

**Step 3: Performance check**

1. Open DevTools Performance tab
2. Scroll through roster page and character detail
3. Verify no jank or performance issues from CSS filters
4. Expected: Smooth 60fps scrolling

**Step 4: Cross-browser check (if applicable)**

Test in:
- Chrome (primary)
- Firefox
- Safari (if on Mac)

Expected: CSS filters and overflow work consistently

**Step 5: Final commit if any adjustments needed**

If any polish adjustments were made:

```bash
git add [files]
git commit -m "polish: refine avatar and model visual effects"
```

---

## Success Criteria

- ✅ Roster card avatars show chest-up framing with 10-15% overflow
- ✅ Character header avatar matches roster card style
- ✅ Equipment model is 33% larger (560px) and more prominent
- ✅ Sticker effect (dual outline + shadow) creates visual separation
- ✅ No layout breakage or equipment slot misalignment
- ✅ No performance issues from CSS filters
- ✅ Effects work across all characters/classes

## Rollback Plan

If issues arise:

1. Avatar overflow causing layout problems:
   - Revert Avatar.module.css overflow to `hidden`
   - Remove scale transform

2. Equipment model too large:
   - Reduce to intermediate size (e.g., 500px)
   - Or revert to 420px

3. Sticker effect too heavy/distracting:
   - Remove one of the drop-shadow layers
   - Or reduce opacity values

4. Performance issues:
   - Replace CSS filters with simpler border approach
   - Or remove sticker effect entirely

Each task is committed separately, so granular rollback is possible via `git revert`.
