import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "https://kppqjzrehddwaclvwwtu.supabase.co";
const anonKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcHFqenJlaGRkd2FjbHZ3d3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDc2ODQsImV4cCI6MjA5NTg4MzY4NH0.oNkfnzugSs95x2CelQGzLO2v7TJGqFrd4iieWTEI3as";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authHeader = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
    if (!authHeader) {
      throw new Response("Unauthorized: No authorization header provided", { status: 401 });
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Response("Unauthorized", { status: 401 });
    }
    return next({
      context: { supabase, userId: data.user.id, userEmail: data.user.email ?? "" },
    });
  },
);