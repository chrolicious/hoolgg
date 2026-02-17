'use client';

import React, { useState, useCallback } from 'react';
import { Card, Button, Icon, Input, Select, Checkbox, Badge } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { recruitmentApi } from '../../../../../lib/api';
import { useGuild } from '../../../../../lib/guild-context';
import { ErrorMessage } from '../../../../../components/error-message';
import { ListSkeleton } from '../../../../../components/loading-skeleton';
import { getClassVariant, getRoleIcon } from './candidate-card';

interface SearchResult {
  candidate_name: string;
  realm?: string;
  character_class?: string;
  role?: string;
  ilvl?: number;
  raider_io_score?: number;
  source?: string;
  [key: string]: unknown;
}

interface SearchResponse {
  results: SearchResult[];
  count: number;
}

const CLASS_OPTIONS = [
  { value: '', label: 'Any Class' },
  { value: 'Warrior', label: 'Warrior' },
  { value: 'Paladin', label: 'Paladin' },
  { value: 'Hunter', label: 'Hunter' },
  { value: 'Rogue', label: 'Rogue' },
  { value: 'Priest', label: 'Priest' },
  { value: 'Shaman', label: 'Shaman' },
  { value: 'Mage', label: 'Mage' },
  { value: 'Warlock', label: 'Warlock' },
  { value: 'Druid', label: 'Druid' },
  { value: 'Death Knight', label: 'Death Knight' },
  { value: 'Demon Hunter', label: 'Demon Hunter' },
  { value: 'Evoker', label: 'Evoker' },
  { value: 'Monk', label: 'Monk' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Any Role' },
  { value: 'Tank', label: 'Tank' },
  { value: 'Healer', label: 'Healer' },
  { value: 'Melee DPS', label: 'Melee DPS' },
  { value: 'Ranged DPS', label: 'Ranged DPS' },
];

interface CandidateSearchProps {
  onCandidateAdded: () => void;
}

export function CandidateSearch({ onCandidateAdded }: CandidateSearchProps) {
  const { guildId } = useGuild();

  // Search form state
  const [name, setName] = useState('');
  const [realm, setRealm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [minIlvl, setMinIlvl] = useState('');
  const [minMythicScore, setMinMythicScore] = useState('');
  const [sources, setSources] = useState<string[]>(['raider_io']);

  // Results state
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const toggleSource = (source: string) => {
    setSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const body: Record<string, unknown> = {};
      if (name.trim()) body.name = name.trim();
      if (realm.trim()) body.realm = realm.trim();
      if (selectedRole) body.role = selectedRole;
      if (selectedClass) body.class = selectedClass;
      if (minIlvl) body.min_ilvl = parseInt(minIlvl, 10);
      if (minMythicScore) body.min_mythic_score = parseInt(minMythicScore, 10);
      if (sources.length > 0) body.sources = sources;

      const data = await recruitmentApi.post<SearchResponse>(
        `/guilds/${guildId}/recruitment/search`,
        body
      );
      setResults(data.results || []);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [guildId, name, realm, selectedRole, selectedClass, minIlvl, minMythicScore, sources]);

  const handleAddCandidate = useCallback(
    async (result: SearchResult) => {
      const key = `${result.candidate_name}-${result.realm || ''}`;
      setAddingIds((prev) => new Set(prev).add(key));

      try {
        await recruitmentApi.post(
          `/guilds/${guildId}/recruitment/candidates`,
          {
            candidate_name: result.candidate_name,
            realm: result.realm,
            character_class: result.character_class,
            role: result.role,
            ilvl: result.ilvl,
            source: result.source,
          }
        );
        onCandidateAdded();
      } catch (err: any) {
        // Handle error silently or show inline
      } finally {
        setAddingIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [guildId, onCandidateAdded]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search Form */}
      <FadeIn duration={0.4}>
        <Card padding="lg" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon name="search" size={18} style={{ color: '#8b5cf6' }} />
              Search External Sources
            </h3>

            {/* Name and Realm row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Character Name
                </label>
                <Input
                  variant="default"
                  size="sm"
                  placeholder="Enter name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Realm
                </label>
                <Input
                  variant="default"
                  size="sm"
                  placeholder="Enter realm..."
                  value={realm}
                  onChange={(e) => setRealm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Filters row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Class
                </label>
                <Select
                  options={CLASS_OPTIONS}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  size="sm"
                  variant="secondary"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Role
                </label>
                <Select
                  options={ROLE_OPTIONS}
                  value={selectedRole}
                  onChange={setSelectedRole}
                  size="sm"
                  variant="secondary"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Min iLvl
                </label>
                <Input
                  variant="default"
                  size="sm"
                  placeholder="e.g. 600"
                  type="number"
                  value={minIlvl}
                  onChange={(e) => setMinIlvl(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  Min M+ Score
                </label>
                <Input
                  variant="default"
                  size="sm"
                  placeholder="e.g. 2500"
                  type="number"
                  value={minMythicScore}
                  onChange={(e) => setMinMythicScore(e.target.value)}
                />
              </div>
            </div>

            {/* Sources + Search button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Sources:
                </span>
                <Checkbox
                  checked={sources.includes('raider_io')}
                  onChange={() => toggleSource('raider_io')}
                  label="Raider.IO"
                  size="sm"
                  variant="purple"
                />
                <Checkbox
                  checked={sources.includes('wow_progress')}
                  onChange={() => toggleSource('wow_progress')}
                  label="WoW Progress"
                  size="sm"
                  variant="warning"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSearch}
                icon={<Icon name="search" size={16} />}
              >
                Search
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* Results */}
      {isSearching && (
        <FadeIn duration={0.3}>
          <ListSkeleton items={5} />
        </FadeIn>
      )}

      {searchError && (
        <ErrorMessage
          message={searchError}
          onRetry={handleSearch}
        />
      )}

      {!isSearching && !searchError && hasSearched && results.length === 0 && (
        <FadeIn duration={0.3}>
          <Card padding="lg" variant="default">
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
              <Icon name="search" size={36} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                }}
              >
                No results found. Try adjusting your search criteria.
              </p>
            </div>
          </Card>
        </FadeIn>
      )}

      {!isSearching && results.length > 0 && (
        <FadeIn duration={0.4}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                }}
              >
                {results.length} Result{results.length !== 1 ? 's' : ''} Found
              </h3>
            </div>
            <StaggerGroup staggerDelay={0.05}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {results.map((result, index) => {
                  const key = `${result.candidate_name}-${result.realm || ''}-${index}`;
                  const addKey = `${result.candidate_name}-${result.realm || ''}`;
                  const isAdding = addingIds.has(addKey);
                  const classVariant = getClassVariant(
                    result.character_class || ''
                  );

                  return (
                    <Card key={key} padding="sm" variant="default">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.25rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: '#ffffff',
                              }}
                            >
                              {result.candidate_name}
                            </span>
                            {result.realm && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.4)',
                                }}
                              >
                                {result.realm}
                              </span>
                            )}
                            {result.character_class && (
                              <Badge
                                variant={classVariant as any}
                                size="sm"
                              >
                                {result.character_class}
                              </Badge>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.5)',
                            }}
                          >
                            {result.role && (
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <Icon
                                  name={getRoleIcon(result.role)}
                                  size={12}
                                />
                                {result.role}
                              </span>
                            )}
                            {result.ilvl != null && result.ilvl > 0 && (
                              <span>iLvl {result.ilvl}</span>
                            )}
                            {result.raider_io_score != null &&
                              result.raider_io_score > 0 && (
                                <span>
                                  M+ {result.raider_io_score}
                                </span>
                              )}
                            {result.source && (
                              <span
                                style={{
                                  color: 'rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                {result.source}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddCandidate(result)}
                          icon={<Icon name="plus" size={14} />}
                          disabled={isAdding}
                        >
                          {isAdding ? 'Adding...' : 'Add'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </StaggerGroup>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
