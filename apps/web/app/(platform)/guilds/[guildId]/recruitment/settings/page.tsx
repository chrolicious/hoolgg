'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon, Card, Input, StatCard } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../../../../../components/protected-route';
import { RoleGate } from '../../../../../components/role-gate';
import { ErrorMessage } from '../../../../../components/error-message';
import { ListSkeleton } from '../../../../../components/loading-skeleton';
import { useGuild } from '../../../../../lib/guild-context';
import { recruitmentApi } from '../../../../../lib/api';

interface RecruitmentCategory {
  id: string;
  guild_id: string;
  category_name: string;
  custom: boolean;
  display_order?: number;
}

interface CategoriesResponse {
  categories: RecruitmentCategory[];
}

interface CandidatesResponse {
  candidates: Array<{ id: string; status: string }>;
  count: number;
}

export default function RecruitmentSettingsPage() {
  return (
    <ProtectedRoute toolName="recruitment">
      <RoleGate
        minRank={0}
        fallback={
          <FadeIn duration={0.4}>
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
                    Recruitment settings can only be managed by the Guild Master.
                  </p>
                </div>
              </Card>
            </div>
          </FadeIn>
        }
      >
        <RecruitmentSettingsContent />
      </RoleGate>
    </ProtectedRoute>
  );
}

function RecruitmentSettingsContent() {
  const { guildId } = useGuild();
  const router = useRouter();

  const [categories, setCategories] = useState<RecruitmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateCounts, setCandidateCounts] = useState<Record<string, number>>({});

  // Add category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Deleting state
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruitmentApi.get<CategoriesResponse>(
        `/guilds/${guildId}/recruitment/categories`
      );
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, [guildId]);

  const fetchCandidateCounts = useCallback(async () => {
    try {
      const data = await recruitmentApi.get<CandidatesResponse>(
        `/guilds/${guildId}/recruitment/candidates`
      );
      const counts: Record<string, number> = {};
      (data.candidates || []).forEach((c) => {
        const status = c.status || 'unknown';
        counts[status] = (counts[status] || 0) + 1;
      });
      setCandidateCounts(counts);
    } catch {
      // Non-critical, silently fail
    }
  }, [guildId]);

  useEffect(() => {
    fetchCategories();
    fetchCandidateCounts();
  }, [fetchCategories, fetchCandidateCounts]);

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return;
    setIsAdding(true);
    setAddError(null);
    try {
      await recruitmentApi.post(
        `/guilds/${guildId}/recruitment/categories`,
        { category_name: newCategoryName.trim() }
      );
      setNewCategoryName('');
      await fetchCategories();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add category.');
    } finally {
      setIsAdding(false);
    }
  }, [guildId, newCategoryName, fetchCategories]);

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      if (!confirm('Are you sure you want to delete this category? Candidates in this category will be moved to the default category.')) {
        return;
      }
      setDeletingIds((prev) => new Set(prev).add(categoryId));
      try {
        await recruitmentApi.delete(
          `/guilds/${guildId}/recruitment/categories/${categoryId}`
        );
        await fetchCategories();
      } catch {
        // Silent fail
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(categoryId);
          return next;
        });
      }
    },
    [guildId, fetchCategories]
  );

  const totalCandidates = Object.values(candidateCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <FadeIn duration={0.5}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/guilds/${guildId}/recruitment`)}
            icon={<Icon name="arrow-left" size={16} />}
          />
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Recruitment Settings
            </h1>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: '0.25rem 0 0',
              }}
            >
              Manage recruitment pipeline categories
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerGroup staggerDelay={0.08}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <StatCard
            label="Total Categories"
            value={categories.length}
            icon={<Icon name="chart" size={20} style={{ color: '#8b5cf6' }} />}
          />
          <StatCard
            label="Custom Categories"
            value={categories.filter((c) => c.custom).length}
            icon={<Icon name="edit" size={20} style={{ color: '#f59e0b' }} />}
          />
          <StatCard
            label="Total Candidates"
            value={totalCandidates}
            icon={<Icon name="user" size={20} style={{ color: '#3b82f6' }} />}
          />
        </div>
      </StaggerGroup>

      {/* Category Management */}
      <FadeIn duration={0.4} delay={0.1}>
        <Card padding="lg" variant="elevated">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
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
                <Icon name="chart" size={18} style={{ color: '#8b5cf6' }} />
                Pipeline Categories
              </h2>
            </div>

            {/* Add new category form */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'block',
                    marginBottom: '0.375rem',
                  }}
                >
                  New Category Name
                </label>
                <Input
                  variant="default"
                  size="md"
                  placeholder="e.g. Waitlist, Backup..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddCategory}
                disabled={isAdding || !newCategoryName.trim()}
                icon={<Icon name="plus" size={16} />}
              >
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>

            {addError && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.8125rem',
                  color: '#ef4444',
                }}
              >
                {addError}
              </div>
            )}

            {/* Loading */}
            {isLoading && <ListSkeleton items={5} />}

            {/* Error */}
            {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

            {/* Category list */}
            {!isLoading && !error && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                {categories.length === 0 && (
                  <div
                    style={{
                      padding: '2rem 0',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.3)',
                      fontStyle: 'italic',
                    }}
                  >
                    No categories defined. Add some to get started.
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {categories.map((category) => {
                    const isDeleting = deletingIds.has(category.id);
                    const count = candidateCounts[category.category_name.toLowerCase()] || 0;

                    return (
                      <motion.div
                        key={category.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            transition: 'background 0.15s ease',
                            opacity: isDeleting ? 0.5 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: category.custom
                                  ? '#f59e0b'
                                  : '#8b5cf6',
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {category.category_name}
                              </span>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginTop: '0.125rem',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '0.6875rem',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                  }}
                                >
                                  {category.custom ? 'Custom' : 'Default'}
                                </span>
                                {count > 0 && (
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      color: 'rgba(255, 255, 255, 0.3)',
                                    }}
                                  >
                                    {count} candidate{count !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {category.custom && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={isDeleting}
                              icon={<Icon name="trash" size={14} />}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* Info box */}
      <FadeIn duration={0.4} delay={0.2}>
        <Card padding="md" variant="default">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Icon
              name="alert-circle"
              size={18}
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Default categories (New, Contacted, Interviewing, Trial, Accepted, Declined) cannot be deleted.
                Custom categories can be added to fit your guild's recruitment workflow.
                Deleting a custom category will move its candidates to the default category.
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
