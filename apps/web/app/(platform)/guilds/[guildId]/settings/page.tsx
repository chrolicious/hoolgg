'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Icon,
  Input,
  InputWithLabel,
  Toggle,
  Select,
  Badge,
  Modal,
  StatCard,
} from '@hool/design-system';
import { useGuild } from '../../../../lib/guild-context';
import { api, ApiError } from '../../../../lib/api';
import { ErrorMessage } from '../../../../components/error-message';
import { PageSkeleton, TableSkeleton } from '../../../../components/loading-skeleton';
import type { GuildPermission } from '../../../../lib/types';

// ── Constants ────────────────────────────────────────────────

const RANK_OPTIONS = [
  { value: '0', label: 'Guild Master (Rank 0)' },
  { value: '1', label: 'Officers+ (Rank 1)' },
  { value: '2', label: 'Members (Rank 2)' },
  { value: '3', label: 'Rank 3' },
  { value: '4', label: 'Rank 4' },
  { value: '5', label: 'Rank 5' },
  { value: '6', label: 'Rank 6' },
  { value: '7', label: 'Rank 7' },
  { value: '8', label: 'Rank 8' },
  { value: '9', label: 'Everyone (Rank 9)' },
];

const TOOL_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  progress: {
    label: 'Character Progress',
    description: 'Track gear, iLvl targets, and raid readiness for guild members.',
    icon: 'zap',
  },
  recruitment: {
    label: 'Recruitment',
    description: 'Find, evaluate, and organize recruitment candidates.',
    icon: 'search',
  },
};

type TabKey = 'general' | 'tools' | 'members' | 'permissions';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: 'settings' },
  { key: 'tools', label: 'Tools', icon: 'zap' },
  { key: 'members', label: 'Members', icon: 'user' },
  { key: 'permissions', label: 'Permissions', icon: 'shield' },
];

// ── Helper: Rank Display Name ────────────────────────────────

function getRankDisplayName(rankId: number): string {
  if (rankId === 0) return 'Guild Master';
  if (rankId === 1) return 'Officer';
  return `Rank ${rankId}`;
}

// ── Helper: Format Date ──────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

// ── Tab Button Component ─────────────────────────────────────

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1rem',
        borderRadius: 8,
        border: active ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
        background: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        outline: 'none',
        flexShrink: 0,
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
        }
      }}
    >
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </button>
  );
}

// ── General Tab ──────────────────────────────────────────────

