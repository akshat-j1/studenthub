'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

function parseSignupError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('rate limit')) {
    return {
      isRateLimited: true,
      message:
        'Too many signup attempts right now. Supabase rate limits can sometimes last longer than 1 minute. Please wait and try again, or log in if the account was already created.',
    };
  }
  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return {
      isRateLimited: false,
      message: 'This email is already registered. Please use Login.',
    };
  }

  return {
    isRateLimited: false,
    message,
  };
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const { signup, login } = useAuth();

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
      window.location.href = '/signup';
    }
  };

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const message = await signup(email, password);
    if (message) {
      setLoading(false);
      const parsed = parseSignupError(message);
      if (parsed.isRateLimited) {
        setCooldownSeconds(60);
        setError(`${parsed.message} Please try again after a short wait or use Login if the account already exists.`);
        return;
      }
      setError(parsed.message);
      return;
    }

    const loginError = await login(email, password);
    setLoading(false);

    if (loginError) {
      setSuccess('Signup successful. Please log in with the same credentials.');
      return;
    }

    setSuccess('Signup successful. You are now logged in.');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign up</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your StudentHub account.</p>

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
            minLength={6}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
          <button
            type="submit"
            disabled={loading || cooldownSeconds > 0}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? 'Creating account...'
              : cooldownSeconds > 0
                ? `Try again in ${cooldownSeconds}s`
                : 'Sign up'}
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
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
