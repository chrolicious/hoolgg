-- HT_Ui.lua
-- Frame pool + RenderTree
-- Visual style: dark glassmorphism matching hool.gg web app.

HT = HT or {}

local TITLE_HEIGHT          = 24
local SECTION_HEADER_HEIGHT = 26
local ROW_PADDING           = 1

-- ============================================================
-- Main frame
-- ============================================================
local f = CreateFrame("Frame", "HoolggTrackerFrame", UIParent, "BackdropTemplate")
HT.ui = f

local function ApplyFrameBackdrop(frame, bgA)
  frame:SetBackdrop({
    bgFile   = "Interface/Buttons/WHITE8X8",
    edgeFile = "Interface/Buttons/WHITE8X8",
    edgeSize = 1,
    insets   = { left = 1, right = 1, top = 1, bottom = 1 },
  })
  frame:SetBackdropColor(0, 0, 0, bgA or 0.80)
  frame:SetBackdropBorderColor(1, 1, 1, 0.08)
end

-- ============================================================
-- Row frame pool
-- ============================================================
local framePool = CreateFramePool(
  "Button",
  f,
  nil,
  -- Reset: restore ALL properties to constructor defaults so no state bleeds between rows
  function(pool, b)
    local rowHeight = HT.db and HT.db.ui.rowHeight or 22
    local fontSize  = HT.db and HT.db.ui.fontSize  or 12

    b._htData    = nil
    b._htType    = nil
    b._htSection = nil
    b:SetHeight(rowHeight)
    b:Hide()
    b:ClearAllPoints()
    b:SetScript("OnClick", nil)

    if b.background then
      b.background:SetVertexColor(0, 0, 0, 0.40)
    end
    if b.leftText then
      b.leftText:SetText("")
      b.leftText:ClearAllPoints()
      b.leftText:SetPoint("LEFT", 8, 0)
      b.leftText:SetPoint("RIGHT", b, "RIGHT", -80, 0)
      b.leftText:SetFont("Fonts/FRIZQT__.TTF", fontSize, "")
      b.leftText:SetTextColor(1, 1, 1, 1)
    end
    if b.rightText then
      b.rightText:SetText("")
      b.rightText:SetFont("Fonts/FRIZQT__.TTF", fontSize, "OUTLINE")
      b.rightText:SetTextColor(0.90, 0.80, 0.50, 1)
    end
    if b.checkmark then b.checkmark:Hide() end
    if b.accentBar then b.accentBar:Hide() end
    if b.progressBar then
      b.progressBar:SetValue(0)
      b.progressBar:Hide()
    end
    b:UnregisterAllEvents()
  end,
  false,
  -- Constructor: create child regions once; pool reset keeps them in default state
  function(b)
    local db        = HT.db
    local rowHeight = db and db.ui.rowHeight or 22
    local fontSize  = db and db.ui.fontSize  or 12
    local width     = db and db.ui.width     or 320

    b:SetHeight(rowHeight)
    b:SetWidth(width)
    b:SetPropagateMouseClicks(false)

    -- Row background
    b.background = b:CreateTexture(nil, "BACKGROUND")
    b.background:SetAllPoints()
    b.background:SetTexture("Interface/Buttons/WHITE8X8")
    b.background:SetVertexColor(0, 0, 0, 0.40)

    -- Hover highlight
    b.highlightTex = b:CreateTexture(nil, "HIGHLIGHT")
    b.highlightTex:SetAllPoints()
    b.highlightTex:SetTexture("Interface/Buttons/WHITE8X8")
    b.highlightTex:SetVertexColor(1, 1, 1, 0.06)

    -- Left accent bar (2px stripe)
    b.accentBar = b:CreateTexture(nil, "BORDER")
    b.accentBar:SetWidth(2)
    b.accentBar:SetPoint("TOPLEFT", 0, 0)
    b.accentBar:SetPoint("BOTTOMLEFT", 0, 0)
    b.accentBar:SetTexture("Interface/Buttons/WHITE8X8")
    b.accentBar:Hide()

    -- Checkmark (task / profession rows only)
    b.checkmark = b:CreateTexture(nil, "OVERLAY")
    b.checkmark:SetSize(14, 14)
    b.checkmark:SetPoint("LEFT", 6, 0)
    b.checkmark:SetTexture("Interface\\Buttons\\UI-CheckBox-Check")
    b.checkmark:Hide()

    -- Left label — default indent 8px (non-checkbox rows)
    b.leftText = b:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    b.leftText:SetPoint("LEFT", 8, 0)
    b.leftText:SetPoint("RIGHT", b, "RIGHT", -80, 0)
    b.leftText:SetHeight(rowHeight)
    b.leftText:SetJustifyH("LEFT")
    b.leftText:SetJustifyV("MIDDLE")
    b.leftText:SetFont("Fonts/FRIZQT__.TTF", fontSize, "")
    b.leftText:SetTextColor(1, 1, 1, 1)
    b.leftText:SetShadowColor(0, 0, 0, 0.8)
    b.leftText:SetShadowOffset(1, -1)

    -- Right badge / ilvl
    b.rightText = b:CreateFontString(nil, "OVERLAY", "GameFontNormal")
    b.rightText:SetPoint("RIGHT", -6, 0)
    b.rightText:SetWidth(74)
    b.rightText:SetHeight(rowHeight)
    b.rightText:SetJustifyH("RIGHT")
    b.rightText:SetJustifyV("MIDDLE")
    b.rightText:SetFont("Fonts/FRIZQT__.TTF", fontSize, "OUTLINE")
    b.rightText:SetTextColor(0.90, 0.80, 0.50, 1)
    b.rightText:SetShadowColor(0, 0, 0, 0.8)
    b.rightText:SetShadowOffset(1, -1)

    -- 3px progress bar at row bottom (vault / crests)
    b.progressBar = CreateFrame("StatusBar", nil, b)
    b.progressBar:SetPoint("BOTTOMLEFT", 0, 0)
    b.progressBar:SetPoint("BOTTOMRIGHT", 0, 0)
    b.progressBar:SetHeight(3)
    b.progressBar:SetStatusBarTexture("Interface/Buttons/WHITE8X8")
    b.progressBar:SetMinMaxValues(0, 1)
    b.progressBar:SetValue(0)
    b.progressBar:Hide()
  end
)

