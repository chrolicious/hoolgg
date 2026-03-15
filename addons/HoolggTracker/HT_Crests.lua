-- HT_Crests.lua
-- Reads crest currency data from C_CurrencyInfo.
-- IDs are stored in HT_Data.lua and will be 0 until March 17.
-- Data is NEVER stored in SavedVariables — always fetched live.

HT = HT or {}

---Get the cumulative crest cap for a given week.
---Counts from the first season anchor (week -2), adding 100 per week.
---@param weekNum number
---@return number cap
function HT.GetCrestCap(weekNum)
  local firstWeek = HT.SEASON_ANCHORS[1].week  -- -2
  if weekNum < firstWeek then return 0 end
  local weeksActive = weekNum - firstWeek + 1
  return weeksActive * HT.CREST_WEEKLY_CAP
end

---Get crest data for all four crest types.
---Returns a table keyed by crest type name.
---@return table crestData
---  { weathered = { valid, quantity, earnedThisWeek, cap, label, colorKey }, ... }
function HT.GetCrestData()
  local weekNum = HT.GetCurrentWeek()
  local cap     = HT.GetCrestCap(weekNum)
  local result  = {}

  for _, crestKey in ipairs(HT.CREST_ORDER) do
    local currencyId = HT.CREST_IDS[crestKey]
    local entry = {
      key            = crestKey,
      label          = HT.CREST_LABELS[crestKey],
      colorKey       = crestKey,
      valid          = false,
      quantity       = 0,
      earnedThisWeek = 0,
      cap            = cap,
    }

    if currencyId and currencyId > 0 then
      local info = C_CurrencyInfo.GetCurrencyInfo(currencyId)
      if info then
        entry.valid          = true
        entry.quantity       = info.quantity or 0
        -- Midnight crests use a season-wide cap (not weekly)
        -- totalEarned = season total earned (shown as "Season Maximum: X/Y")
        -- maxQuantity  = season cap
        entry.earnedThisWeek = info.totalEarned or info.quantityEarnedThisWeek or 0
        if (info.maxQuantity or 0) > 0 then
          entry.cap = info.maxQuantity
        end
      end
    end
    -- If currencyId == 0, entry.valid remains false → renders "ID pending"

    result[crestKey] = entry
  end

  return result
end

---Returns a summary badge string for the crests section header.
---Shows how many crest types have data available.
---@return string e.g. "4/4" or "0/4 (pending)"
function HT.GetCrestSummary()
  local data     = HT.GetCrestData()
  local valid    = 0
  local total    = #HT.CREST_ORDER
  for _, crestKey in ipairs(HT.CREST_ORDER) do
    if data[crestKey] and data[crestKey].valid then
      valid = valid + 1
    end
  end
  if valid == 0 then
    return "pending"
  end
  return valid .. "/" .. total
end

---Check if any crest currency IDs are still at 0 (unset).
---@return boolean
function HT.AreCresiIDsPending()
  for _, crestKey in ipairs(HT.CREST_ORDER) do
    if HT.CREST_IDS[crestKey] == 0 then
      return true
    end
  end
  return false
end
