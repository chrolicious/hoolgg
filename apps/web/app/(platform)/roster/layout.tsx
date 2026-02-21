'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Icon, Card } from '@hool/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../lib/auth-context';
import { progressApi } from '../../lib/api';
import { SectionHeader } from '../../components/section-header';

interface CharacterData {
  id: number;
  character_name: string;
  realm: string;
  class_name: string;
  spec: string;
  role: 'Tank' | 'Healer' | 'DPS';
  current_ilvl: number;
  user_bnet_id: number | null;
}

// ── Sidebar Navigation Item ─────────────────────────────────

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

interface NavItemData {
  href: string;
  icon: string;
  label: string;
  alwaysShow?: boolean;
  gmOnly?: boolean;
  officerOnly?: boolean;
  tool?: string;
}

interface NavSection {
  header: string;
  items: NavItemData[];
}

function NavItem({ href, icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : '0.625rem',
        padding: collapsed ? '0.625rem' : '0.625rem 0.75rem',
        borderRadius: 8,
        border: 'none',
        background: active
          ? 'rgba(255, 255, 255, 0.08)'
          : 'transparent',
        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.8125rem',
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
      <Icon name={icon} size={16} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{label}</span>}
      {!collapsed && active && (
        <div
          style={{
            marginLeft: 'auto',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#8b5cf6',
          }}
        />
      )}
    </button>
  );
}

// ── Inner Layout ─────────────────────

export default function RosterLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const sidebarWidth = sidebarCollapsed ? 56 : 240;

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

  // Fetch user's personal characters for sidebar
  useEffect(() => {
    async function fetchCharacters() {
      if (!user) return;

      try {
        const data = await progressApi.get<{ characters: CharacterData[] }>(
          `/users/me/characters`
        );
        setCharacters(data.characters || []);
      } catch {
        // Non-critical
      }
    }
    fetchCharacters();
  }, [user]);

  const basePath = `/roster`;

  // Build character nav items
  const characterNavItems: NavItemData[] = characters.map((char) => ({
    href: `${basePath}/${encodeURIComponent(char.character_name)}?realm=${encodeURIComponent(char.realm)}`,
    icon: 'user',
    label: char.character_name,
    alwaysShow: true,
  }));

  const navSections: NavSection[] = [
    {
      header: 'MY ROSTER',
      items: [
        { href: `${basePath}`, icon: 'users', label: 'Overview', alwaysShow: true },
        ...characterNavItems,
      ],
    },
  ];

  const isActivePath = (href: string) => {
    if (href === basePath) {
      return pathname === basePath || pathname === basePath + '/';
    }

    // Match exact character paths, accounting for URL encoding
    const decodedPathname = decodeURIComponent(pathname);
    const decodedHref = decodeURIComponent(href);
    
    if (decodedPathname === decodedHref || decodedPathname === decodedHref + '/') {
      return true;
    }
    
    return false;
  };

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
          width: sidebarWidth,
          background: 'rgba(14, 11, 18, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          padding: sidebarCollapsed ? '0.75rem 0.5rem' : '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'width 0.2s ease, padding 0.2s ease, transform 0.2s ease',
          overflow: 'hidden',
          ...(typeof window !== 'undefined' && window.innerWidth < 768
            ? { transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }
            : {}),
        }}
        className="guild-sidebar"
      >
        {/* Header + collapse toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: sidebarCollapsed ? 'center' : 'flex-start',
            flexDirection: sidebarCollapsed ? 'column' : 'row',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: sidebarCollapsed ? '0.5rem' : 0,
            padding: sidebarCollapsed ? '0.25rem 0 0.5rem' : '0.25rem 0.25rem 0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '0.25rem',
          }}
        >
          {sidebarCollapsed ? (
            <Icon name="users" size={18} style={{ color: '#8b5cf6' }} />
          ) : (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="users" size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  My Roster
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              borderRadius: 4,
              flexShrink: 0,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'; }}
          >
            <Icon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} size={14} />
          </button>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1, overflow: 'hidden' }}>
          {navSections.map((section, sectionIndex) => {
            const visibleItems = section.items.filter((item) => {
              if (item.alwaysShow) return true;
              if (item.gmOnly) return isGM;
              if (item.officerOnly) return isOfficer;
              if (item.tool) return canAccess(item.tool);
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.header} style={{ marginTop: sectionIndex > 0 ? '0.25rem' : 0 }}>
                {!sidebarCollapsed && <SectionHeader label={section.header} />}
                {sidebarCollapsed && sectionIndex > 0 && (
                  <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '0.375rem 0' }} />
                )}
                {visibleItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={isActivePath(item.href)}
                    collapsed={sidebarCollapsed}
                    onClick={() => router.push(item.href)}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* Bottom section: user menu */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '0.75rem 0.125rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: sidebarCollapsed ? 'center' : 'stretch',
            gap: '0.5rem',
          }}
        >
          {/* User menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={sidebarCollapsed ? user?.username : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: sidebarCollapsed ? 0 : '0.625rem',
                padding: sidebarCollapsed ? '0.625rem' : '0.625rem 0.75rem',
                borderRadius: 8,
                border: 'none',
                background: userMenuOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: userMenuOpen ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontSize: '0.8125rem',
                fontWeight: 400,
                transition: 'background 0.15s ease, color 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }
              }}
            >
              <Icon name="user" size={16} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span>{user?.username}</span>}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: sidebarCollapsed ? '50%' : 0,
                    right: sidebarCollapsed ? undefined : 0,
                    transform: sidebarCollapsed ? 'translateX(-50%)' : undefined,
                    marginBottom: 8,
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
                      whiteSpace: 'nowrap',
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
        </div>
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
            position: 'fixed',
            top: '0.75rem',
            left: '0.75rem',
            zIndex: 30,
          }}
          className="mobile-menu-btn"
          aria-label="Open navigation menu"
        >
          <Icon name="menu" size={20} />
        </button>

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
          margin-left: ${sidebarWidth}px;
          transition: margin-left 0.2s ease;
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