-- ============================================================
-- Helper: indent leftText for checkbox rows (tasks / professions)
-- ============================================================
local function SetCheckboxIndent(b)
  b.leftText:ClearAllPoints()
  b.leftText:SetPoint("LEFT", 24, 0)
  b.leftText:SetPoint("RIGHT", b, "RIGHT", -80, 0)
end

-- ============================================================
-- Row builders
-- ============================================================

local function AddSectionHeader(sectionKey, label, badge, collapsed)
  local b = framePool:Acquire()
  b:SetHeight(SECTION_HEADER_HEIGHT)
  b._htType    = "section"
  b._htSection = sectionKey

  b.background:SetVertexColor(0.04, 0.02, 0.08, 0.85)

  local c = HT.COLORS[sectionKey] or HT.COLORS.tasks
  b.accentBar:SetVertexColor(c[1], c[2], c[3], 1)
  b.accentBar:Show()

  b.leftText:SetFont("Fonts/FRIZQT__.TTF", 13, "OUTLINE")
  b.leftText:SetTextColor(1, 1, 1, 1)
  local arrow = collapsed and "|TInterface\\Buttons\\Arrow-Down-Up:12:12|t"
                           or "|TInterface\\Buttons\\Arrow-Down-Down:12:12|t"
  b.leftText:SetText(arrow .. " " .. label)

  b.rightText:SetFont("Fonts/FRIZQT__.TTF", 11, "OUTLINE")
  b.rightText:SetTextColor(0.90, 0.80, 0.50, 1)
  b.rightText:SetText(badge or "")

  b:SetScript("OnClick", function()
    HT.db.collapsed[sectionKey] = not HT.db.collapsed[sectionKey]
    HT.ui:RenderTree()
  end)

  b:Show()
  return b
