import "./globals.css";
import { Syne, DM_Sans } from "next/font/google";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedIdsProvider } from "@/contexts/SavedIdsContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata = {
  title: "StudentHub — Discover Opportunities",
  description:
    "Find hackathons, internships, and exclusive student offers all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="studenthub-theme"
        >
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
