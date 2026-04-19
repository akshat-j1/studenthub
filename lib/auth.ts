import type { AuthError, User } from '@supabase/supabase-js';

import { supabase, supabaseConfigError } from '@/lib/supabase';

export async function login(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  if (!supabase) {
    return {
      user: null,
      error: { message: supabaseConfigError ?? 'Supabase is not configured.' } as AuthError,
    };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, error };
}

export async function signup(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  if (!supabase) {
    return {
      user: null,
      error: { message: supabaseConfigError ?? 'Supabase is not configured.' } as AuthError,
    };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user, error };
}

export async function logout(): Promise<{ error: AuthError | null }> {
  if (!supabase) {
    return {
      error: { message: supabaseConfigError ?? 'Supabase is not configured.' } as AuthError,
    };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}