end

local function AddTaskRow(task, weekNum)
  local b = framePool:Acquire()
  b._htType = "task"
  b._htData = task

  SetCheckboxIndent(b)

  if task.checked then
    b.leftText:SetTextColor(1, 1, 1, 1)
    b.background:SetVertexColor(0.04, 0.08, 0.04, 0.50)
    b.checkmark:SetVertexColor(0.12, 1.00, 0.00, 1)
  else
    b.leftText:SetTextColor(1, 1, 1, 0.55)
    b.checkmark:SetVertexColor(1, 1, 1, 0.20)
  end
  b.checkmark:Show()
  b.leftText:SetText(task.label)

  if task.autoDetected then
    b.rightText:SetText(HT.Muted("auto"))
  else
    b:SetScript("OnClick", function()
      HT.ToggleTask(weekNum, task.id)
      HT.ui:RenderTree()
    end)
  end

  b:Show()
  return b
end

local function AddVaultRow(slot, slotType, slotNum)
  local b = framePool:Acquire()
  b._htType = "vault"

  local typeLabel = ({ raid="Raid", mplus="M+", world="World" })[slotType] or slotType
  local label
  if slot.done then
    if slotType == "mplus" then
      label = typeLabel .. " +" .. slot.level .. "  slot " .. slotNum
    elseif slotType == "raid" then
      local diffs = { [1]="LFR", [2]="Normal", [3]="Heroic", [4]="Mythic" }
      label = typeLabel .. " " .. (diffs[slot.level] or "?") .. "  slot " .. slotNum
    else
      label = typeLabel .. "  slot " .. slotNum
    end
    b.leftText:SetTextColor(1, 1, 1, 1)
    b.background:SetVertexColor(0.13, 0.77, 0.33, 0.10)
    b.rightText:SetTextColor(0.90, 0.80, 0.50, 1)
    b.rightText:SetText(slot.ilvl > 0 and HT.Gold(tostring(slot.ilvl)) or "—")
  else
    label = typeLabel .. "  slot " .. slotNum .. "  (" .. slot.progress .. "/" .. slot.threshold .. ")"
    b.leftText:SetTextColor(1, 1, 1, 0.45)
    b.background:SetVertexColor(0, 0, 0, 0.20)
    b.rightText:SetTextColor(1, 1, 1, 0.30)
    b.rightText:SetText("—")
  end
  b.leftText:SetText(label)

  if slot.threshold > 0 then
    local colorKey = ({ raid="vault_raid", mplus="vault_mplus", world="vault_world" })[slotType]
    local c = HT.COLORS[colorKey]
    if c then b.progressBar:GetStatusBarTexture():SetVertexColor(c[1], c[2], c[3], 0.8) end
    b.progressBar:SetMinMaxValues(0, slot.threshold)
    b.progressBar:SetValue(math.min(slot.progress, slot.threshold))
    b.progressBar:Show()
  end

  b:Show()
  return b
end

local function AddCrestRow(entry)
  local b = framePool:Acquire()
  b._htType = "crest"

  b.leftText:SetText(entry.label .. " Crests")

  if not entry.valid then
    b.leftText:SetTextColor(1, 1, 1, 0.40)
    b.rightText:SetText(HT.Muted("pending"))
  else
    local c = HT.COLORS[entry.colorKey]
    if c then b.background:SetVertexColor(c[1]*0.15, c[2]*0.15, c[3]*0.15, 0.50) end
    b.leftText:SetTextColor(1, 1, 1, 0.90)
    b.rightText:SetTextColor(0.90, 0.80, 0.50, 1)
    local earned = entry.earnedThisWeek
    local cap    = entry.cap
    b.rightText:SetText(earned .. " / " .. cap)
    if cap > 0 and c then
      b.progressBar:GetStatusBarTexture():SetVertexColor(c[1], c[2], c[3], 0.8)
      b.progressBar:SetMinMaxValues(0, cap)
      b.progressBar:SetValue(math.min(earned, cap))
      b.progressBar:Show()
    end
  end

  b:Show()
  return b
