import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0e0b12',
        padding: '2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 900,
          color: 'rgba(255, 255, 255, 0.1)',
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.5)',
          margin: 0,
          maxWidth: 320,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/roster"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1.25rem',
          borderRadius: 8,
          background: 'rgba(139, 92, 246, 0.15)',
          color: '#8b5cf6',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: '1px solid rgba(139, 92, 246, 0.3)',
          transition: 'background 0.15s ease',
        }}
      >
        Go to Roster
      </Link>
    </div>
  );
}
