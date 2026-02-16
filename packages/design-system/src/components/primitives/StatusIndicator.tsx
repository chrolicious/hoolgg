'use client';

import React from 'react';
import { Button } from './Button';

export type StatusType = 'online' | 'away' | 'offline';

export interface StatusIndicatorProps {
  /** Status type */
  status: StatusType;
  /** Optional icon to display inside the circle */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Tooltip title (via title attribute) */
  title?: string;
}

const statusColorMap: Record<StatusType, { bg: string; color: string; border: string; hover: string }> = {
  online: {
    bg: '#10B981',      // Green (uncommon rarity)
    color: '#FFFFFF',
    border: '#1d2119',
    hover: '#059669',
  },
  away: {
    bg: '#FF8000',      // Orange
    color: '#FFFFFF',
    border: '#1d2119',
    hover: '#E67E00',
  },
  offline: {
    bg: '#6B7280',      // Gray
    color: '#FFFFFF',
    border: '#1d2119',
    hover: '#4B5563',
  },
};

/**
 * StatusIndicator — Small circle button for showing user status
 *
 * Usage:
 * <StatusIndicator status="online" />
 * <StatusIndicator status="away" icon={<AwayIcon />} />
 * <StatusIndicator status="offline" title="Offline" />
 *
 * With Avatar:
 * <div style={{ position: 'relative', display: 'inline-block' }}>
 *   <Avatar fallback="JD" size="lg" />
 *   <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', zIndex: 10 }}>
 *     <StatusIndicator status="online" />
 *   </div>
 * </div>
 */
export const StatusIndicator = React.forwardRef<HTMLButtonElement, StatusIndicatorProps>(
  ({ status, icon, onClick, title }, ref) => {
    const colors = statusColorMap[status];

    return (
      <Button
        ref={ref}
        variant="primary"
        shape="circle"
        size="sm"
        icon={icon}
        onClick={onClick}
        title={title}
        style={{
          '--btn-bg': colors.bg,
          '--btn-hover-bg': colors.hover,
          '--btn-color': colors.color,
          '--btn-border-color': colors.border,
          '--btn-hover-bg-fade': `${colors.bg}e6`,
          '--btn-dot-color': 'rgba(0, 0, 0, 0.1)',
          minWidth: '32px',
          padding: '6px',
        } as React.CSSProperties}
      />
    );
  },
);

StatusIndicator.displayName = 'StatusIndicator';