end

local function AddProfessionRows(profData, weekNum)
  local rows = {}

  -- Profession header (gold label + skill level badge)
  local b = framePool:Acquire()
  b._htType = "prof_header"
  b:SetHeight(SECTION_HEADER_HEIGHT - 2)
  b.background:SetVertexColor(0.08, 0.06, 0.12, 0.70)
  b.leftText:SetFont("Fonts/FRIZQT__.TTF", 12, "OUTLINE")
  b.leftText:SetTextColor(0.90, 0.80, 0.50, 1)
  b.leftText:SetText(profData.name)
  if (profData.maxSkillLevel or 0) > 0 then
    b.rightText:SetText(profData.skillLevel .. "/" .. profData.maxSkillLevel)
    b.rightText:SetTextColor(1, 1, 1, 0.60)
    b.rightText:SetFont("Fonts/FRIZQT__.TTF", 11, "")
  end
  table.insert(rows, b)
  b:Show()

  -- KP + spec row
  local detail = profData.detail
  if detail then
    local kr = framePool:Acquire()
    kr._htType = "prof_kp"
    kr:SetHeight(18)
    kr.leftText:ClearAllPoints()
    kr.leftText:SetPoint("LEFT", 12, 0)
    kr.leftText:SetPoint("RIGHT", kr, "RIGHT", -90, 0)
    kr.leftText:SetFont("Fonts/FRIZQT__.TTF", 11, "")
    if detail.kpTotal > 0 then
      kr.leftText:SetText(HT.Muted("KP: ") .. detail.kpAvailable .. HT.Muted(" avail | ") .. detail.kpSpent .. HT.Muted(" spent"))
      kr.leftText:SetTextColor(1, 1, 1, 0.80)
    else
      kr.leftText:SetText(HT.Muted("KP: pending"))
    end
    if detail.specName then
      kr.rightText:SetText(detail.specName)
      kr.rightText:SetFont("Fonts/FRIZQT__.TTF", 10, "")
      kr.rightText:SetTextColor(0.64, 0.20, 0.93, 1)  -- epic purple
    end
    kr:Show()
    table.insert(rows, kr)

    -- KP sources row
    local sr = framePool:Acquire()
    sr._htType = "prof_sources"
    sr:SetHeight(18)
    sr.leftText:ClearAllPoints()
    sr.leftText:SetPoint("LEFT", 12, 0)
    sr.leftText:SetPoint("RIGHT", sr, "RIGHT", -4, 0)
    sr.leftText:SetFont("Fonts/FRIZQT__.TTF", 11, "")
    local uDone  = detail.uniqueDone
    local uTotal = detail.uniqueTotal
    local wDone  = detail.weeklyDone
    local wTotal = detail.weeklyTotal
    local uColor = (uDone >= uTotal and uTotal > 0) and "|cff1eff00" or "|cffaaaaaa"
    local wColor = (wDone >= wTotal and wTotal > 0) and "|cff1eff00" or "|cffaaaaaa"
    sr.leftText:SetText(
      uColor .. "One-time: " .. uDone .. "/" .. uTotal .. "|r  " ..
      wColor .. "Weekly: "   .. wDone .. "/" .. wTotal .. "|r"
    )
    sr:Show()
    table.insert(rows, sr)
  end

  -- Helper: build a single profession task sub-row
  local function ProfTaskRow(label, done, isAuto, profKey, taskKey)
    local r = framePool:Acquire()
    r._htType = "prof_task"
    SetCheckboxIndent(r)
    if done then
      r.leftText:SetTextColor(1, 1, 1, 1)
      r.background:SetVertexColor(0.04, 0.08, 0.04, 0.50)
      r.checkmark:SetVertexColor(0.12, 1.00, 0.00, 1)
    else
      r.leftText:SetTextColor(1, 1, 1, 0.55)
      r.checkmark:SetVertexColor(1, 1, 1, 0.20)
    end
    r.checkmark:Show()
    r.leftText:SetText(label)
    if isAuto then
      r.rightText:SetText(HT.Muted("auto"))
    else
      r:SetScript("OnClick", function()
        HT.ToggleProfessionTask(profKey, weekNum, taskKey)
        HT.ui:RenderTree()
      end)
    end
    r:Show()
    return r
  end

  table.insert(rows, ProfTaskRow("Weekly Quest",   profData.weeklyQuestDone,  profData.weeklyQuestAuto,  profData.key, "weekly_quest"))
  if profData.hasPatron then
    table.insert(rows, ProfTaskRow("Patron Orders", profData.patronOrdersDone, profData.patronOrdersAuto, profData.key, "patron_orders"))
  end
  table.insert(rows, ProfTaskRow("Treatise",       profData.treatiseDone,     false,                     profData.key, "treatise"))

  return rows
