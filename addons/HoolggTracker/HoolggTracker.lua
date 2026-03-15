-- HoolggTracker.lua
-- Core addon: event registration and initialization sequence.
-- Loaded last — all HT_*.lua modules must be loaded before this.

HT = HT or {}

local ADDON_NAME = "HoolggTracker"

-- ============================================================
-- Event frame
-- ============================================================
local events = CreateFrame("Frame")
events:RegisterEvent("ADDON_LOADED")
events:RegisterEvent("PLAYER_ENTERING_WORLD")

local EventHandler = {}

events:SetScript("OnEvent", function(_, event, ...)
  if EventHandler[event] then
    EventHandler[event](...)
  end
end)

-- ============================================================
-- ADDON_LOADED — one-time init
-- ============================================================
function EventHandler.ADDON_LOADED(loadedAddonName)
  if loadedAddonName ~= ADDON_NAME then return end

  HT.InitDB()
  HT.InitSlashCommands()
  HT.InitMinimapIcon()

  events:UnregisterEvent("ADDON_LOADED")
end

-- ============================================================
-- PLAYER_ENTERING_WORLD — UI creation on login/reload only
-- ============================================================
function EventHandler.PLAYER_ENTERING_WORLD(isInitialLogin, isReloadingUi)
  if not (isInitialLogin or isReloadingUi) then return end

  HT.CreateUI()

  if HT.db.show then
    HT.ui:RenderTree()
    HT.ui:Show()
  end

  -- Register ongoing events that trigger re-renders
  events:RegisterEvent("WEEKLY_REWARDS_UPDATE")
  events:RegisterEvent("CURRENCY_DISPLAY_UPDATE")
  events:RegisterEvent("QUEST_TURNED_IN")
  events:RegisterEvent("CHALLENGE_MODE_COMPLETED")
  events:RegisterEvent("ENCOUNTER_END")

  events:UnregisterEvent("PLAYER_ENTERING_WORLD")
end

-- ============================================================
-- Live update events
-- ============================================================

---Great Vault progress changed
function EventHandler.WEEKLY_REWARDS_UPDATE()
  if HT.ui and HT.ui:IsShown() then
    HT.ui:RenderTree()
  end
end

---Currency changed — filter to known crest IDs
function EventHandler.CURRENCY_DISPLAY_UPDATE(currencyId)
  if not currencyId then return end
  -- Check if this is one of our tracked crest currencies
  for _, crestKey in ipairs(HT.CREST_ORDER) do
    if HT.CREST_IDS[crestKey] == currencyId then
      if HT.ui and HT.ui:IsShown() then
        HT.ui:RenderTree()
      end
      return
    end
  end
end

---Quest completed — re-check auto-detected tasks
function EventHandler.QUEST_TURNED_IN(questId)
  if HT.ui and HT.ui:IsShown() then
    HT.ui:RenderTree()
  end
end

---Mythic+ completed — re-check vault progress
function EventHandler.CHALLENGE_MODE_COMPLETED()
  if HT.ui and HT.ui:IsShown() then
    HT.ui:RenderTree()
  end
end

---Raid encounter ended — re-check vault progress (success only)
function EventHandler.ENCOUNTER_END(encounterId, encounterName, difficultyId, groupSize, success)
  if success == 1 and HT.ui and HT.ui:IsShown() then
    HT.ui:RenderTree()
  end
end
