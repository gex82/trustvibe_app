import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TrustVibe Admin',
  description: 'TrustVibe operations console',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