end

-- ============================================================
-- RenderTree
-- ============================================================
function f:RenderTree()
  local db = HT.db
  if not db then return end

  local width   = db.ui.width or 320
  local weekNum = HT.GetCurrentWeek()

  f:SetWidth(width)
  framePool:ReleaseAll()

  -- Update title bar with current week
  if f.titleText then
    f.titleText:SetText(HT.GetWeekLabel(weekNum))
  end

  local yOffset = TITLE_HEIGHT  -- rows start below the title bar
  local function PlaceRow(b)
    b:SetWidth(width)
    b:SetPoint("TOPLEFT", f, "TOPLEFT", 0, -yOffset)
    yOffset = yOffset + b:GetHeight() + ROW_PADDING
  end

  -- TASKS
  do
    local comp      = HT.GetTaskCompletion(weekNum)
    local collapsed = db.collapsed.tasks
    PlaceRow(AddSectionHeader("tasks", "Weekly Tasks", comp.done.."/"..comp.total, collapsed))
    if not collapsed then
      for _, task in ipairs(HT.GetTasksForWeek(weekNum)) do
        PlaceRow(AddTaskRow(task, weekNum))
      end
    end
  end

  -- VAULT
  do
    local collapsed = db.collapsed.vault
    PlaceRow(AddSectionHeader("vault", "Great Vault", HT.GetVaultSummary(), collapsed))
    if not collapsed then
      local vd = HT.GetVaultData()
      if not vd then
        local nb = framePool:Acquire()
        nb.leftText:SetText(HT.Muted("Not available before S1 launch"))
        nb:Show()
        PlaceRow(nb)
      else
        for i, s in ipairs(vd.raid)  do PlaceRow(AddVaultRow(s, "raid",  i)) end
        for i, s in ipairs(vd.mplus) do PlaceRow(AddVaultRow(s, "mplus", i)) end
        for i, s in ipairs(vd.world) do PlaceRow(AddVaultRow(s, "world", i)) end
      end
    end
  end

  -- CRESTS
  do
    local collapsed = db.collapsed.crests
    PlaceRow(AddSectionHeader("crests", "Crests", HT.GetCrestSummary(), collapsed))
    if not collapsed then
      local cd = HT.GetCrestData()
      for _, k in ipairs(HT.CREST_ORDER) do
        if cd[k] then PlaceRow(AddCrestRow(cd[k])) end
      end
    end
  end

  -- PROFESSIONS
  do
    local comp      = HT.GetProfessionCompletion(weekNum)
    local collapsed = db.collapsed.professions
    PlaceRow(AddSectionHeader("professions", "Professions", comp.done.."/"..comp.total, collapsed))
    if not collapsed then
      local pd     = HT.GetProfessionWeeklyData(weekNum)
      local hasAny = false
      for _, prof in pairs(pd) do
        hasAny = true
        for _, row in ipairs(AddProfessionRows(prof, weekNum)) do PlaceRow(row) end
      end
      if not hasAny then
        local nb = framePool:Acquire()
        nb.leftText:SetText(HT.Muted("No professions learned"))
        nb:Show()
        PlaceRow(nb)
      end
    end
  end

  f:SetHeight(math.max(yOffset, TITLE_HEIGHT + 10))
