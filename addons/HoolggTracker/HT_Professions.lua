-- HT_Professions.lua
-- Profession detection + weekly toggle state
-- Only professions the character has learned are shown.

HT = HT or {}

-- Map profession skill line IDs → key used in HT.PROFESSION_WEEKLY_QUEST_IDS
-- These skill line IDs are for Midnight / The War Within era professions.
-- Update if skill line IDs change between expansions.
HT.PROFESSION_SKILL_LINES = {
  [171]  = "alchemy",
  [164]  = "blacksmithing",
  [333]  = "enchanting",
  [202]  = "engineering",
  [182]  = "herbalism",
  [773]  = "inscription",
  [755]  = "jewelcrafting",
  [165]  = "leatherworking",
  [186]  = "mining",
  [393]  = "skinning",
  [197]  = "tailoring",
}

-- Professions that have patron orders (crafting professions only)
HT.PROFESSION_HAS_PATRON = {
  alchemy        = true,
  blacksmithing  = true,
  enchanting     = true,
  engineering    = true,
  inscription    = true,
  jewelcrafting  = true,
  leatherworking = true,
  tailoring      = true,
}

---Get the character's learned primary professions.
---Returns a list of profession entries with metadata.
---@return table professions List of { key, name, skillLineId, icon }
function HT.GetCharacterProfessions()
  local result    = {}
  local prof1, prof2 = GetProfessions()

  local function addProf(index)
    if not index then return end
    local name, icon, skillLevel, maxSkillLevel, _, _, skillLineId = GetProfessionInfo(index)
    if not name then return end
    local key = HT.PROFESSION_SKILL_LINES[skillLineId]
    if key then
      table.insert(result, {
        key           = key,
        name          = name,
        skillLineId   = skillLineId,
        icon          = icon or "Interface\\Icons\\INV_Misc_QuestionMark",
        skillLevel    = skillLevel    or 0,
        maxSkillLevel = maxSkillLevel or 100,
      })
    end
  end

  addProf(prof1)
  addProf(prof2)
  return result
end

---Traverse the Midnight profession spec tree and sum all spent KP ranks.
---@param midId number  Midnight expansion skill line ID (e.g. 2906 for Alchemy)
---@return number kpSpent
function HT.ComputeKPSpent(midId)
  if not C_ProfSpecs or not C_Traits then return 0 end
  local configID = C_ProfSpecs.GetConfigIDForSkillLine(midId)
  if not configID then return 0 end
  local tabIDs = C_ProfSpecs.GetSpecTabIDsForSkillLine(midId)
  if not tabIDs or #tabIDs == 0 then return 0 end
  local spent = 0
  for _, tabID in ipairs(tabIDs) do
    local tabInfo = C_ProfSpecs.GetTabInfo(tabID)
    if tabInfo and tabInfo.rootNodeID then
      local todo    = { tabInfo.rootNodeID }
      local visited = {}
      while #todo > 0 do
        local nodeID = table.remove(todo, 1)
        if not visited[nodeID] then
          visited[nodeID] = true
          for _, child in ipairs(C_ProfSpecs.GetChildrenForPath(nodeID) or {}) do
            table.insert(todo, child)
          end
          local info = C_Traits.GetNodeInfo(configID, nodeID)
          if info and (info.activeRank or 0) > 0 then
            spent = spent + info.activeRank
          end
        end
      end
    end
  end
  return spent
end

---Get the name of the currently active specialization for a Midnight profession.
---@param midId number  Midnight expansion skill line ID
---@return string|nil specName
function HT.GetActiveSpecName(midId)
  if not C_ProfSpecs then return nil end
  local tabIDs = C_ProfSpecs.GetSpecTabIDsForSkillLine(midId)
  if not tabIDs then return nil end
  for _, tabID in ipairs(tabIDs) do
    local tabInfo = C_ProfSpecs.GetTabInfo(tabID)
    if tabInfo and tabInfo.isActive then
      return tabInfo.name
    end
  end
  return nil
end

