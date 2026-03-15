-- HT_DB.lua
-- AceDB init + SavedVariables defaults
-- Profile scope = per character (keyed "Name - Realm" automatically by AceDB)

HT = HT or {}

local DEFAULTS = {
  profile = {
    show     = true,
    position = { x = 400, y = -200 },
    scale    = 1.0,
    -- Collapsed state per section
    collapsed = {
      tasks       = false,
      vault       = false,
      crests      = false,
      professions = true,
    },
    -- Manual task checkboxes: [weekNum][taskId] = bool
    -- Auto-detected tasks are NOT stored here — they query live APIs.
    tasks = {},
    -- Profession weeklies: [profKey][weekNum] = { weekly_quest=bool, patron_orders=bool, treatise=bool }
    professions = {},
    -- UI appearance
    ui = {
      rowHeight       = 22,
      fontSize        = 12,
      width           = 320,
      backgroundColor = { r = 0, g = 0, b = 0, a = 0.80 },
    },
    -- Options
    options = {
      hideWhenAllDone = false,
    },
  },
  global = {
    minimap = {
      hide              = false,
      showInCompartment = true,
      minimapPos        = 220,
    },
    -- Saved by /ht scan — flush to disk with /reload
    scanResults = nil,
  },
}

---Initialize AceDB and expose db + globalDB on HT
function HT.InitDB()
  local aceDB = LibStub("AceDB-3.0"):New("HoolggTrackerDB", DEFAULTS)
  HT.db       = aceDB.profile
  HT.globalDB = aceDB.global
end
