# My Roster - Weekend Ship Checklist
**Date:** 2026-02-20
**Goal:** Ship "My Roster" functionality this weekend before expansion drop

## Critical Bugs Fixed

- [x] **User bnet_id not set on character creation** - Characters weren't appearing in roster after adding because user_bnet_id field wasn't being sent to API

## Core Functionality Requirements

### 1. Character Display ✓
- [x] Grid layout showing character cards
- [x] Character name in class color
- [x] Spec, class, role displayed
- [x] Current ilvl shown
- [x] Progress status indicator (ahead/behind/unknown)
- [x] Empty state when no characters exist

### 2. Add Character Flow
**Steps:**
1. Click "Add Character" card (+ icon)
2. Select character from dropdown (guild members only)
3. Select class (dev mode - would be auto-fetched in production)
4. Select main spec (filtered by class)
5. Optionally select off-spec
6. See role auto-determined from main spec
7. Submit and see character added to roster

**Requirements:**
- [x] Dropdown shows only user's guild members not yet in roster
- [x] Class selection filters spec options
- [x] Role auto-determined from spec
- [x] Info banner about Blizzard API auto-fetch in production
- [x] Form validation (character, class, main spec required)
- [x] Error messages for failed API calls
- [x] Loading state during submission
- [x] **CRITICAL FIX:** user_bnet_id sent to API for proper filtering
- [ ] Test: Add character successfully creates database entry
- [ ] Test: Character appears in roster after adding
- [ ] Test: Character removed from available dropdown after adding

### 3. Delete Character Flow
**Steps:**
1. Hover character card to see trash icon
2. Click trash icon
3. See confirmation buttons (check/x)
4. Click check to confirm
5. Character removed from roster

**Requirements:**
- [x] Trash icon appears on hover
- [x] Confirmation state with check/x buttons
- [x] API call to delete character
- [x] Roster refreshes after deletion
- [ ] Test: Character successfully deleted from database
- [ ] Test: Deleted character reappears in add dropdown

### 4. Character Detail Page
**Steps:**
1. Click any character card
2. Navigate to detail page
3. See character info, progress, gear priorities

**Requirements:**
- [x] Navigation includes realm parameter
- [x] Character data displays correctly
- [x] Progress status shows
- [x] Breadcrumb navigation works
- [ ] Test: Detail page loads without errors
- [ ] Test: Data matches character card

### 5. Design System Consistency
**Requirements:**
- [x] Card components used consistently
- [x] Button variants (primary/secondary)
- [x] Select components styled properly
- [x] Icon components throughout
- [x] Framer Motion animations smooth
- [x] Class colors match Blizzard palette
- [ ] Polish: Consistent spacing/padding
- [ ] Polish: Loading skeleton states
- [ ] Polish: Error message styling

## Testing Checklist

### Manual Testing Flow
1. **Login** → Navigate to /guilds/1/roster
2. **View Roster** → See existing characters (or empty state)
3. **Add Character:**
   - Click Add Character card
   - Select character from dropdown
   - Select class (dev)
   - Select main spec
   - Optionally select off-spec
   - See role displayed
   - Submit
   - Verify character appears in grid
4. **View Details:**
   - Click character card
   - Verify detail page loads
   - Check all data correct
   - Use breadcrumb to go back
5. **Delete Character:**
   - Hover character card
   - Click trash icon
   - See confirmation
   - Confirm deletion
   - Verify character removed
   - Verify character reappears in add dropdown

### Edge Cases to Test
- [ ] No characters in roster (empty state)
- [ ] All guild characters already in roster (can't add more)
- [ ] API failures (network error, 500, etc.)
- [ ] Duplicate character prevention
- [ ] Form validation errors
- [ ] Loading states during API calls

## Known Limitations (For This Ship)

1. **Dev Mode Only:** Class/realm are manually selected (would be auto-fetched from Blizzard API in production)
2. **Single User:** Only testing with bnet_id=1 in development
3. **Hardcoded Data:** Some progress data is hardcoded (expansion 12.0, week 5)
4. **No Blizzard Integration:** No real-time data from Blizzard API yet

## Pre-Ship Requirements

### Must Have (P0)
- [ ] All core flows working end-to-end
- [ ] No console errors
- [ ] Proper error handling for API failures
- [ ] Database operations succeed
- [ ] Character addition/deletion works correctly

### Should Have (P1)
- [ ] Smooth animations
- [ ] Consistent design system usage
- [ ] Good loading states
- [ ] Clear error messages

### Nice to Have (P2)
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Accessibility improvements

## Deployment Checklist

- [ ] All services running (guild-api:8000, progress-api:5002)
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Test in dev environment
- [ ] Deploy to staging
- [ ] Final test on staging
- [ ] Deploy to production
- [ ] Monitor for errors

## Post-Ship Improvements (Next Sprint)

1. **Blizzard API Integration:** Auto-fetch class/spec/realm from Blizzard
2. **Real Progress Tracking:** Connect to actual Blizzard character data
3. **Better Mobile Experience:** Responsive grid layout
4. **Drag-and-Drop Reordering:** Use display_order field for custom sorting
5. **Character Search/Filter:** Filter by class/role/spec
6. **Bulk Operations:** Add/remove multiple characters at once
