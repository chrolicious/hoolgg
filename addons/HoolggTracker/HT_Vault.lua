-- HT_Vault.lua
-- Reads live Great Vault data from C_WeeklyRewards.GetActivities()
-- Data is NEVER stored in SavedVariables — always fetched live.

HT = HT or {}

-- Activity type constants (fallback if Enum not available)
local TYPE_RAID   = (Enum and Enum.WeeklyRewardChestThresholdType and Enum.WeeklyRewardChestThresholdType.Raid)      or 1
local TYPE_MPLUS  = (Enum and Enum.WeeklyRewardChestThresholdType and Enum.WeeklyRewardChestThresholdType.MythicPlus) or 2
local TYPE_WORLD  = (Enum and Enum.WeeklyRewardChestThresholdType and Enum.WeeklyRewardChestThresholdType.World)      or 3

---Get the vault reward ilvl for a raid activity based on its level field.
---The level field in C_WeeklyRewards corresponds to difficulty:
---  LFR=1, Normal=2, Heroic=3, Mythic=4
---@param level number
---@return number ilvl
local function GetRaidVaultIlvl(level)
  return HT.VAULT_RAID_ILVL[level] or 0
end

---Get the vault reward ilvl for a completed M+ key level.
---@param level number Key level
---@return number ilvl
local function GetMplusVaultIlvl(level)
  -- Clamp to max known
  local max = 12
  local clamped = math.min(level, max)
  return HT.VAULT_MPLUS_ILVL[clamped] or (HT.VAULT_MPLUS_ILVL[max] or 0)
end

---Get vault data from C_WeeklyRewards.GetActivities().
---Returns nil if the API is unavailable (pre-launch).
---@return table|nil vaultData
---  vaultData = {
---    raid    = { { progress, threshold, level, ilvl, done } x 3 },
---    mplus   = { { progress, threshold, level, ilvl, done } x 3 },
---    world   = { { progress, threshold, level, ilvl, done } x 1 },
---    totalDone  = number,
---    totalSlots = 7,
---  }
function HT.GetVaultData()
  if not C_WeeklyRewards or not C_WeeklyRewards.GetActivities then
    return nil
  end

  local activities = C_WeeklyRewards.GetActivities()
  if not activities then
    return nil
  end

  local result = {
    raid  = {},
    mplus = {},
    world = {},
    totalDone  = 0,
    totalSlots = 7,
  }

  for _, activity in ipairs(activities) do
    local slot = {
      progress  = activity.progress  or 0,
      threshold = activity.threshold or 0,
      level     = activity.level     or 0,
      ilvl      = 0,
      done      = false,
    }

    slot.done = (slot.progress >= slot.threshold) and (slot.threshold > 0)

    if slot.done then
      result.totalDone = result.totalDone + 1
    end

    if activity.type == TYPE_RAID then
      slot.ilvl = GetRaidVaultIlvl(slot.level)
      table.insert(result.raid, slot)
    elseif activity.type == TYPE_MPLUS then
      slot.ilvl = GetMplusVaultIlvl(slot.level)
      table.insert(result.mplus, slot)
    elseif activity.type == TYPE_WORLD then
      -- World slot ilvl not directly provided by the API the same way;
      -- use the activity's itemLevel if present, else look up from delve tier
      slot.ilvl = (activity.itemLevel and activity.itemLevel > 0) and activity.itemLevel
                  or (HT.VAULT_DELVE_ILVL[slot.level] or 0)
      table.insert(result.world, slot)
    end
  end

  return result
end

---Returns a short summary string for the vault section header badge.
---@return string e.g. "3/7"
function HT.GetVaultSummary()
  local data = HT.GetVaultData()
  if not data then
    return "N/A"
  end
  return data.totalDone .. "/" .. data.totalSlots
end
