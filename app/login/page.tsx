'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function getReadableLoginError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (normalized.includes('rate limit')) {
    return 'Too many login attempts. Please wait a moment and try again.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Login is blocked by your Supabase project settings (email confirmation is enabled). Disable email confirmation in Supabase Auth settings.';
  }

  return message;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { login } = useAuth();

  const resetAuthState = async () => {
    setResetting(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      for (const key of Object.keys(window.localStorage)) {
        if (key.toLowerCase().includes('supabase')) {
          window.localStorage.removeItem(key);
        }
      }
      window.location.href = '/login';
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const message = await login(email, password);
    setLoading(false);

    if (message) {
      setError(getReadableLoginError(message));
      return;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to continue to StudentHub.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <Link
            href="/"
            className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            Continue as Guest
          </Link>
          <button
            type="button"
            onClick={resetAuthState}
            disabled={resetting}
            className="block w-full rounded-xl border border-amber-300 dark:border-amber-700 px-4 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 disabled:opacity-60"
          >
            {resetting ? 'Resetting...' : 'Reset Auth State'}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          No account?{' '}
          <Link href="/signup" className="text-blue-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
