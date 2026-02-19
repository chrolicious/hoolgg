'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button, Icon, Select, Card } from '@hool/design-system';
import { FadeIn, SlideIn } from '@hool/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { GuildProvider, useGuild } from '../../../lib/guild-context';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import type { Guild, GuildListResponse } from '../../../lib/types';
import { DashboardHeader } from '../../../components/dashboard-header';

// ── Sidebar Navigation Item ─────────────────────────────────

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 1rem',
        borderRadius: 8,
        border: 'none',
        background: active
          ? 'rgba(255, 255, 255, 0.08)'
          : 'transparent',
        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 400,
        transition: 'background 0.15s ease, color 0.15s ease',
        outline: 'none',
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
      <Icon name={icon} size={18} />
      <span>{label}</span>
      {active && (
        <div
          style={{
            marginLeft: 'auto',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#8b5cf6',
          }}
        />
      )}
    </button>
  );
}

// ── Inner Layout (requires GuildContext) ─────────────────────

function GuildLayoutInner({ children }: { children: React.ReactNode }) {
  const { guild, isLoading, error, canAccess, isGM, isOfficer, guildId } = useGuild();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Determine user role for DashboardHeader
  const userRole = isGM ? 'gm' : isOfficer ? 'officer' : 'raider';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Fetch guild list for switcher
  useEffect(() => {
    async function fetchGuilds() {
      try {
        const data = await api.get<GuildListResponse>('/guilds');
        setGuilds(data.guilds);
      } catch {
        // Non-critical — switcher will just not show other guilds
      }
    }
    fetchGuilds();
  }, []);

  const basePath = `/guilds/${guildId}`;

  const navItems = [
    { href: basePath, icon: 'home', label: 'Dashboard', alwaysShow: true },
    { href: `${basePath}/progress`, icon: 'zap', label: 'Progress', tool: 'progress' },
    { href: `${basePath}/recruitment`, icon: 'search', label: 'Recruitment', tool: 'recruitment' },
    { href: `${basePath}/settings`, icon: 'settings', label: 'Settings', gmOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.alwaysShow) return true;
    if (item.gmOnly) return isGM;
    if (item.tool) return canAccess(item.tool);
    return true;
  });

  const isActivePath = (href: string) => {
    if (href === basePath) {
      return pathname === basePath || pathname === basePath + '/';
    }
    return pathname.startsWith(href);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0b12',
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
            <Icon name="alert-circle" size={40} style={{ color: '#ef4444' }} />
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Failed to Load Guild
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: 0,
              }}
            >
              {error}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/guilds')}
                icon={<Icon name="arrow-left" size={14} />}
              >
                Back to Guilds
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0e0b12',
        position: 'relative',
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 0%, transparent 40vh, rgba(0,0,0,0.3) 70vh, rgba(0,0,0,0.7) 100vh, #000000 150vh)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: 'rgba(14, 11, 18, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.2s ease',
          ...(typeof window !== 'undefined' && window.innerWidth < 768
            ? { transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }
            : {}),
        }}
        className="guild-sidebar"
      >
        {/* Guild name header */}
        <div
          style={{
            padding: '0.5rem 1rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Icon name="shield" size={18} style={{ color: '#8b5cf6' }} />
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {guild?.name || 'Guild'}
            </span>
          </div>
          {guild?.realm && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.4)',
                paddingLeft: '1.75rem',
              }}
            >
              {guild.realm}
            </span>
          )}
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
          {visibleNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActivePath(item.href)}
              onClick={() => router.push(item.href)}
            />
          ))}
        </nav>

        {/* Guild switcher at bottom */}
        {guilds.length > 1 && (
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '0.75rem',
            }}
          >
            <Select
              options={guilds.map((g) => ({
                value: g.id,
                label: g.name,
              }))}
              value={guildId}
              onChange={(value) => router.push(`/guilds/${value}`)}
              variant="secondary"
              size="sm"
              label="Switch Guild"
            />
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
        className="guild-main"
      >
        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            padding: '0.75rem 0',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              width: '100%',
              margin: '0 auto',
              padding: '0 1.5rem',
            }}
          >
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                border: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                marginBottom: '0.75rem',
              }}
              className="mobile-menu-btn"
              aria-label="Open navigation menu"
            >
              <Icon name="menu" size={20} />
            </button>

            {guild && (
              <DashboardHeader
                guild={guild}
                userRole={userRole}
                userMenuButton={
                  <div ref={userMenuRef} style={{ position: 'relative' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      icon={<Icon name="user" size={16} />}
                    >
                      {user?.username}
                    </Button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 8,
                            minWidth: 160,
                            background: 'rgba(30, 25, 40, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 10,
                            padding: '0.375rem',
                            backdropFilter: 'blur(12px)',
                            zIndex: 50,
                          }}
                        >
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              router.push('/guilds');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              background: 'transparent',
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.8125rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Icon name="arrow-left" size={14} />
                            Switch Guild
                          </button>
                          <div
                            style={{
                              height: 1,
                              background: 'rgba(255, 255, 255, 0.06)',
                              margin: '0.25rem 0',
                            }}
                          />
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              fontSize: '0.8125rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Icon name="x-mark" size={14} />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                }
              />
            )}
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .guild-sidebar {
          transform: translateX(0);
        }
        .guild-main {
          margin-left: 240px;
        }
        .mobile-menu-btn {
          display: none !important;
        }

        @media (max-width: 767px) {
          .guild-sidebar {
            transform: translateX(-100%);
          }
          .guild-main {
            margin-left: 0 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Outer Layout (wraps with providers) ─────────────────────

export default function GuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const guildId = params.guildId as string;

  return (
    <GuildProvider guildId={guildId}>
      <GuildLayoutInner>{children}</GuildLayoutInner>
    </GuildProvider>
  );
}
