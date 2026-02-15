import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
