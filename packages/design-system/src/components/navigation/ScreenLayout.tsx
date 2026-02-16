'use client';

import React from 'react';
import { Navbar, type NavbarProps } from './Navbar';
import { NavbarFooter, type NavbarFooterProps } from './NavbarFooter';
import { TextureOverlay, type TextureOverlayProps } from './TextureOverlay';
import styles from './ScreenLayout.module.css';

export interface ScreenLayoutProps {
  navbar?: NavbarProps;
  navbarFooter?: NavbarFooterProps;
  texture?: TextureOverlayProps;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ScreenLayout — Complete screen layout with navbar, navbar footer, and texture
 * Combines navigation components for Mario Wonder-style screens
 *
 * Usage:
 * <ScreenLayout
 *   navbar={{
 *     icon: "⚔️",
 *     title: "Guild Finder",
 *     subtitle: "Browse guilds",
 *   }}
 *   navbarFooter={{
 *     icon: "👥",
 *     title: "Members",
 *     subtitle: "View roster",
 *   }}
 *   texture={{ pattern: 'checkerboard', opacity: 0.15 }}
 * >
 *   Page content
 * </ScreenLayout>
 */
export const ScreenLayout = React.forwardRef<HTMLDivElement, ScreenLayoutProps>(
  (
    {
      navbar,
      navbarFooter,
      texture,
      children,
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${styles.layout} ${className || ''}`}
      >
        {/* Texture overlay */}
        {texture && <TextureOverlay {...texture} />}

        {/* Navbar */}
        {navbar && <Navbar {...navbar} />}

        {/* Main content */}
        <main className={styles.main}>
          {children}
        </main>

        {/* Navbar Footer */}
        {navbarFooter && <NavbarFooter {...navbarFooter} />}
      </div>
    );
  },
);

ScreenLayout.displayName = 'ScreenLayout';
