/**
 * SectionHeader — Visual separator and label for sidebar navigation sections
 *
 * Usage:
 * <SectionHeader label="MY ROSTER" />
 * <SectionHeader label="GUILD MANAGEMENT" />
 */

interface SectionHeaderProps {
  /** Display label for the section (typically uppercase) */
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div
      className="uppercase tracking-wider text-white/30 px-4 py-3 pb-2 font-bold"
      style={{ fontSize: '0.625rem' }}
    >
      {label}
    </div>
  );
}
