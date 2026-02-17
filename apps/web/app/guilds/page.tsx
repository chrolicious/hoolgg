'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Icon,
  GuildCard,
  Modal,
  InputWithLabel,
  FadeIn,
  StaggerGroup,
  Container,
} from '@hool/design-system';
import { useAuth } from '../lib/auth-context';
import { api, ApiError } from '../lib/api';
import type { Guild, GuildListResponse } from '../lib/types';

export default function GuildsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createRealm, setCreateRealm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchGuilds = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingGuilds(true);
    setError(null);
    try {
      const data = await api.get<GuildListResponse>('/guilds');
      setGuilds(data.guilds);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load guilds.');
      }
    } finally {
      setIsLoadingGuilds(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  const handleCreateGuild = async () => {
    if (!createName.trim() || !createRealm.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await api.post<Guild>('/guilds', {
        name: createName.trim(),
        realm: createRealm.trim(),
      });
      setIsCreateModalOpen(false);
      setCreateName('');
      setCreateRealm('');
      router.push(`/guilds/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.message);
      } else {
        setCreateError('Failed to create guild.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0b12',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0e0b12',
        padding: '2rem 1rem',
      }}
    >
      <Container>
        <FadeIn duration={0.5}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                Your Guilds
              </h1>
              {user && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '0.25rem 0 0',
                  }}
                >
                  Welcome back, {user.username}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Icon name="plus" size={16} />}
            >
              Create Guild Instance
            </Button>
          </div>
        </FadeIn>

        {error && (
          <FadeIn duration={0.3}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <Icon name="alert-circle" size={32} style={{ color: '#ef4444' }} />
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                {error}
              </p>
              <Button variant="secondary" size="sm" onClick={fetchGuilds}>
                Retry
              </Button>
            </div>
          </FadeIn>
        )}

        {isLoadingGuilds && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 180,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {!isLoadingGuilds && !error && guilds.length === 0 && (
          <FadeIn duration={0.5}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}
            >
              <Icon
                name="shield"
                size={48}
                style={{ color: 'rgba(255, 255, 255, 0.2)' }}
              />
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                }}
              >
                No Guilds Yet
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  margin: 0,
                  maxWidth: 320,
                }}
              >
                Create a guild instance to start using hool.gg tools for your
                World of Warcraft guild.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<Icon name="plus" size={16} />}
              >
                Create Guild Instance
              </Button>
            </div>
          </FadeIn>
        )}

        {!isLoadingGuilds && !error && guilds.length > 0 && (
          <StaggerGroup staggerDelay={0.08}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {guilds.map((guild) => (
                <GuildCard
                  key={guild.id}
                  name={guild.name}
                  realm={guild.realm}
                  faction="horde"
                  memberCount={0}
                  onClick={() => router.push(`/guilds/${guild.id}`)}
                />
              ))}
            </div>
          </StaggerGroup>
        )}
      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateError(null);
        }}
        title="Create Guild Instance"
        subtitle="Set up hool.gg for your guild"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateGuild}
              loading={isCreating}
              disabled={!createName.trim() || !createRealm.trim()}
            >
              Create Guild
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputWithLabel
            label="Guild Name"
            placeholder="Enter your guild name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <InputWithLabel
            label="Realm"
            placeholder="e.g. Illidan, Stormrage"
            value={createRealm}
            onChange={(e) => setCreateRealm(e.target.value)}
          />
          {createError && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                margin: 0,
              }}
            >
              {createError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
