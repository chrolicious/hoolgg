import type { Metadata } from 'next';
import '@hool/design-system/css/globals';
import './globals.css';
import { AuthProvider } from './lib/auth-context';
import { OfflineBanner } from './components/offline-banner';

export const metadata: Metadata = {
  title: 'hool.gg',
  description: 'WoW tools — guild recruitment, roster tracking, and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <OfflineBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
