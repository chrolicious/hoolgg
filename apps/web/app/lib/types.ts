// Core types for hool.gg platform

// ── Auth & Users ──────────────────────────────────────────────

export interface User {
  bnet_id: number;
  username: string;
}

// ── Guilds ────────────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  realm: string;
  gm_bnet_id: number;
  created_at: string;
  deleted_at: string | null;
}

export interface GuildMember {
  character_name: string;
  guild_id: string;
  bnet_id: number;
  rank_id: number;
  rank_name: string;
  last_sync: string;
}

// ── Permissions ───────────────────────────────────────────────

export interface GuildPermission {
  guild_id: string;
  tool_name: string;
  min_rank_id: number;
  enabled: boolean;
}

export interface PermissionCheck {
  allowed: boolean;
  rank_id: number;
  reason: string;
}

// ── Progress API ──────────────────────────────────────────────

export interface CharacterProgress {
  character_name: string;
  guild_id: string;
  current_ilvl: number;
  gear_details: Record<string, unknown>;
  class_name?: string;
  spec_name?: string;
  last_updated?: string;
}

export interface WeeklyTarget {
  expansion_id: number;
  week: number;
  ilvl_target: number;
}

export interface GuildMessage {
  guild_id: string;
  gm_message: string;
  created_at: string;
}

// ── Recruitment API ───────────────────────────────────────────

export interface RecruitmentCandidate {
  id: string;
  guild_id: string;
  candidate_name: string;
  class_name: string;
  role: string;
  ilvl: number;
  source: string;
  notes: string;
  rating: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentCategory {
  id: string;
  guild_id: string;
  category_name: string;
  custom: boolean;
}

export interface RecruitmentHistory {
  id: string;
  guild_id: string;
  candidate_name: string;
  contacted_date: string;
  method: string;
  response: string;
}

// ── API Responses ─────────────────────────────────────────────

export interface GuildListResponse {
  guilds: Guild[];
}

export interface GuildMembersResponse {
  members: GuildMember[];
}

export interface GuildPermissionsResponse {
  permissions: GuildPermission[];
}

export interface GuildSettingsResponse {
  guild: Guild;
  permissions: GuildPermission[];
  member_count: number;
}
