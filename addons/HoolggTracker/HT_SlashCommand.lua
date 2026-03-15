-- HT_SlashCommand.lua
-- /hool and /ht slash commands

HT = HT or {}

local USAGE = [[
HoolggTracker slash commands:
  /ht toggle          — Show/hide the tracker window
  /ht show/hide       — Explicit show or hide
  /ht minimap         — Toggle minimap icon
  /ht scale [0.5-1.5] — Resize the tracker window
  /ht week            — Print current week number and reset timer
  /ht reset           — Reset current week's manual tasks
  /ht scan            — Scan for crest IDs, faction IDs, lockouts (update HT_Data.lua)
  /ht help            — Print this help
]]

local function HandleSlashCommand(msg)
  msg = msg and msg:lower():match("^%s*(.-)%s*$") or ""

  if msg == "" or msg == "toggle" then
    HT.ToggleUI()

  elseif msg == "show" then
    HT.db.show = true
    HT.ui:RenderTree()
    HT.ui:Show()

  elseif msg == "hide" then
    HT.db.show = false
    HT.ui:Hide()

  elseif msg == "minimap" then
    HT.ToggleMinimapIcon()
    local state = HT.globalDB.minimap.hide and "hidden" or "shown"
    HT.Print("Minimap icon " .. state .. ".")

  elseif msg:sub(1, 5) == "scale" then
    local val = tonumber(msg:match("scale%s+([%d%.]+)"))
    if val then
      HT.SetScale(val)
      HT.Print(string.format("Scale set to %.2f.", HT.db.scale))
    else
      HT.Print("Usage: /ht scale [0.5-1.5]")
    end

  elseif msg == "week" then
    local weekNum = HT.GetCurrentWeek()
    local label   = HT.GetWeekLabel(weekNum)
    HT.Print(string.format("Current week: %d — %s", weekNum, label))
    local secs = HT.GetSecondsUntilReset()
    local hours = math.floor(secs / 3600)
    local mins  = math.floor((secs % 3600) / 60)
    HT.Print(string.format("Reset in: %dh %dm", hours, mins))

  elseif msg == "reset" then
    local weekNum = HT.GetCurrentWeek()
    HT.ResetWeekTasks(weekNum)
    HT.ui:RenderTree()
    HT.Print(string.format("Week %d tasks reset.", weekNum))

  elseif msg == "scan" then
    HT.Print("=== HoolggTracker ID Scan ===")

    local results = { currencies = {}, factions = {}, instances = {} }

    -- Crest currencies: scan wider range for Midnight crest names
    HT.Print("Currencies with 'Crest', 'Shard', 'Spark', or 'Dawn' in name:")
    local found = 0
    for i = 2000, 5000 do
      local ok, info = pcall(C_CurrencyInfo.GetCurrencyInfo, i)
      if ok and info and info.name then
        local n = info.name:lower()
        if n:find("crest") or n:find("shard") or n:find("spark") or n:find("dawn") then
          print(string.format("  |cffffd700ID %d|r: %s  (qty=%d, weekEarned=%d)",
            i, info.name, info.quantity or 0, info.quantityEarnedThisWeek or 0))
          table.insert(results.currencies, {
            id = i, name = info.name,
            qty = info.quantity or 0,
            weekEarned = info.quantityEarnedThisWeek or 0,
          })
          found = found + 1
        end
      end
    end
    if found == 0 then HT.Print("  None found (try logging into the game world first)") end

    -- Major factions
    HT.Print("Major factions (Midnight):")
    if C_MajorFactions and C_MajorFactions.GetMajorFactionIDs then
      for expIdx = 10, 12 do
        local ids = C_MajorFactions.GetMajorFactionIDs(expIdx) or {}
        for _, id in ipairs(ids) do
          local d = C_MajorFactions.GetMajorFactionData(id)
          if d then
            print(string.format("  |cffffd700ID %d|r: %s  (renown=%d)", id, d.name, d.renownLevel or 0))
            table.insert(results.factions, { id = id, name = d.name, renown = d.renownLevel or 0 })
          end
        end
      end
    else
      HT.Print("  C_MajorFactions not available")
    end

    -- Saved instance lockouts
    HT.Print("Current saved instances (raid lockouts):")
    local numInst = GetNumSavedInstances()
    if numInst == 0 then
      HT.Print("  None")
    else
      for i = 1, numInst do
        local name, id, reset, diff, locked, extended = GetSavedInstanceInfo(i)
        if name then
          print(string.format("  |cffffd700ID %d|r: %s  diff=%d  locked=%s  reset=%ds",
            id, name, diff, tostring(locked), reset or 0))
          table.insert(results.instances, { id = id, name = name, diff = diff, locked = locked })
        end
      end
    end

    -- Save to SavedVariables so it persists to disk after /reload
    HT.globalDB.scanResults = results
    HT.Print("Results saved — type |cffffd700/reload|r to flush to HoolggTrackerDB.lua on disk.")
    HT.Print("Update HT.CREST_IDS, HT.MAJOR_FACTION_IDS, and HT.RAID_INSTANCE_IDS in HT_Data.lua")

  elseif msg == "help" then
    print(USAGE)

  else
    HT.Print("Unknown command '" .. msg .. "'. Type /ht help for usage.")
  end
end

---Register /hool and /ht slash commands.
function HT.InitSlashCommands()
  SLASH_HOOLGGTRACKER1 = "/hool"
  SLASH_HOOLGGTRACKER2 = "/ht"
  SlashCmdList["HOOLGGTRACKER"] = HandleSlashCommand
end
