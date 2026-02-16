'use client';

import React from 'react';
import { Navbar, type NavbarProps } from './Navbar';
import { TextureOverlay, type TextureOverlayProps } from './TextureOverlay';
import styles from './ScreenLayout.module.css';

export interface ScreenLayoutProps {
  navbar?: NavbarProps;
  texture?: TextureOverlayProps;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ScreenLayout — Complete screen layout with navbar and texture
 * Combines navigation components for Mario Wonder-style screens
 *
 * Usage:
 * <ScreenLayout
 *   navbar={{
 *     icon: "⚔️",
 *     title: "Guild Finder",
 *     subtitle: "Browse guilds",
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
      </div>
    );
  },
);

ScreenLayout.displayName = 'ScreenLayout';