function GeneralTab({
  guildName,
  realm,
  memberCount,
  createdAt,
  guildId,
  onRefetch,
}: {
  guildName: string;
  realm: string;
  memberCount: number;
  createdAt: string;
  guildId: string;
  onRefetch: () => Promise<void>;
}) {
  const [editName, setEditName] = useState(guildName);
  const [editRealm, setEditRealm] = useState(realm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasChanges = editName !== guildName || editRealm !== realm;

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveError(null);

    try {
      const body: Record<string, string> = {};
      if (editName !== guildName) body.name = editName.trim();
      if (editRealm !== realm) body.realm = editRealm.trim();

      await api.put(`/guilds/${guildId}/settings`, body);
      setSaveStatus('success');
      await onRefetch();

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      if (err instanceof ApiError) {
        setSaveError(err.message);
      } else {
        setSaveError('Failed to save settings.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Guild Info Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          label="Members"
          value={memberCount}
          icon={<Icon name="user" size={20} style={{ color: '#8b5cf6' }} />}
        />
        <StatCard
          label="Created"
          value={formatDate(createdAt)}
          icon={<Icon name="calendar" size={20} style={{ color: '#8b5cf6' }} />}
        />
      </div>

        {/* Edit Guild Details */}
        <Card padding="lg" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 0.25rem',
                }}
              >
                Guild Details
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                }}
              >
                Update your guild name and realm.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              <InputWithLabel
                label="Guild Name"
                placeholder="Enter guild name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <InputWithLabel
                label="Realm"
                placeholder="e.g. Illidan, Stormrage"
                value={editRealm}
                onChange={(e) => setEditRealm(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                loading={isSaving}
                disabled={!hasChanges || !editName.trim() || !editRealm.trim()}
                icon={<Icon name="check" size={16} />}
              >
                Save Changes
              </Button>

              {saveStatus === 'success' && (
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Icon name="check" size={14} />
                  Settings saved
                </span>
              )}

              {saveStatus === 'error' && saveError && (
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Icon name="alert-circle" size={14} />
                  {saveError}
                </span>
              )}
            </div>
          </div>
        </Card>
    </div>
  );
}

// ── Tools Tab ────────────────────────────────────────────────

function ToolsTab({
  permissions,
  guildId,
  onRefetch,
}: {
  permissions: GuildPermission[];
  guildId: string;
  onRefetch: () => Promise<void>;
}) {
  const [localPerms, setLocalPerms] = useState<Record<string, { enabled: boolean; min_rank_id: number }>>(() => {
    const map: Record<string, { enabled: boolean; min_rank_id: number }> = {};
    for (const p of permissions) {
      map[p.tool_name] = { enabled: p.enabled, min_rank_id: p.min_rank_id };
    }
    return map;
  });
  const [savingTool, setSavingTool] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [toolErrors, setToolErrors] = useState<Record<string, string>>({});

  const toolNames = useMemo(() => {
    const names = permissions.map((p) => p.tool_name);
    // Add any known tools that may not yet exist in permissions
    for (const key of Object.keys(TOOL_LABELS)) {
      if (!names.includes(key)) names.push(key);
    }
    return names;
  }, [permissions]);

  const handleToggle = (toolName: string, enabled: boolean) => {
    setLocalPerms((prev) => ({
      ...prev,
      [toolName]: { ...prev[toolName], enabled },
    }));
  };

  const handleRankChange = (toolName: string, rankId: string) => {
    setLocalPerms((prev) => ({
      ...prev,
      [toolName]: { ...prev[toolName], min_rank_id: parseInt(rankId, 10) },
    }));
  };

  const handleSaveTool = async (toolName: string) => {
    const local = localPerms[toolName];
    if (!local) return;

    setSavingTool(toolName);
    setToolStatus((prev) => ({ ...prev, [toolName]: 'idle' }));
    setToolErrors((prev) => ({ ...prev, [toolName]: '' }));

    try {
      await api.put(`/guilds/${guildId}/permissions`, {
        tool_name: toolName,
        min_rank_id: local.min_rank_id,
        enabled: local.enabled,
      });

      setToolStatus((prev) => ({ ...prev, [toolName]: 'success' }));
      await onRefetch();
      setTimeout(() => {
        setToolStatus((prev) => ({ ...prev, [toolName]: 'idle' }));
      }, 3000);
    } catch (err) {
      setToolStatus((prev) => ({ ...prev, [toolName]: 'error' }));
      if (err instanceof ApiError) {
        setToolErrors((prev) => ({ ...prev, [toolName]: err.message }));
      } else {
        setToolErrors((prev) => ({ ...prev, [toolName]: 'Failed to update.' }));
      }
    } finally {
      setSavingTool(null);
    }
  };

  const hasToolChanged = (toolName: string) => {
    const original = permissions.find((p) => p.tool_name === toolName);
    const local = localPerms[toolName];
    if (!original || !local) return true;
    return original.enabled !== local.enabled || original.min_rank_id !== local.min_rank_id;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 0.25rem',
          }}
        >
          Tool Configuration
        </h3>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}
        >
          Enable or disable tools and set the minimum rank required to access each one.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {toolNames.map((toolName) => {
              const info = TOOL_LABELS[toolName] || {
                label: toolName,
                description: `Configure the ${toolName} tool.`,
                icon: 'zap',
              };
              const local = localPerms[toolName] || { enabled: false, min_rank_id: 9 };
              const status = toolStatus[toolName] || 'idle';
              const error = toolErrors[toolName];

              return (
                <Card key={toolName} padding="lg" variant="elevated">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 200 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: local.enabled ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <Icon
                            name={info.icon}
                            size={20}
                            style={{ color: local.enabled ? '#8b5cf6' : 'rgba(255, 255, 255, 0.3)' }}
                          />
                        </div>
                        <div>
                          <h4
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              margin: 0,
                            }}
                          >
                            {info.label}
                          </h4>
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'rgba(255, 255, 255, 0.5)',
                              margin: '0.25rem 0 0',
                              lineHeight: 1.5,
                            }}
                          >
                            {info.description}
                          </p>
                        </div>
                      </div>

                      <Toggle
                        checked={local.enabled}
                        onChange={(checked) => handleToggle(toolName, checked)}
                        label={local.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </div>

                    {local.enabled && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'rgba(255, 255, 255, 0.6)',
                              marginBottom: '0.375rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Minimum Rank
                          </label>
                          <Select
                            options={RANK_OPTIONS}
                            value={String(local.min_rank_id)}
                            onChange={(value) => handleRankChange(toolName, value)}
                            size="md"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveTool(toolName)}
                            loading={savingTool === toolName}
                            disabled={!hasToolChanged(toolName)}
                          >
                            Save
                          </Button>

                          {status === 'success' && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Icon name="check" size={12} />
                              Saved
                            </span>
                          )}

                          {status === 'error' && error && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#ef4444',
                              }}
                            >
                              {error}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
      </div>
    </div>
  );
}

