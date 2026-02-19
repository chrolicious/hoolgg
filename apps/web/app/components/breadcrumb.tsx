// apps/web/app/components/breadcrumb.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@hool/design-system';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
  };

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8125rem',
        marginBottom: '0.75rem',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = truncate(item.label, index === 0 ? 30 : 20);

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {index > 0 && (
              <Icon
                name="chevron-right"
                size={12}
                style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              />
            )}
            {isLast ? (
              <span style={{ color: '#ffffff', fontWeight: 500 }}>{label}</span>
            ) : (
              <button
                onClick={() => item.href && router.push(item.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                {label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
