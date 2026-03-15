-- HT_RightClickMenu.lua
-- UIDropDownMenu right-click menu

HT = HT or {}

local RightClickMenu = CreateFrame("Frame", "HoolggTrackerRightClickMenu", UIParent, "UIDropDownMenuTemplate")

local function InitializeRightClickMenu(self, level, menuList)
  local f  = HT.ui
  local db = HT.db

  -- ---- Sections: show/hide ----
  local sectionsHeader = UIDropDownMenu_CreateInfo()
  sectionsHeader.text        = "Sections"
  sectionsHeader.isTitle     = true
  sectionsHeader.notCheckable = true
  UIDropDownMenu_AddButton(sectionsHeader)

  local sections = {
    { key = "tasks",       label = "Weekly Tasks" },
    { key = "vault",       label = "Great Vault" },
    { key = "crests",      label = "Crests" },
    { key = "professions", label = "Professions" },
  }

  for _, sec in ipairs(sections) do
    local opt = UIDropDownMenu_CreateInfo()
    opt.text           = sec.label
    opt.checked        = not db.collapsed[sec.key]
    opt.isNotRadio     = true
    opt.keepShownOnClick = true
    local capturedKey  = sec.key
    opt.func = function()
      db.collapsed[capturedKey] = not db.collapsed[capturedKey]
      f:RenderTree()
    end
    UIDropDownMenu_AddButton(opt)
  end

  UIDropDownMenu_AddSeparator()

  -- ---- Display options ----
  local displayHeader = UIDropDownMenu_CreateInfo()
  displayHeader.text        = "Display"
  displayHeader.isTitle     = true
  displayHeader.notCheckable = true
  UIDropDownMenu_AddButton(displayHeader)

  local minimapOpt = UIDropDownMenu_CreateInfo()
  minimapOpt.text           = "Show Minimap Icon"
  minimapOpt.checked        = not HT.globalDB.minimap.hide
  minimapOpt.isNotRadio     = true
  minimapOpt.keepShownOnClick = true
  minimapOpt.func = function()
    HT.ToggleMinimapIcon()
  end
  UIDropDownMenu_AddButton(minimapOpt)

  local hideWhenDoneOpt = UIDropDownMenu_CreateInfo()
  hideWhenDoneOpt.text           = "Hide when all tasks done"
  hideWhenDoneOpt.checked        = db.options.hideWhenAllDone
  hideWhenDoneOpt.isNotRadio     = true
  hideWhenDoneOpt.keepShownOnClick = true
  hideWhenDoneOpt.func = function()
    db.options.hideWhenAllDone = not db.options.hideWhenAllDone
  end
  UIDropDownMenu_AddButton(hideWhenDoneOpt)

  UIDropDownMenu_AddSeparator()

  -- ---- Reset ----
  local resetHeader = UIDropDownMenu_CreateInfo()
  resetHeader.text        = "Reset"
  resetHeader.isTitle     = true
  resetHeader.notCheckable = true
  UIDropDownMenu_AddButton(resetHeader)

  local resetOpt = UIDropDownMenu_CreateInfo()
  resetOpt.text        = "Reset this week's tasks"
  resetOpt.notCheckable = true
  resetOpt.func = function()
    local weekNum = HT.GetCurrentWeek()
    HT.ResetWeekTasks(weekNum)
    f:RenderTree()
    HT.Print("Week " .. weekNum .. " tasks reset.")
  end
  UIDropDownMenu_AddButton(resetOpt)

  UIDropDownMenu_AddSeparator()

  -- ---- Close ----
  local closeOpt = UIDropDownMenu_CreateInfo()
  closeOpt.text        = "Close"
  closeOpt.notCheckable = true
  closeOpt.func = function()
    CloseDropDownMenus()
  end
  UIDropDownMenu_AddButton(closeOpt)
end

---Show the right-click context menu at cursor position.
function HT.ShowRightClickMenu()
  UIDropDownMenu_Initialize(RightClickMenu, InitializeRightClickMenu, "MENU")
  ToggleDropDownMenu(1, nil, RightClickMenu, "cursor", 0, 0)
end
