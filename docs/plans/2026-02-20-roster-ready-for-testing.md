# My Roster - Ready for Testing
**Date:** 2026-02-20
**Status:** Ready for weekend ship testing

## What's Been Fixed

### Critical Bugs
1. **user_bnet_id not set on character creation** ✅
   - Characters now properly associate with user's bnet_id
   - Will correctly appear in roster after creation
   - Fallback to `user.bnet_id` from auth context if selectedBnetId is null

### Error Handling
2. **Add character error handling** ✅
   - Specific error messages for: duplicate (409), permissions (403), auth (401)
   - Clear user-friendly messages
   - Error state properly managed

3. **Delete character error handling** ✅
   - Visual error feedback on delete failure
   - Auto-dismisses error after 3 seconds
   - Specific messages for permissions and not found errors

### UI/UX Polish
4. **Design system consistency** ✅
   - All labels use semibold weight for better hierarchy
   - Smooth animations when spec options appear
   - Improved add button hover effects
   - Better visual feedback throughout

5. **Animation improvements** ✅
   - Spec selection fields animate in smoothly
   - Role summary fades in when spec selected
   - Add button has enhanced hover state
   - Delete confirmation has smooth transitions

## Test Locally

**URL:** http://localhost:3000/guilds/1/roster

### Services Running
```bash
# Check all services are running
pgrep -f "next dev"      # Should show PID (Next.js on :3000)
pgrep -f "flask.*8000"   # Should show PIDs (guild-api on :8000)
pgrep -f "flask.*5002"   # Should show PIDs (progress-api on :5002)
```

### Test Flow

#### 1. View Roster
- Navigate to http://localhost:3000/guilds/1/roster
- Should see:
  - Page title "My Roster"
  - Breadcrumb navigation
  - Grid of character cards (or empty grid)
  - "Add Character" card with + icon

#### 2. Add Character
1. Click "Add Character" card
2. Form should slide in with animation
3. Select a character from dropdown
   - Dropdown shows guild members not yet in roster
   - Info banner explains class/realm auto-fetch in production
4. Select class (dev mode - manual selection)
5. Spec options should animate in
6. Select main spec
7. Role should display automatically
8. Optionally select off-spec
9. Click "Add Character"
10. Form should close
11. Character should appear in grid with correct:
    - Name in class color
    - Spec and class
    - Role
    - ilvl
    - Progress status

#### 3. View Character Details
1. Click any character card
2. Should navigate to detail page
3. URL includes realm parameter
4. Character data displays
5. Progress information shown
6. Breadcrumb works to go back

#### 4. Delete Character
1. Hover over character card
2. Trash icon appears in top-right
3. Click trash icon
4. Confirmation buttons appear (check/x)
5. Click check to confirm
6. Character removed from grid
7. Character reappears in add dropdown

### Edge Cases to Verify

- **Empty roster:** Grid should still show Add Character card
- **All characters added:** Form should show "All your guild characters are already in your roster!"
- **API failure:** Should show clear error message
- **Duplicate character:** Should show "This character is already in your roster"
- **Network error:** Should show "Failed to add character. Please try again."

### Known Dev Mode Limitations

These are EXPECTED in development:
1. Class/realm are manually selected (would be auto-fetched from Blizzard API in production)
2. Only testing with bnet_id=1
3. Some progress data is hardcoded (expansion 12.0, week 5)
4. No real-time Blizzard data

## Console Check

Open browser console - should see NO errors except:
- Expected: `[Roster Debug]` logs showing filtering logic
- Expected: Development mode notices from React

Should NOT see:
- ❌ `undefined bnet_id`
- ❌ `Access denied` errors
- ❌ `Failed to fetch` errors (unless intentionally testing failure)
- ❌ `Icon not found` warnings
- ❌ React key warnings

## Ship Criteria

### Must Pass (P0)
- [ ] Can add character successfully
- [ ] Character appears in roster after adding
- [ ] Can view character details
- [ ] Can delete character successfully
- [ ] Deleted character reappears in dropdown
- [ ] No console errors during happy path
- [ ] Proper error messages on failures
- [ ] All animations smooth
- [ ] Design system used consistently

### Issues That Block Ship
- Character not appearing after creation
- Console errors on normal usage
- Delete not working
- Form validation allowing invalid submissions
- Crashes or unhandled exceptions

### Issues That Don't Block Ship
- Minor styling tweaks
- Animation timing preferences
- Dev mode limitations (class/realm selection)
- Progress data being hardcoded

## Next Steps After Testing

If all tests pass:
1. Commit all changes
2. Create PR to develop
3. Deploy to dev.hool.gg for team testing
4. If dev testing passes, merge to staging
5. Deploy to staging.hool.gg for final verification
6. If staging passes, merge to main
7. Deploy to production (hool.gg)
8. Monitor for errors
9. Announce to guild that roster tracking is live!

If issues found:
1. Document specific issues
2. Fix critical bugs
3. Re-test
4. Repeat until all P0 criteria pass
