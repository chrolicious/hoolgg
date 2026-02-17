'use client';

import { useRouter } from 'next/navigation';
import { Card, StatCard, Button, Icon } from '@hool/design-system';
import { FadeIn, StaggerGroup } from '@hool/design-system';
import { useGuild } from '../../../lib/guild-context';

export default function GuildDashboardPage() {
  const { guild, memberCount, permissions, canAccess, guildId, isGM } = useGuild();
  const router = useRouter();

  const enabledTools = permissions.filter((p) => p.enabled);

  const availableTools = [
    {
      name: 'progress',
      label: 'Character Progress',
      description: 'Track gear, iLvl targets, and raid readiness',
      icon: 'zap',
    },
    {
      name: 'recruitment',
      label: 'Recruitment',
      description: 'Find, evaluate, and organize recruitment candidates',
      icon: 'search',
    },
  ].filter((tool) => canAccess(tool.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome header */}
      <FadeIn duration={0.5}>
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Welcome to {guild?.name}
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '0.25rem 0 0',
            }}
          >
            {guild?.realm}
          </p>
        </div>
      </FadeIn>

      {/* Quick stats */}
      <StaggerGroup staggerDelay={0.08}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard
            label="Members"
            value={memberCount}
            icon={<Icon name="user" size={20} style={{ color: '#8b5cf6' }} />}
          />
          <StatCard
            label="Tools Enabled"
            value={enabledTools.length}
            icon={<Icon name="zap" size={20} style={{ color: '#8b5cf6' }} />}
          />
        </div>
      </StaggerGroup>

      {/* Available tools */}
      {availableTools.length > 0 && (
        <FadeIn duration={0.5} delay={0.2}>
          <div>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 1rem',
              }}
            >
              Your Tools
            </h2>
            <StaggerGroup staggerDelay={0.1}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {availableTools.map((tool) => (
                  <Card
                    key={tool.name}
                    padding="lg"
                    variant="elevated"
                    interactive
                  >
                    <button
                      onClick={() =>
                        router.push(`/guilds/${guildId}/${tool.name}`)
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'rgba(139, 92, 246, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          name={tool.icon}
                          size={20}
                          style={{ color: '#8b5cf6' }}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: 0,
                          }}
                        >
                          {tool.label}
                        </h3>
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            margin: '0.25rem 0 0',
                            lineHeight: 1.5,
                          }}
                        >
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  </Card>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </FadeIn>
      )}

      {/* GM quick actions */}
      {isGM && (
        <FadeIn duration={0.5} delay={0.3}>
          <div>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 1rem',
              }}
            >
              Guild Master Actions
            </h2>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push(`/guilds/${guildId}/settings`)}
              icon={<Icon name="settings" size={16} />}
            >
              Guild Settings
            </Button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