// ── Members Tab ──────────────────────────────────────────────

function MembersTab() {
  const { members, memberCount } = useGuild();
  const [sortField, setSortField] = useState<'rank' | 'name' | 'sync'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedMembers = useMemo(() => {
    const sorted = [...members];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'rank':
          cmp = a.rank_id - b.rank_id;
          break;
        case 'name':
          cmp = a.character_name.localeCompare(b.character_name);
          break;
        case 'sync':
          cmp = new Date(b.last_sync).getTime() - new Date(a.last_sync).getTime();
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [members, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) {
      return <Icon name="chevron-down" size={12} style={{ opacity: 0.3 }} />;
    }
    return (
      <Icon
        name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
        size={12}
        style={{ color: '#8b5cf6' }}
      />
    );
  };

  const ColumnHeader = ({
    label,
    field,
    style: extraStyle,
  }: {
    label: string;
    field: typeof sortField;
    style?: React.CSSProperties;
  }) => (
    <button
      onClick={() => handleSort(field)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        cursor: 'pointer',
        padding: 0,
        ...extraStyle,
      }}
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 0.25rem',
            }}
          >
            Guild Roster
          </h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
            }}
          >
            {memberCount} member{memberCount !== 1 ? 's' : ''} in this guild
          </p>
        </div>
        <Badge variant="secondary" size="sm">
          {memberCount} total
        </Badge>
      </div>

        <Card variant="elevated">
          <div style={{ overflowX: 'auto' }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
                gap: '1rem',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                minWidth: 500,
              }}
            >
              <ColumnHeader label="Character" field="name" />
              <ColumnHeader label="Rank" field="rank" />
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Rank Name
              </div>
              <ColumnHeader label="Last Sync" field="sync" />
            </div>

            {/* Table rows */}
            {sortedMembers.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '0.875rem',
                }}
              >
                No members found
              </div>
            ) : (
              sortedMembers.map((member, idx) => (
                <div
                  key={`${member.character_name}-${member.bnet_id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
                    gap: '1rem',
                    padding: '0.625rem 1.25rem',
                    borderBottom:
                      idx < sortedMembers.length - 1
                        ? '1px solid rgba(255, 255, 255, 0.04)'
                        : 'none',
                    transition: 'background 0.1s ease',
                    minWidth: 500,
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background:
                          member.rank_id === 0
                            ? 'rgba(212, 160, 23, 0.15)'
                            : member.rank_id === 1
                              ? 'rgba(139, 92, 246, 0.15)'
                              : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        name={member.rank_id === 0 ? 'crown' : member.rank_id === 1 ? 'shield' : 'user'}
                        size={14}
                        style={{
                          color:
                            member.rank_id === 0
                              ? '#d4a017'
                              : member.rank_id === 1
                                ? '#8b5cf6'
                                : 'rgba(255, 255, 255, 0.4)',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.character_name}
                    </span>
                  </div>

                  <div>
                    <Badge
                      variant={
                        member.rank_id === 0
                          ? 'primary'
                          : member.rank_id === 1
                            ? 'secondary'
                            : 'secondary'
                      }
                      size="sm"
                    >
                      {member.rank_id}
                    </Badge>
                  </div>

                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.rank_name || getRankDisplayName(member.rank_id)}
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {formatRelativeDate(member.last_sync)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
    </div>
  );
}

// ── Permissions Tab ──────────────────────────────────────────

function PermissionsTab({ permissions }: { permissions: GuildPermission[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 0.25rem',
          }}
        >
          Permission Summary
        </h3>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}
        >
          Overview of who can access each tool in your guild.
        </p>
      </div>

      {/* Permissions matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {permissions.map((perm) => {
              const info = TOOL_LABELS[perm.tool_name] || {
                label: perm.tool_name,
                description: '',
                icon: 'zap',
              };

              // Build rank access list
              const accessRanks: string[] = [];
              if (perm.enabled) {
                for (let i = 0; i <= perm.min_rank_id; i++) {
                  accessRanks.push(getRankDisplayName(i));
                }
              }

              return (
                <Card key={perm.tool_name} padding="lg" variant="elevated">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon
                          name={info.icon}
                          size={20}
                          style={{
                            color: perm.enabled ? '#8b5cf6' : 'rgba(255, 255, 255, 0.3)',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}
                        >
                          {info.label}
                        </span>
                      </div>

                      <Badge
                        variant={perm.enabled ? 'primary' : 'secondary'}
                        size="sm"
                      >
                        {perm.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>

                    {perm.enabled ? (
                      <div>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: '0 0 0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600,
                          }}
                        >
                          Accessible by
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {accessRanks.map((rank) => (
                            <Badge key={rank} variant="secondary" size="sm">
                              {rank}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'rgba(255, 255, 255, 0.4)',
                          margin: 0,
                          fontStyle: 'italic',
                        }}
                      >
                        This tool is currently disabled. Enable it in the Tools tab.
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
      </div>

      {/* Activity log placeholder */}
      <Card padding="lg" variant="elevated">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            padding: '1.5rem 0',
          }}
        >
          <Icon name="clock" size={32} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
            }}
          >
            Activity Log
          </h4>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.4)',
              margin: 0,
              maxWidth: 300,
            }}
          >
            Permission change history and audit log coming in a future update.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Danger Zone ──────────────────────────────────────────────

function DangerZone({
  guildName,
  guildId,
}: {
  guildName: string;
  guildId: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canConfirm = confirmText === guildName;

  const handleDeactivate = async () => {
    if (!canConfirm) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.delete(`/guilds/${guildId}`);
      router.push('/guilds');
    } catch (err) {
      setIsDeleting(false);
      if (err instanceof ApiError) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to deactivate guild.');
      }
    }
  };

  return (
    <>
      <div
        style={{
          borderRadius: 12,
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.04)',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ef4444',
                margin: '0 0 0.375rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon name="alert-triangle" size={18} />
              Danger Zone
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: '0 0 0.25rem',
              }}
            >
              Deactivate this guild instance. This action can be reversed by contacting support.
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.3)',
                margin: 0,
              }}
            >
              All tools, permissions, and data will become inaccessible.
            </p>
          </div>

          <Button
            variant="destructive"
            size="md"
            onClick={() => setIsModalOpen(true)}
            icon={<Icon name="trash" size={16} />}
          >
            Deactivate Guild
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setConfirmText('');
          setDeleteError(null);
        }}
        title="Deactivate Guild"
        subtitle="This action will soft-delete your guild instance"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsModalOpen(false);
                setConfirmText('');
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={handleDeactivate}
              loading={isDeleting}
              disabled={!canConfirm}
            >
              Deactivate Guild
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              This will deactivate <strong style={{ color: '#ffffff' }}>{guildName}</strong> and make all
              associated tools, permissions, and data inaccessible. Members will lose access immediately.
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.5rem',
              }}
            >
              Type <strong style={{ color: '#ffffff' }}>{guildName}</strong> to confirm:
            </label>
            <Input
              placeholder={guildName}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          {deleteError && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '0.8125rem',
                margin: 0,
              }}
            >
              {deleteError}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

// ── Main Settings Page ───────────────────────────────────────

export default function SettingsPage() {
  const { guild, isGM, isLoading, error, guildId, permissions, memberCount, refetch } = useGuild();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const handleRefetch = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        title="Failed to Load Settings"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // GM-only gate
  if (!isGM) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          padding: '2rem',
        }}
      >
          <Card padding="lg" variant="elevated">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                maxWidth: 360,
              }}
            >
              <Icon
                name="shield"
                size={48}
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Guild Master Only
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                }}
              >
                Guild settings can only be managed by the Guild Master (rank 0).
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/guilds/${guildId}`)}
                icon={<Icon name="home" size={16} />}
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Guild Settings
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: '0.25rem 0 0',
          }}
        >
          Manage {guild?.name} configuration, tools, and members.
        </p>
      </div>

      {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: '0.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: 300 }}>
        {activeTab === 'general' && guild && (
          <GeneralTab
            guildName={guild.name}
            realm={guild.realm}
            memberCount={memberCount}
            createdAt={guild.created_at}
            guildId={guildId}
            onRefetch={handleRefetch}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsTab
            permissions={permissions}
            guildId={guildId}
            onRefetch={handleRefetch}
          />
        )}

        {activeTab === 'members' && <MembersTab />}

        {activeTab === 'permissions' && (
          <PermissionsTab permissions={permissions} />
        )}
      </div>

      {/* Danger Zone — always visible at bottom */}
      <div style={{ marginTop: '1rem' }}>
        <DangerZone
          guildName={guild?.name || ''}
          guildId={guildId}
        />
      </div>
    </div>
  );
}
