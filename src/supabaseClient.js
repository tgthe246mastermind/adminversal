import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Prevent multiple instances during Vite HMR / repeated imports
const g = globalThis;

export const supabase =
  g.__adminversal_supabase ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

if (!g.__adminversal_supabase) g.__adminversal_supabase = supabase;
