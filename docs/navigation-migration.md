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
