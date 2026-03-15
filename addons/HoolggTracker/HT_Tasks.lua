-- HT_Tasks.lua
-- Checklist state management + auto-detect dispatcher

HT = HT or {}

---Get the task list for a given week, annotated with checked state.
---@param weekNum number
---@return table tasks List of { id, label, checked, autoDetected }
function HT.GetTasksForWeek(weekNum)
  local def = HT.TASK_DEFINITIONS[weekNum]
  if not def or not def.weekly then return {} end

  local db       = HT.db
  local weekData = db.tasks[weekNum] or {}
  local result   = {}

  for _, task in ipairs(def.weekly) do
    local checked, autoDetected = false, false

    if task.autoDetect then
      checked      = HT.AutoDetectTask(task.autoDetect)
      autoDetected = true
    else
      checked = weekData[task.id] == true
    end

    table.insert(result, {
      id           = task.id,
      label        = task.label,
      checked      = checked,
      autoDetected = autoDetected,
    })
  end

  return result
end

---Toggle a manual task checkbox.
---No-op for auto-detected tasks.
---@param weekNum number
---@param taskId string
function HT.ToggleTask(weekNum, taskId)
  local def = HT.TASK_DEFINITIONS[weekNum]
  if not def then return end
  for _, task in ipairs(def.weekly or {}) do
    if task.id == taskId then
      if task.autoDetect then return end
      break
    end
  end
  local db = HT.db
  if not db.tasks[weekNum] then db.tasks[weekNum] = {} end
  db.tasks[weekNum][taskId] = not (db.tasks[weekNum][taskId] == true)
end

---Dispatch an auto-detect check by key.
---All unknown IDs (0) return false safely.
---@param detectKey string
---@return boolean
function HT.AutoDetectTask(detectKey)
  -- ---- Live vault slots ----
  if detectKey == "vault_raid_slot1" then
    local d = HT.GetVaultData()
    return d and d.raid and d.raid[1] and d.raid[1].done or false

  elseif detectKey == "vault_mplus_slot1" then
    local d = HT.GetVaultData()
    return d and d.mplus and d.mplus[1] and d.mplus[1].done or false

  elseif detectKey == "vault_world_slot1" then
    local d = HT.GetVaultData()
    return d and d.world and d.world[1] and d.world[1].done or false

  -- ---- Quest completion ----
  elseif detectKey:sub(1, 8) == "questId:" then
    local questId = tonumber(detectKey:sub(9))
    if not questId or questId == 0 then return false end
    return C_QuestLog.IsQuestFlaggedCompleted(questId) == true

  -- ---- Level cap ----
  elseif detectKey == "level_cap" then
    return UnitLevel("player") >= GetMaxPlayerLevel()

  -- ---- Renown: "renown_KEY:REQUIRED_LEVEL" ----
  elseif detectKey:sub(1, 7) == "renown_" then
    local colonPos = detectKey:find(":")
    if not colonPos then return false end
    local factionKey = detectKey:sub(8, colonPos - 1)
    local required   = tonumber(detectKey:sub(colonPos + 1))
    local factionId  = HT.MAJOR_FACTION_IDS and HT.MAJOR_FACTION_IDS[factionKey]
    if not factionId or factionId == 0 or not required then return false end
    if not C_MajorFactions or not C_MajorFactions.GetMajorFactionData then return false end
    local data = C_MajorFactions.GetMajorFactionData(factionId)
    return data and data.renownLevel >= required or false

  -- ---- Raid lockouts ----
  elseif detectKey == "raid_normal" then
    return HT._CheckRaidLockout(HT.RAID_INSTANCE_IDS.midnight_s1, HT.DIFFICULTY.normal)

  elseif detectKey == "raid_heroic" then
    return HT._CheckRaidLockout(HT.RAID_INSTANCE_IDS.midnight_s1, HT.DIFFICULTY.heroic)

  elseif detectKey == "raid_mythic" then
    return HT._CheckRaidLockout(HT.RAID_INSTANCE_IDS.midnight_s1, HT.DIFFICULTY.mythic)

  elseif detectKey == "raid_lfr" then
    return HT._CheckRaidLockout(HT.RAID_INSTANCE_IDS.midnight_s1, HT.DIFFICULTY.lfr)

  -- ---- Any M+ completed this week ----
  elseif detectKey == "mplus_any" then
    if not C_MythicPlus or not C_MythicPlus.GetRunHistory then return false end
    local history = C_MythicPlus.GetRunHistory(false, true)
    return history and #history > 0 or false
  end

  return false
end

---Check if a raid lockout exists for the given instance + difficulty.
---Returns false if instanceId == 0 (pending).
---@param instanceId number
---@param difficultyId number
---@return boolean
function HT._CheckRaidLockout(instanceId, difficultyId)
  if not instanceId or instanceId == 0 then return false end
  local numInstances = GetNumSavedInstances()
  for i = 1, numInstances do
    local _, id, _, difficulty, locked = GetSavedInstanceInfo(i)
    if id == instanceId and difficulty == difficultyId and locked then
      return true
    end
  end
  return false
end

---Completion counts for a week.
---@param weekNum number
---@return table { done=number, total=number }
function HT.GetTaskCompletion(weekNum)
  local tasks = HT.GetTasksForWeek(weekNum)
  local done  = 0
  for _, t in ipairs(tasks) do
    if t.checked then done = done + 1 end
  end
  return { done = done, total = #tasks }
end

---Reset manual task checkboxes for a week.
---@param weekNum number
function HT.ResetWeekTasks(weekNum)
  HT.db.tasks[weekNum] = {}
end
