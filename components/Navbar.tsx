'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, GraduationCap, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handler = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existingGuestId = window.localStorage.getItem('studenthub_guest_id');
      if (existingGuestId) {
        setGuestId(existingGuestId);
        return;
      }
      const createdGuestId = `guest-${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem('studenthub_guest_id', createdGuestId);
      setGuestId(createdGuestId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const navLinks = [
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Internships', href: '/internships' },
    { label: 'Student Offers', href: '/offers' },
  ];

  const handleLogout = async () => {
    setLogoutPending(true);
    await logout();
    setLogoutPending(false);
    router.replace('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090b]/60 backdrop-blur-md border-b border-white/5 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-lg font-bold font-syne text-[#f4f4f5] tracking-tight">
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
                <motion.li key={link.href} variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
                  <Link href={link.href} className="relative group block">
                    <motion.span
                      whileHover={{ y: -1 }}
                      className={`block text-sm font-medium transition-colors ${
                        isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-indigo-300'
                      }`}
                    >
                      {link.label}
                    </motion.span>
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                disabled={logoutPending}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-60"
              >
                {logoutPending ? 'Logging out...' : 'Logout'}
              </button>
            ) : (
              <>
                {guestId && (
                  <span className="hidden sm:inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-500">
                    {guestId}
                  </span>
                )}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
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
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} className={!mounted ? "opacity-0" : ""} />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
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
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111318] border-t border-white/5 overflow-hidden"
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
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-zinc-400 hover:text-indigo-300 hover:bg-white/5'
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
                  className="w-full text-left block px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-60"
                >
                  {logoutPending ? 'Logging out...' : 'Logout'}
                </button>
              ) : (
                <>
                  {guestId && (
                    <p className="px-4 pt-2 text-xs font-semibold text-amber-500">Guest: {guestId}</p>
                  )}
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
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