---Get detailed KP and source data for a profession.
---@param profKey string  e.g. "alchemy"
---@return table|nil detail  { kpAvailable, kpSpent, kpTotal, specName, uniqueDone, uniqueTotal, weeklyDone, weeklyTotal }
function HT.GetProfessionDetailData(profKey)
  local midId = HT.MIDNIGHT_PROFESSION_IDS and HT.MIDNIGHT_PROFESSION_IDS[profKey]
  if not midId then return nil end

  -- KP available (unspent balance)
  local kpAvailable = 0
  if C_ProfSpecs then
    local ci = C_ProfSpecs.GetCurrencyInfoForSkillLine(midId)
    kpAvailable = ci and (ci.numAvailable or 0) or 0
  end

  -- KP spent (via tree traversal)
  local kpSpent = HT.ComputeKPSpent(midId)

  -- Active specialization
  local specName = HT.GetActiveSpecName(midId)

  -- One-time and weekly KP sources
  local sources = HT.PROFESSION_KP_SOURCES and HT.PROFESSION_KP_SOURCES[profKey]
  local uniqueDone, uniqueTotal = 0, 0
  local weeklyDone, weeklyTotal = 0, 0
  if sources then
    uniqueTotal = #sources.unique
    for _, qid in ipairs(sources.unique) do
      if C_QuestLog.IsQuestFlaggedCompleted(qid) then
        uniqueDone = uniqueDone + 1
      end
    end
    weeklyTotal = #sources.weekly
    for _, qid in ipairs(sources.weekly) do
      if C_QuestLog.IsQuestFlaggedCompleted(qid) then
        weeklyDone = weeklyDone + 1
      end
    end
  end

  return {
    kpAvailable  = kpAvailable,
    kpSpent      = kpSpent,
    kpTotal      = kpAvailable + kpSpent,
    specName     = specName,
    uniqueDone   = uniqueDone,
    uniqueTotal  = uniqueTotal,
    weeklyDone   = weeklyDone,
    weeklyTotal  = weeklyTotal,
  }
end

---Get weekly profession task data for a given week.
---Returns per-character state for each learned profession.
---@param weekNum number
---@return table profData Keyed by profession key
function HT.GetProfessionWeeklyData(weekNum)
  local profs    = HT.GetCharacterProfessions()
  local db       = HT.db
  local result   = {}

  for _, prof in ipairs(profs) do
    local key      = prof.key
    local weekData = (db.professions[key] or {})[weekNum] or {}

    -- Auto-detect weekly quest completion via questId if known
    local weeklyQuestId   = HT.PROFESSION_WEEKLY_QUEST_IDS[key]
    local patronQuestId   = HT.PROFESSION_PATRON_QUEST_IDS[key]

    local weeklyQuestDone = false
    local patronOrdersDone = false

    if weeklyQuestId and weeklyQuestId > 0 then
      weeklyQuestDone = C_QuestLog.IsQuestFlaggedCompleted(weeklyQuestId) == true
    else
      weeklyQuestDone = weekData.weekly_quest == true
    end

    if HT.PROFESSION_HAS_PATRON[key] then
      if patronQuestId and patronQuestId > 0 then
        patronOrdersDone = C_QuestLog.IsQuestFlaggedCompleted(patronQuestId) == true
      else
        patronOrdersDone = weekData.patron_orders == true
      end
    end

    local treatiseDone = weekData.treatise == true

    result[key] = {
      key              = key,
      name             = prof.name,
      icon             = prof.icon,
      skillLevel       = prof.skillLevel,
      maxSkillLevel    = prof.maxSkillLevel,
      weeklyQuestDone  = weeklyQuestDone,
      weeklyQuestAuto  = weeklyQuestId and weeklyQuestId > 0,
      patronOrdersDone = patronOrdersDone,
      patronOrdersAuto = patronQuestId and patronQuestId > 0,
      hasPatron        = HT.PROFESSION_HAS_PATRON[key] or false,
      treatiseDone     = treatiseDone,
      detail           = HT.GetProfessionDetailData(key),
    }
  end

  return result
end

---Toggle a manual profession task checkbox.
---@param profKey string e.g. "alchemy"
---@param weekNum number
---@param taskKey string "weekly_quest" | "patron_orders" | "treatise"
function HT.ToggleProfessionTask(profKey, weekNum, taskKey)
  local db = HT.db
  if not db.professions[profKey] then
    db.professions[profKey] = {}
  end
  if not db.professions[profKey][weekNum] then
    db.professions[profKey][weekNum] = {}
  end
  local current = db.professions[profKey][weekNum][taskKey]
  db.professions[profKey][weekNum][taskKey] = not (current == true)
end

---Get completion count for profession weeklies.
---@param weekNum number
---@return table { done=number, total=number }
function HT.GetProfessionCompletion(weekNum)
  local data  = HT.GetProfessionWeeklyData(weekNum)
  local done  = 0
  local total = 0

  for _, prof in pairs(data) do
    -- weekly quest
    total = total + 1
    if prof.weeklyQuestDone then done = done + 1 end
    -- treatise
    total = total + 1
    if prof.treatiseDone then done = done + 1 end
    -- patron orders (only for crafting profs)
    if prof.hasPatron then
      total = total + 1
      if prof.patronOrdersDone then done = done + 1 end
    end
  end

  return { done = done, total = total }
end
