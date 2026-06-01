import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "https://kppqjzrehddwaclvwwtu.supabase.co";
const serviceKey =
  process.env.LOIS_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";

if (!serviceKey) {
  console.warn(
    "[supabase admin] LOIS_SUPABASE_SERVICE_ROLE_KEY is not set — admin operations will fail.",
  );
}

export const supabaseAdmin: SupabaseClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});