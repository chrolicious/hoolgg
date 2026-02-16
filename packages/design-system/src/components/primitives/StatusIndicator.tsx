'use client';

import React from 'react';
import { Button, type ButtonVariant } from './Button';

export type StatusType = 'online' | 'away' | 'offline' | 'custom';

export interface StatusIndicatorProps {
  /** Status type or custom color variant */
  status: StatusType | ButtonVariant;
  /** Optional icon to display inside the circle */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Tooltip title (via title attribute) */
  title?: string;
}

const statusVariantMap: Record<StatusType, ButtonVariant> = {
  online: 'primary',
  away: 'warning',
  offline: 'destructive',
  custom: 'secondary',
};

/**
 * StatusIndicator — Small circle button for showing user status
 *
 * Usage:
 * <StatusIndicator status="online" />
 * <StatusIndicator status="away" icon={<AwayIcon />} />
 * <StatusIndicator status="offline" title="Offline" />
 */
export const StatusIndicator = React.forwardRef<HTMLButtonElement, StatusIndicatorProps>(
  ({ status, icon, onClick, title }, ref) => {
    const variant = statusVariantMap[status as StatusType] || (status as ButtonVariant);

    return (
      <Button
        ref={ref}
        variant={variant}
        shape="circle"
        size="sm"
        icon={icon}
        onClick={onClick}
        title={title}
        style={{ minWidth: '32px', padding: '6px' }}
      />
    );
  },
);

StatusIndicator.displayName = 'StatusIndicator';
