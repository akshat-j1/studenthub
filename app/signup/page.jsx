"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function parseSignupError(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return {
      isRateLimited: true,
      message:
        "Too many signup attempts right now. Supabase rate limits can sometimes last longer than 1 minute. Please wait and try again, or log in if the account was already created.",
    };
  }
  if (
    normalized.includes("already registered") ||
    normalized.includes("already exists")
  ) {
    return {
      isRateLimited: false,
      message: "This email is already registered. Please use Login.",
    };
  }

  return {
    isRateLimited: false,
    message,
  };
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const { signup, login } = useAuth();

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
      window.location.href = "/signup";
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const message = await signup(email, password);
    if (message) {
      setLoading(false);
      const parsed = parseSignupError(message);
      if (parsed.isRateLimited) {
        setCooldownSeconds(60);
        setError(
          `${parsed.message} Please try again after a short wait or use Login if the account already exists.`,
        );
        return;
      }
      setError(parsed.message);
      return;
    }

    const loginError = await login(email, password);
    setLoading(false);

    if (loginError) {
      setSuccess("Signup successful. Please log in with the same credentials.");
      return;
    }

    setSuccess("Signup successful. You are now logged in.");
  };

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] card-glow relative z-10">
        <h1 className="text-3xl font-syne font-bold text-white mb-2">
          Sign up
        </h1>
        <p className="text-sm font-dm-sans text-zinc-400 mb-8">
          Create your StudentHub account.
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
            minLength={6}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-dm-sans"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <button
            type="submit"
            disabled={loading || cooldownSeconds > 0}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-400 transition-colors mt-2"
          >
            {loading
              ? "Creating account..."
              : cooldownSeconds > 0
                ? `Try again in ${cooldownSeconds}s`
                : "Sign up"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
