"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function getReadableLoginError(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (normalized.includes("rate limit")) {
    return "Too many login attempts. Please wait a moment and try again.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Login is blocked by your Supabase project settings (email confirmation is enabled). Disable email confirmation in Supabase Auth settings.";
  }

  return message;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { login } = useAuth();

  const resetAuthState = async () => {
    setResetting(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      for (const key of Object.keys(window.localStorage)) {
        if (key.toLowerCase().includes("supabase")) {
          window.localStorage.removeItem(key);
        }
      }
      window.location.href = "/login";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const message = await login(email, password);
    setLoading(false);

    if (message) {
      setError(getReadableLoginError(message));
      return;
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] card-glow relative z-10">
        <h1 className="text-3xl font-syne font-bold text-white mb-2">Login</h1>
        <p className="text-sm font-dm-sans text-zinc-400 mb-8">
          Sign in to continue to StudentHub.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-dm-sans"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-dm-sans"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-400 transition-colors mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Continue as Guest
          </Link>
          <button
            type="button"
            onClick={resetAuthState}
            disabled={resetting}
            className="block w-full rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm font-semibold text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-400 transition-colors disabled:opacity-60"
          >
            {resetting ? "Resetting..." : "Reset Auth State"}
          </button>
        </div>

        <p className="mt-8 text-center text-sm font-dm-sans text-zinc-400">
          No account?{" "}
          <Link
            href="/signup"
            className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
