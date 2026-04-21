"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Moon, Sun, GraduationCap, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUserProfile } from "@/lib/profile";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handler = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfileInitial = async () => {
      if (!user) {
        setProfileInitial("U");
        return;
      }
      const { profile } = await getCurrentUserProfile();
      if (!active) return;
      const initial = profile?.name?.trim()?.[0]?.toUpperCase() || "U";
      setProfileInitial(initial);
    };

    loadProfileInitial();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existingGuestId = window.localStorage.getItem(
        "studenthub_guest_id",
      );
      if (existingGuestId) {
        setGuestId(existingGuestId);
        return;
      }
      const createdGuestId = `guest-${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem("studenthub_guest_id", createdGuestId);
      setGuestId(createdGuestId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const navLinks = [
    { label: "Hackathons", href: "/hackathons" },
    { label: "Internships", href: "/internships" },
    { label: "Student Offers", href: "/offers" },
  ];

  const handleLogout = async () => {
    setLogoutPending(true);
    await logout();
    setLogoutPending(false);
    router.replace("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-zinc-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-[#09090b]/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-lg font-bold font-syne tracking-tight text-zinc-900 dark:text-[#f4f4f5]">
                Student<span className="text-indigo-500">Hub</span>
              </span>
            </Link>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="hidden md:flex items-center gap-6"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link href={link.href} className="relative group block">
                    <motion.span
                      whileHover={{ y: -1 }}
                      className={`block text-sm font-medium transition-colors ${
                        isActive
                          ? "text-indigo-400"
                          : "text-zinc-600 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-300"
                      }`}
                    >
                      {link.label}
                    </motion.span>
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  title="Profile"
                  aria-label="Go to profile"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  {profileInitial}
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logoutPending}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {logoutPending ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                {guestId && (
                  <span className="hidden sm:inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                    {guestId}
                  </span>
                )}
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              onClick={() => {
                if (theme === "dark") setTheme("light");
                else setTheme("dark");
              }}
              className="rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} className={!mounted ? "opacity-0" : ""} />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-200 bg-white dark:border-white/5 dark:bg-[#111318] md:hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "text-indigo-400 bg-indigo-500/10"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-500 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-indigo-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {user ? (
                <button
                  onClick={handleLogout}
                  disabled={logoutPending}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {logoutPending ? "Logging out..." : "Logout"}
                </button>
              ) : (
                <>
                  {guestId && (
                    <p className="px-4 pt-2 text-xs font-semibold text-amber-500">
                      Guest: {guestId}
                    </p>
                  )}
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-white bg-indigo-500 rounded-xl transition-all text-center mt-2"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
