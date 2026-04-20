import { supabase, supabaseConfigError } from "@/lib/supabase";

export async function login(email, password) {
  if (!supabase) {
    return {
      user: null,
      error: { message: supabaseConfigError ?? "Supabase is not configured." },
    };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
}

export async function signup(email, password) {
  if (!supabase) {
    return {
      user: null,
      error: { message: supabaseConfigError ?? "Supabase is not configured." },
    };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { user: data.user, error };
}

export async function logout() {
  if (!supabase) {
    return {
      error: { message: supabaseConfigError ?? "Supabase is not configured." },
    };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}
