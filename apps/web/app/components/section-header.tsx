// apps/web/app/components/section-header.tsx
interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div
      style={{
        fontSize: '0.625rem',
        letterSpacing: '0.075rem',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.3)',
        padding: '0.75rem 1rem 0.5rem',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}
