import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  "https://kppqjzrehddwaclvwwtu.supabase.co";
const key =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcHFqenJlaGRkd2FjbHZ3d3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDc2ODQsImV4cCI6MjA5NTg4MzY4NH0.oNkfnzugSs95x2CelQGzLO2v7TJGqFrd4iieWTEI3as";

export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "lois-pastries-auth",
  },
});

export const SUPABASE_URL = url;
export const SUPABASE_PUBLISHABLE_KEY = key;