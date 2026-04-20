import './globals.css';
import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import AuthGuard from '@/components/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { SavedIdsProvider } from '@/contexts/SavedIdsContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });

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
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-[#f4f4f5] bg-[#09090b]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SavedIdsProvider>
              <AuthGuard>{children}</AuthGuard>
            </SavedIdsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