end

-- ============================================================
-- CreateUI
-- ============================================================
function HT.CreateUI()
  local db = HT.db
  if not db then return end

  local pos   = db.position or { x = 400, y = -200 }
  local width = db.ui.width or 320

  f:SetPoint("TOPLEFT", pos.x, pos.y)
  f:SetWidth(width)
  f:SetScale(db.scale or 1.0)
  f:SetFrameStrata("MEDIUM")
  ApplyFrameBackdrop(f, db.ui.backgroundColor and db.ui.backgroundColor.a or 0.80)

  -- Week title bar (permanent — not from pool)
  if not f.titleText then
    -- Thin separator line below title
    local sep = f:CreateTexture(nil, "BORDER")
    sep:SetHeight(1)
    sep:SetPoint("TOPLEFT",  f, "TOPLEFT",  0, -(TITLE_HEIGHT - 1))
    sep:SetPoint("TOPRIGHT", f, "TOPRIGHT", 0, -(TITLE_HEIGHT - 1))
    sep:SetTexture("Interface/Buttons/WHITE8X8")
    sep:SetVertexColor(1, 1, 1, 0.06)

    f.titleText = f:CreateFontString(nil, "OVERLAY")
    f.titleText:SetFont("Fonts/FRIZQT__.TTF", 12, "OUTLINE")
    f.titleText:SetPoint("TOPLEFT", 8, -5)
    f.titleText:SetPoint("TOPRIGHT", f, "TOPRIGHT", -8, -5)
    f.titleText:SetHeight(TITLE_HEIGHT - 4)
    f.titleText:SetJustifyH("LEFT")
    f.titleText:SetJustifyV("MIDDLE")
    f.titleText:SetTextColor(0.90, 0.80, 0.50, 1)  -- gold

    f.addonLabel = f:CreateFontString(nil, "OVERLAY")
    f.addonLabel:SetFont("Fonts/FRIZQT__.TTF", 9, "")
    f.addonLabel:SetPoint("TOPRIGHT", -6, -6)
    f.addonLabel:SetTextColor(1, 1, 1, 0.25)
    f.addonLabel:SetText("HoolggTracker")
  end

  -- Drag to move
  f:SetMovable(true)
  f:EnableMouse(true)
  f:SetClampedToScreen(true)
  f:RegisterForDrag("LeftButton")
  f:SetScript("OnDragStart", f.StartMoving)
  f:SetScript("OnDragStop", function()
    f:StopMovingOrSizing()
    local x, y = f:GetLeft(), f:GetTop() - GetScreenHeight()
    db.position = { x = x, y = y }
    f:ClearAllPoints()
    f:SetPoint("TOPLEFT", x, y)
    f:SetUserPlaced(true)
  end)
  f:SetScript("OnMouseDown", function(self, button)
    if button == "RightButton" then HT.ShowRightClickMenu() end
  end)

  f:RenderTree()
  f:Hide()
  return f
end

function HT.ToggleUI()
  if f:IsShown() then
    HT.db.show = false
    f:Hide()
  else
    HT.db.show = true
    f:RenderTree()
    f:Show()
  end
end

function HT.SetScale(scale)
  scale = math.max(0.5, math.min(1.5, scale))
  HT.db.scale = scale
  f:SetScale(scale)
end
