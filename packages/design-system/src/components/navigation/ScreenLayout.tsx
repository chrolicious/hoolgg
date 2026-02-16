'use client';

import React from 'react';
import { Navbar, type NavbarProps } from './Navbar';
import { TextureOverlay, type TextureOverlayProps } from './TextureOverlay';
import { ActionFooter, type ActionFooterProps } from './ActionFooter';
import styles from './ScreenLayout.module.css';

export interface ScreenLayoutProps {
  navbar?: NavbarProps;
  texture?: TextureOverlayProps;
  actions?: ActionFooterProps;
  children?: React.ReactNode;
  className?: string;
}

/**
 * ScreenLayout — Complete screen layout with navbar, texture, and actions
 * Combines all navigation components for Mario Wonder-style screens
 *
 * Usage:
 * <ScreenLayout
 *   navbar={{
 *     icon: "⚔️",
 *     title: "Guild Finder",
 *     subtitle: "Browse guilds",
 *   }}
 *   texture={{ pattern: 'checkerboard', opacity: 0.15 }}
 *   actions={{
 *     position: 'bottom-right',
 *     actions: [
 *       { key: 'back', label: 'Back', variant: 'secondary' },
 *       { key: 'next', label: 'Next', variant: 'primary' },
 *     ],
 *   }}
 * >
 *   Page content
 * {/ScreenLayout}
 */
export const ScreenLayout = React.forwardRef<HTMLDivElement, ScreenLayoutProps>(
  (
    {
      navbar,
      texture,
      actions,
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

        {/* Action footer */}
        {actions && <ActionFooter {...actions} />}
      </div>
    );
  },
);

ScreenLayout.displayName = 'ScreenLayout';
