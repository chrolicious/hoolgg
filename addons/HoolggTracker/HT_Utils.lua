-- HT_Utils.lua
-- Color helpers, text formatting, atlas markup utilities

HT = HT or {}

-- ============================================================
-- Color palette — direct from hool.gg web app
-- ============================================================
HT.COLORS = {
  -- Section accents (left-edge bar)
  tasks        = { 0.64, 0.20, 0.93, 1 },   -- #a335ee (WoW epic purple)
  vault_raid   = { 0.94, 0.27, 0.27, 1 },   -- #ef4444 (red)
  vault_mplus  = { 0.23, 0.51, 0.95, 1 },   -- #3b82f6 (blue)
  vault_world  = { 0.13, 0.77, 0.33, 1 },   -- #22c55e (green)
  professions  = { 0.90, 0.80, 0.50, 1 },   -- #e5cc80 (WoW gold)

  -- Crest type colors (Midnight S1: Adventurer/Veteran/Champion/Hero/Myth Dawncrest)
  adventurer   = { 0.58, 0.64, 0.72, 1 },   -- #94a3b8 (slate)
  veteran      = { 0.30, 0.78, 0.58, 1 },   -- #4ade80 (green)
  champion     = { 0.38, 0.64, 0.98, 1 },   -- #60a5fa (blue)
  hero         = { 0.51, 0.55, 0.97, 1 },   -- #818cf8 (indigo)
  myth         = { 0.98, 0.80, 0.08, 1 },   -- #facc15 (gold)

  -- Parse percentile colors
  parse_gold   = { 0.90, 0.80, 0.50, 1 },   -- >=99
  parse_orange = { 1.00, 0.50, 0.00, 1 },   -- >=95
  parse_purple = { 0.64, 0.20, 0.93, 1 },   -- >=75
  parse_blue   = { 0.00, 0.44, 0.87, 1 },   -- >=50
  parse_green  = { 0.12, 1.00, 0.00, 1 },   -- >=25
  parse_gray   = { 0.62, 0.62, 0.62, 1 },   -- <25

  -- UI chrome
  section_bg   = { 0.04, 0.02, 0.08, 0.85 },
  row_bg       = { 0.00, 0.00, 0.00, 0.40 },
  border       = { 1.00, 1.00, 1.00, 0.08 },
  text_primary = { 1.00, 1.00, 1.00, 1.00 },
  text_muted   = { 1.00, 1.00, 1.00, 0.50 },
  text_dim     = { 1.00, 1.00, 1.00, 0.30 },
  badge_gold   = { 0.90, 0.80, 0.50, 1.00 },

  -- Unlocked vault cell
  vault_unlocked_bg     = { 0.13, 0.77, 0.33, 0.10 },
  vault_unlocked_border = { 0.13, 0.77, 0.33, 0.25 },
}

-- ============================================================
-- Color formatting helpers
-- ============================================================

---Wrap text in a WoW color escape using an HT.COLORS key
---@param colorKey string Key in HT.COLORS
---@param text string
---@return string
function HT.ColorText(colorKey, text)
  local c = HT.COLORS[colorKey]
  if not c then return text end
  return WrapTextInColorCode(text, string.format("%02x%02x%02x",
    math.floor(c[1] * 255),
    math.floor(c[2] * 255),
    math.floor(c[3] * 255)))
end

---Wrap text in a hex color string
---@param r number 0-1
---@param g number 0-1
---@param b number 0-1
---@param text string
---@return string
function HT.ColorTextRGB(r, g, b, text)
  return WrapTextInColorCode(text, string.format("%02x%02x%02x",
    math.floor(r * 255),
    math.floor(g * 255),
    math.floor(b * 255)))
end

---White text
---@param text string
---@return string
function HT.White(text)
  return "|cffffffff" .. text .. "|r"
end

---Gold text (WoW item quality color)
---@param text string
---@return string
function HT.Gold(text)
  return "|cffe5cc80" .. text .. "|r"
end

---Muted gray text
---@param text string
---@return string
function HT.Muted(text)
  return "|cff9d9d9d" .. text .. "|r"
end

---Green text (done/unlocked)
---@param text string
---@return string
function HT.Green(text)
  return "|cff1eff00" .. text .. "|r"
end

---Red text (warning)
---@param text string
---@return string
function HT.Red(text)
  return "|cffef4444" .. text .. "|r"
end

-- ============================================================
-- Misc helpers
-- ============================================================

---Apply an RGBA color table to a WoW texture or region
---@param region table WoW texture/region with SetVertexColor
---@param c table { r, g, b[, a] }
function HT.ApplyColor(region, c)
  if c[4] then
    region:SetVertexColor(c[1], c[2], c[3], c[4])
  else
    region:SetVertexColor(c[1], c[2], c[3])
  end
end

---Print a message to chat with the addon prefix
---@param msg string
function HT.Print(msg)
  print("|cff9d78ffHoolggTracker|r " .. tostring(msg))
end

---Safe table size (# is unreliable for non-sequential keys)
---@param t table
---@return number
function HT.TableSize(t)
  local count = 0
  for _ in pairs(t) do count = count + 1 end
  return count
end
