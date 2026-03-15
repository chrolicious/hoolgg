-- HT_Minimap.lua
-- LibDBIcon minimap button — degrades gracefully if LibDBIcon is not installed.

HT = HT or {}

local ADDON_NAME = "HoolggTracker"

-- Check if optional minimap libs are available
local hasLDB     = LibStub and LibStub("LibDataBroker-1.1", true)
local hasDBIcon  = LibStub and LibStub("LibDBIcon-1.0", true)

local minimapIcon = hasDBIcon
local HT_LDB

if hasLDB then
  HT_LDB = hasLDB:NewDataObject("HoolggTracker", {
    type = "data source",
    text = "HoolggTracker",
    icon = "Interface\\AddOns\\" .. ADDON_NAME .. "\\Textures\\HoolggTracker_Minimap",
    OnClick = function(_, buttonName)
      if buttonName == "LeftButton" then
        HT.ToggleUI()
      elseif buttonName == "RightButton" then
        HT.ShowRightClickMenu()
      end
    end,
    OnTooltipShow = function(tooltip)
      if not tooltip then return end
      tooltip:AddLine("|cff9d78ffHoolggTracker|r")
      tooltip:AddLine(" ")
      tooltip:AddLine(HT.Muted("Left-click: Toggle window"))
      tooltip:AddLine(HT.Muted("Right-click: Options"))
      tooltip:AddLine(" ")
      local weekNum = HT.GetCurrentWeek()
      tooltip:AddLine(HT.White("Current: ") .. HT.Gold(HT.GetWeekLabel(weekNum)))
      local comp = HT.GetTaskCompletion(weekNum)
      tooltip:AddLine(HT.White("Tasks: ") .. HT.Gold(comp.done .. "/" .. comp.total))
    end,
  })
end

---Initialize the minimap icon. No-op if libs are unavailable.
function HT.InitMinimapIcon()
  if not hasLDB or not minimapIcon or not HT_LDB then
    -- No minimap button — use /ht to open the tracker
    return
  end
  local gdb = HT.globalDB
  minimapIcon:Register(ADDON_NAME, HT_LDB, gdb.minimap)
  if not gdb.minimap.hide then
    minimapIcon:Show(ADDON_NAME)
  end
end

---Toggle minimap icon visibility.
function HT.ToggleMinimapIcon()
  if not minimapIcon then
    HT.Print("Minimap icon requires LibDBIcon-1.0.")
    return
  end
  local gdb = HT.globalDB
  gdb.minimap.hide = not gdb.minimap.hide
  if gdb.minimap.hide then
    minimapIcon:Hide(ADDON_NAME)
  else
    minimapIcon:Show(ADDON_NAME)
  end
end
