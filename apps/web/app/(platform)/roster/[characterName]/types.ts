// Character Detail Page — Shared TypeScript interfaces
// Maps to progress-api endpoints for roster character management

// ─── Character (from GET /guilds/{gid}/characters) ───

export interface CharacterRoster {
  id: number;
  character_name: string;
  realm: string;
  guild_id: number;
  class_name: string | null;
  spec: string | null;
  role: 'Tank' | 'Healer' | 'DPS' | null;
  level: number | null;
  avatar_url: string | null;
  render_url: string | null;
  user_bnet_id: number | null;
  display_order: number | null;
  current_ilvl: number | null;
  gear_details: Record<string, unknown> | null;
  parsed_gear: ParsedGear | null;
  character_stats: Record<string, unknown> | null;
  last_updated: string | null;
  created_at: string | null;
  last_gear_sync: string | null;
}

// ─── Season (from GET /guilds/{gid}/season) ───

export interface SeasonWeek {
  week_number: number;
  start_date: string;
  target_ilvl: number;
  crest_cap: number;
  name: string;
  is_current: boolean;
}

export interface SeasonResponse {
  guild_id: number;
  region: string;
  current_week: number;
  current_target_ilvl: number;
  current_crest_cap: number;
  weeks: SeasonWeek[];
}

// ─── Tasks (from GET /guilds/{gid}/characters/{cid}/tasks) ───

export interface TaskItem {
  id: string;
  label: string;
  done: boolean;
  completed_at: string | null;
}

export interface TasksResponse {
  character_id: number;
  character_name: string;
  current_week: number;
  week_name: string;
  weekly: TaskItem[];
  daily: TaskItem[];
}

// ─── Task Summary (from GET /guilds/{gid}/characters/{cid}/tasks/summary) ───

export interface TaskWeekSummary {
  completed: number;
  total: number;
  all_done: boolean;
}

export interface TasksSummaryResponse {
  character_id: number;
  current_week: number;
  weeks: Record<string, TaskWeekSummary>;
}

// ─── Great Vault (from GET /guilds/{gid}/characters/{cid}/vault) ───

export interface VaultSlot {
  unlocked: boolean;
  ilvl: number;
  difficulty?: string | null;
  key_level?: number;
  source?: string;
}

export interface VaultCalculatedSlots {
  raid_slots: VaultSlot[];
  dungeon_slots: VaultSlot[];
  world_slots: VaultSlot[];
}

export interface VaultProgress {
  character_id: number;
  week_number: number;
  raid_lfr: number;
  raid_normal: number;
  raid_heroic: number;
  raid_mythic: number;
  m_plus_runs: number[];
  highest_delve: number;
  world_vault: unknown;
}

export interface VaultResponse {
  character_id: number;
  character_name: string;
  current_week: number;
  progress: VaultProgress;
  calculated_slots: VaultCalculatedSlots;
}

// ─── Crests (from GET /guilds/{gid}/characters/{cid}/crests) ───

export interface CrestWeekEntry {
  crest_type: string;
  week_number: number;
  collected: number;
}

export interface CrestTypeData {
  current_week: CrestWeekEntry;
  history: CrestWeekEntry[];
  total_collected: number;
}

export interface CrestsResponse {
  character_id: number;
  character_name: string;
  current_week: number;
  crest_cap: number;
  crests: Record<string, CrestTypeData>;
}

// ─── Gear (from GET /guilds/{gid}/characters/{cid}/gear) ───

export interface GearSlotData {
  slot: string;
  ilvl: number;
  item_name: string;
  item_id: number | null;
  track: string | null;
  quality: string | null;
  sockets: number | null;
  enchanted: boolean | null;
  icon_url: string | null;
}

export type ParsedGear = Record<string, GearSlotData>;

export interface GearResponse {
  character_id: number;
  character_name: string;
  realm: string;
  parsed_gear: ParsedGear;
  avg_ilvl: number;
  current_ilvl: number | null;
  character_stats: Record<string, unknown> | null;
  last_gear_sync: string | null;
}

// ─── BiS (from GET /guilds/{gid}/characters/{cid}/bis) ───

export interface BisItem {
  id: number;
  character_id: number;
  slot: string;
  item_name: string;
  item_id: number | null;
  target_ilvl: number | null;
  obtained: boolean;
  synced: boolean;
}

export interface BisResponse {
  character_id: number;
  character_name: string;
  items: BisItem[];
  total: number;
  obtained: number;
}

// ─── Professions (from GET /guilds/{gid}/characters/{cid}/professions) ───

export interface ProfessionAssignment {
  id: number;
  character_id: number;
  profession_name: string;
  slot_index: number;
}

export interface ProfessionWeeklyProgress {
  id: number;
  character_id: number;
  profession_name: string;
  week_number: number;
  weekly_quest: boolean;
  patron_orders: boolean;
  treatise: boolean;
  knowledge_points: number;
  concentration: number;
}

export interface ProfessionEntry {
  profession: ProfessionAssignment;
  weekly_progress: ProfessionWeeklyProgress | null;
}

export interface ProfessionsResponse {
  character_id: number;
  character_name: string;
  current_week: number;
  professions: ProfessionEntry[];
}

// ─── Talents (from GET /guilds/{gid}/characters/{cid}/talents) ───

export interface TalentBuild {
  id: number;
  character_id: number;
  category: string;
  name: string;
  talent_string: string;
}

export interface TalentsResponse {
  character_id: number;
  character_name: string;
  builds: TalentBuild[];
  total: number;
}

// ─── Gear slot order for equipment grid ───

export const GEAR_SLOT_ORDER = [
  'head', 'neck', 'shoulder', 'back',
  'chest', 'wrist', 'hands', 'waist',
  'legs', 'feet', 'ring1', 'ring2',
  'trinket1', 'trinket2', 'main_hand', 'off_hand',
] as const;

export const GEAR_SLOT_LABELS: Record<string, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder: 'Shoulder',
  back: 'Back',
  chest: 'Chest',
  wrist: 'Wrist',
  hands: 'Hands',
  waist: 'Waist',
  legs: 'Legs',
  feet: 'Feet',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  trinket1: 'Trinket 1',
  trinket2: 'Trinket 2',
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
};

// ─── Available professions list ───

export const AVAILABLE_PROFESSIONS = [
  'Alchemy', 'Blacksmithing', 'Enchanting', 'Engineering',
  'Herbalism', 'Inscription', 'Jewelcrafting', 'Leatherworking',
  'Mining', 'Skinning', 'Tailoring', 'Cooking', 'Fishing',
] as const;

export const TALENT_CATEGORIES = ['Raid', 'M+', 'PvP'] as const;

export const BIS_SLOTS = [
  'Head', 'Neck', 'Shoulder', 'Back', 'Chest', 'Wrist',
  'Hands', 'Waist', 'Legs', 'Feet', 'Ring 1', 'Ring 2',
  'Trinket 1', 'Trinket 2', 'Main Hand', 'Off Hand',
] as const;
