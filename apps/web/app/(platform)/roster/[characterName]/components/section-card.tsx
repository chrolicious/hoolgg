'use client';

import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export function SectionCard({ title, subtitle, rightContent, children, delay = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
              margin: '4px 0 0 0',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {rightContent}
      </div>
      {children}
    </motion.div>
  );
}
