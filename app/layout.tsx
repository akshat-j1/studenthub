import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { SavedIdsProvider } from '@/contexts/SavedIdsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudentHub — Discover Opportunities',
  description: 'Find hackathons, internships, and exclusive student offers all in one place.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <SavedIdsProvider>
            <AuthGuard>{children}</AuthGuard>
          </SavedIdsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
