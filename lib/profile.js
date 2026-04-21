import { supabase, supabaseConfigError } from "@/lib/supabase";

export async function getCurrentUserProfile() {
  if (!supabase) {
    return {
      profile: null,
      error: { message: supabaseConfigError ?? "Supabase is not configured." },
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return { profile: null, error: userError };
  }

  const user = userData?.user ?? null;
  if (!user) {
    return { profile: null, error: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { profile: null, error: profileError };
  }

  return { profile: profile ?? null, error: null };
}
