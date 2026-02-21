'use client';

import { useState } from 'react';
import { Button, Icon, Select } from '@hool/design-system';
import { progressApi } from '../../../../lib/api';
import { SectionCard } from './section-card';
import type { TalentsResponse, TalentBuild } from '../types';
import { TALENT_CATEGORIES } from '../types';

interface TalentBuildsSectionProps {
  talentsData: TalentsResponse | null;
  characterId: number;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Raid: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  'M+': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  PvP: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
};

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
};

const categoryOptions = TALENT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
}));

export function TalentBuildsSection({
  talentsData,
  characterId,
}: TalentBuildsSectionProps) {
  const [builds, setBuilds] = useState<TalentBuild[]>(talentsData?.builds ?? []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [buildName, setBuildName] = useState('');
  const [talentString, setTalentString] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!selectedCategory || !buildName || !talentString) return;

    const newBuild = await progressApi.post<TalentBuild>(
      `/users/me/characters/${characterId}/talents`,
      {
        category: selectedCategory,
        name: buildName,
        talent_string: talentString,
      },
    );

    setBuilds((prev) => [...prev, newBuild]);
    setSelectedCategory('');
    setBuildName('');
    setTalentString('');
    setShowAddForm(false);
  };

  const handleDelete = async (buildId: number) => {
    await progressApi.delete(
      `/users/me/characters/${characterId}/talents/${buildId}`,
    );
    setBuilds((prev) => prev.filter((b) => b.id !== buildId));
  };

  const handleCopy = async (build: TalentBuild) => {
    await navigator.clipboard.writeText(build.talent_string);
    setCopiedId(build.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <SectionCard
      title="Talent Builds"
      rightContent={
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? 'Cancel' : 'Add Build'}
        </Button>
      }
    >
      {/* Add form */}
      {showAddForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '16px',
            padding: '14px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Category"
            size="sm"
          />

          <input
            type="text"
            placeholder="Build name"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Talent string"
            value={talentString}
            onChange={(e) => setTalentString(e.target.value)}
            rows={2}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={!selectedCategory || !buildName || !talentString}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {builds.length === 0 && !showAddForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 0',
            gap: '8px',
          }}
        >
          <Icon name="book-open" size={24} animation="none" style={{ opacity: 0.3 }} />
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}
          >
            No talent builds saved yet.
          </p>
        </div>
      )}

      {/* Build list */}
      {builds.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {builds.map((build) => {
            const colors = categoryColors[build.category] ?? {
              bg: 'rgba(255,255,255,0.1)',
              text: 'rgba(255,255,255,0.7)',
            };

            return (
              <div
                key={build.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {/* Category badge */}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {build.category}
                </span>

                {/* Build name */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {build.name}
                </span>

                {/* Talent string (truncated) */}
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {build.talent_string.length > 30
                    ? `${build.talent_string.slice(0, 30)}...`
                    : build.talent_string}
                </span>

                {/* Copy button */}
                <Button
                  variant="primary-soft"
                  size="sm"
                  onClick={() => handleCopy(build)}
                  icon={
                    <Icon
                      name={copiedId === build.id ? 'check' : 'link'}
                      size={14}
                      animation="none"
                    />
                  }
                >
                  {copiedId === build.id ? 'Copied!' : 'Copy'}
                </Button>

                {/* Delete button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(build.id)}
                  icon={<Icon name="trash" size={14} animation="none" />}
                />
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
