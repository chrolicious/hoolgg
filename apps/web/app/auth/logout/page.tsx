'use client';

import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e0b12',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
        Signing out...
      </p>
    </div>
  );
}
