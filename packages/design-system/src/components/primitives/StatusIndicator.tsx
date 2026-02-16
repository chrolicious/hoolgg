'use client';

import React from 'react';
import styles from './StatusIndicator.module.css';

export type StatusType = 'online' | 'away' | 'offline';

export interface StatusIndicatorProps {
  /** Status type */
  status: StatusType;
  /** Click handler */
  onClick?: () => void;
  /** Tooltip title (via title attribute) */
  title?: string;
}

const statusColorMap: Record<StatusType, { bg: string; hover: string }> = {
  online: {
    bg: '#10B981',      // Green
    hover: '#059669',
  },
  away: {
    bg: '#FF8000',      // Orange
    hover: '#E67E00',
  },
  offline: {
    bg: '#6B7280',      // Gray
    hover: '#4B5563',
  },
};

/**
 * StatusIndicator — Small circle dot for showing user status
 *
 * Usage:
 * <StatusIndicator status="online" />
 * <StatusIndicator status="away" />
 * <StatusIndicator status="offline" title="Offline" />
 *
 * With Avatar:
 * <div style={{ position: 'relative', display: 'inline-block' }}>
 *   <Avatar fallback="JD" size="lg" />
 *   <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', zIndex: 10 }}>
 *     <StatusIndicator status="online" />
 *   </div>
 * </div>
 */
export const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status, onClick, title }, ref) => {
    const colors = statusColorMap[status];
    const isOnline = status === 'online';

    return (
      <div
        ref={ref}
        className={isOnline ? styles.online : ''}
        onClick={onClick}
        title={title}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: colors.bg,
          border: '2px solid #FFFFFF',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.hover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.bg;
        }}
      />
    );
  },
);

StatusIndicator.displayName = 'StatusIndicator';
