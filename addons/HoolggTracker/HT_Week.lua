-- HT_Week.lua
-- Week number calculation anchored to WoW's actual weekly reset boundary.

HT = HT or {}

---Get the current season week number.
---Snaps to WoW's weekly reset boundary using GetSecondsUntilWeeklyReset().
---Returns negative for pre-season, 1+ for live season.
---@return number weekNum Integer
function HT.GetCurrentWeek()
  local now = time()

  -- Snap to the actual weekly boundary.
  -- GetSecondsUntilWeeklyReset() returns seconds until the NEXT reset.
  -- So the current week started (WEEK_SECONDS - secsUntilReset) seconds ago.
  local secsUntilReset = GetSecondsUntilWeeklyReset and GetSecondsUntilWeeklyReset() or 0
  local currentWeekStart = now - (HT.WEEK_SECONDS - secsUntilReset)

  -- Find the latest season anchor that falls at or before this week's start.
  local bestAnchor = nil
  for _, anchor in ipairs(HT.SEASON_ANCHORS) do
    if anchor.timestamp <= currentWeekStart + 3600 then  -- 1h tolerance for server drift
      if not bestAnchor or anchor.timestamp > bestAnchor.timestamp then
        bestAnchor = anchor
      end
    end
  end

  if not bestAnchor then
    -- Before the first anchor — count weeks backwards
    local first = HT.SEASON_ANCHORS[1]
    local delta = first.timestamp - currentWeekStart
    return first.week - math.max(1, math.ceil(delta / HT.WEEK_SECONDS))
  end

  local weeksElapsed = math.floor((currentWeekStart - bestAnchor.timestamp) / HT.WEEK_SECONDS + 0.5)
  return bestAnchor.week + weeksElapsed
end

---Human-readable label for a week number.
---@param weekNum number
---@return string
function HT.GetWeekLabel(weekNum)
  local def = HT.TASK_DEFINITIONS and HT.TASK_DEFINITIONS[weekNum]
  if def and def.name then return def.name end
  if weekNum < 0 then
    return string.format("Pre-Season (Week %d)", weekNum)
  elseif weekNum == 0 then
    return "Pre-Season Week 2"
  else
    return string.format("Season Week %d", weekNum)
  end
end

---Seconds until the next weekly reset.
---@return number
function HT.GetSecondsUntilReset()
  return GetSecondsUntilWeeklyReset and GetSecondsUntilWeeklyReset() or 0
end
