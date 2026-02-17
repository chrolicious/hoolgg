'use client';

import React from 'react';

const pulseKeyframes = `
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.15; }
  }
`;

interface SkeletonBaseProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonBlock({
  width = '100%',
  height = 16,
  borderRadius = 6,
  className,
  style,
}: SkeletonBaseProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.06)',
        animation: 'skeleton-pulse 2s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <SkeletonBlock width="60%" height={18} />
        <SkeletonBlock width="100%" height={14} />
        <SkeletonBlock width="80%" height={14} />
      </div>
    </>
  );
}

export function StatCardSkeleton() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <SkeletonBlock width={40} height={40} borderRadius={10} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          <SkeletonBlock width="40%" height={12} />
          <SkeletonBlock width="30%" height={20} />
        </div>
      </div>
    </>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock
            key={i}
            width={i === 0 ? '70%' : '50%'}
            height={14}
          />
        ))}
      </div>
    </>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(255, 255, 255, 0.02)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock key={i} width="60%" height={12} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <SkeletonBlock width={36} height={36} borderRadius={8} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                flex: 1,
              }}
            >
              <SkeletonBlock width="50%" height={14} />
              <SkeletonBlock width="30%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function PageSkeleton() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <SkeletonBlock width="30%" height={24} />
          <div style={{ height: 8 }} />
          <SkeletonBlock width="20%" height={14} />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    </>
  );
}
