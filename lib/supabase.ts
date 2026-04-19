import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const missingEnvVars = [
  !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
].filter(Boolean) as string[];

export const supabaseConfigError =
  missingEnvVars.length > 0
    ? `Missing Supabase environment variables: ${missingEnvVars.join(', ')}. Add them to .env.local and restart the dev server.`
    : null;

if (supabaseConfigError) {
  // Keep runtime alive so auth screens can show a useful error instead of crashing.
  console.error(supabaseConfigError);
}

export const supabase = supabaseConfigError ? null : createClient(supabaseUrl!, supabaseAnonKey!);
