'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@hool/design-system';
import { useOnlineStatus } from '../lib/hooks/use-online-status';

/**
 * OfflineBanner — Shows a warning banner when the user loses internet connectivity.
 * Automatically hides when connectivity is restored.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(234, 179, 8, 0.15)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
              fontSize: '0.8125rem',
              color: '#eab308',
            }}
          >
            <Icon name="alert-circle" size={14} style={{ color: '#eab308' }} />
            <span>You are offline. Some features may not work until your connection is restored.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
