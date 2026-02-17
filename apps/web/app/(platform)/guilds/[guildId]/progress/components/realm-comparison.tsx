'use client';

import React, { useState, useCallback } from 'react';
import { Card, Icon, Input, Button, Select } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { motion } from 'framer-motion';
import { progressApi } from '../../../../../lib/api';

interface ComparisonGuild {
  guild_name: string;
  realm: string;
  region: string;
  avg_ilvl?: number;
  best_performance?: string;
  world_rank?: number;
  region_rank?: number;
  realm_rank?: number;
  logs_count?: number;
}

interface ComparisonData {
  your_guild?: ComparisonGuild;
  compared_guilds?: ComparisonGuild[];
  realm_average?: number;
  your_rank?: number;
  total_guilds?: number;
}

interface RealmComparisonProps {
  guildId: string;
  guildName?: string;
  realm?: string;
}

const REGION_OPTIONS = [
  { value: 'us', label: 'US' },
  { value: 'eu', label: 'EU' },
  { value: 'kr', label: 'KR' },
  { value: 'tw', label: 'TW' },
];

export function RealmComparison({ guildId, guildName, realm }: RealmComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchGuild, setSearchGuild] = useState(guildName || '');
  const [searchRealm, setSearchRealm] = useState(realm || '');
  const [region, setRegion] = useState('us');

  const fetchComparison = useCallback(async () => {
    if (!searchGuild || !searchRealm) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await progressApi.get<ComparisonData>(
        `/guilds/${guildId}/progress/comparisons`,
        {
          params: {
            guild_name: searchGuild,
            realm: searchRealm,
            region,
          },
        }
      );
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
    } finally {
      setIsLoading(false);
    }
  }, [guildId, searchGuild, searchRealm, region]);

  return (
    <FadeIn duration={0.4}>
      <Card padding="md" variant="elevated">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="chart" size={20} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              WarcraftLogs Comparison
            </h3>
          </div>

          {/* Search controls */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '0.25rem',
              }}>
                Guild Name
              </label>
              <Input
                variant="default"
                size="sm"
                placeholder="Guild name"
                value={searchGuild}
                onChange={(e) => setSearchGuild(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '0.25rem',
              }}>
                Realm
              </label>
              <Input
                variant="default"
                size="sm"
                placeholder="Realm"
                value={searchRealm}
                onChange={(e) => setSearchRealm(e.target.value)}
              />
            </div>
            <div style={{ minWidth: 80 }}>
              <Select
                options={REGION_OPTIONS}
                value={region}
                onChange={setRegion}
                size="sm"
                label="Region"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={fetchComparison}
              loading={isLoading}
              icon={<Icon name="search" size={14} />}
            >
              Compare
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Icon name="alert-circle" size={16} style={{ color: '#ef4444' }} />
              <p style={{ fontSize: '0.8125rem', color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Results */}
          {comparisonData && (
            <StaggerGroup staggerDelay={0.05}>
              {/* Your guild */}
              {comparisonData.your_guild && (
                <ComparisonRow
                  guild={comparisonData.your_guild}
                  isYourGuild
                  realmAverage={comparisonData.realm_average}
                />
              )}

              {/* Realm stats */}
              {comparisonData.realm_average && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  <span>Realm Average iLvl</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                    {comparisonData.realm_average.toFixed(1)}
                  </span>
                </div>
              )}

              {comparisonData.your_rank && comparisonData.total_guilds && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.02)',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}>
                  <span>Your Realm Rank</span>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>
                    #{comparisonData.your_rank} of {comparisonData.total_guilds}
                  </span>
                </div>
              )}

              {/* Compared guilds */}
              {comparisonData.compared_guilds?.map((guild, idx) => (
                <ComparisonRow
                  key={`${guild.guild_name}-${idx}`}
                  guild={guild}
                  realmAverage={comparisonData.realm_average}
                />
              ))}
            </StaggerGroup>
          )}

          {/* Empty state */}
          {!comparisonData && !isLoading && !error && (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.4)',
                margin: 0,
              }}>
                Enter a guild name and realm to compare WarcraftLogs performance data.
              </p>
            </div>
          )}
        </div>
      </Card>
    </FadeIn>
  );
}

function ComparisonRow({
  guild,
  isYourGuild = false,
  realmAverage,
}: {
  guild: ComparisonGuild;
  isYourGuild?: boolean;
  realmAverage?: number;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: 8,
      background: isYourGuild ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255, 255, 255, 0.02)',
      border: isYourGuild
        ? '1px solid rgba(139, 92, 246, 0.15)'
        : '1px solid rgba(255, 255, 255, 0.04)',
    }}>
      {/* Rank */}
      {guild.realm_rank !== undefined && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: isYourGuild ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: isYourGuild ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
          flexShrink: 0,
        }}>
          #{guild.realm_rank}
        </div>
      )}

      {/* Guild info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: isYourGuild ? '#a78bfa' : '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {guild.guild_name}
          </span>
          {isYourGuild && (
            <span style={{
              fontSize: '0.625rem',
              color: '#a78bfa',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}>
              You
            </span>
          )}
        </div>
        <span style={{
          fontSize: '0.6875rem',
          color: 'rgba(255, 255, 255, 0.35)',
        }}>
          {guild.realm}-{guild.region.toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
        {guild.avg_ilvl !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.35)' }}>
              Avg iLvl
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
              {guild.avg_ilvl.toFixed(1)}
            </div>
          </div>
        )}
        {guild.best_performance && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.35)' }}>
              Best
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
              {guild.best_performance}
            </div>
          </div>
        )}
        {guild.logs_count !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.35)' }}>
              Logs
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
              {guild.logs_count}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
