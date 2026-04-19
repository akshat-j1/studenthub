'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { login as loginHelper, logout as logoutHelper, signup as signupHelper } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      login: async (email, password) => {
        const { error } = await loginHelper(email, password);
        return error?.message ?? null;
      },
      signup: async (email, password) => {
        const { error } = await signupHelper(email, password);
        return error?.message ?? null;
      },
      logout: async () => {
        const { error } = await logoutHelper();
        return error?.message ?? null;
      },
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
