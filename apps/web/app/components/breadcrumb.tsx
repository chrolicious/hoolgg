'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@hool/design-system';

interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string;
  /** Optional navigation path (omit for current page) */
  href?: string;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items from parent to current page */
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb — Navigation path indicator with animated interactions
 *
 * Shows the current location in the navigation hierarchy with clickable
 * parent items. Guild names are truncated to 30 chars, other labels to 20 chars.
 *
 * Usage:
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'Guild Name', href: '/guilds/123' },
 *   { label: 'My Roster', href: '/guilds/123/roster' },
 *   { label: 'Character Name' }
 * ]} />
 * ```
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
  };

  return (
    <motion.nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 mb-3"
      style={{ fontSize: '0.8125rem' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = truncate(item.label, index === 0 ? 30 : 20);
        const itemKey = item.href || item.label || index;

        return (
          <div key={itemKey} className="flex items-center gap-2">
            {index > 0 && (
              <Icon
                name="chevron-right"
                size={12}
                className="text-white/30"
              />
            )}
            {isLast ? (
              <motion.span
                className="text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {label}
              </motion.span>
            ) : (
              <motion.button
                onClick={() => item.href && router.push(item.href)}
                className="bg-transparent border-none text-white/50 hover:text-white/80 cursor-pointer p-0 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.button>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
}
