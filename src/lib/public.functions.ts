import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listDeliveryZones = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("delivery_zones")
    .select("id, state, city, fee, is_active")
    .eq("is_active", true)
    .order("state", { ascending: true });
  if (error) {
    console.error("[listDeliveryZones]", error);
    return [];
  }
  return data ?? [];
});

export const listPublicTraining = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("training_courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listPublicTraining]", error);
    return [];
  }
  return data ?? [];
});

import { z } from "zod";

export const ensureProfile = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        email: z.string().email(),
        full_name: z.string().max(200).optional().default(""),
        phone: z.string().max(40).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const lower = data.email.toLowerCase();
    await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: data.id,
          email: lower,
          full_name: data.full_name,
          phone: data.phone,
          role: "customer",
        },
        { onConflict: "id" },
      );
    // Ensure a customer role row exists (idempotent)
    const { data: existing } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("email", lower)
      .eq("role", "customer")
      .maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("roles").insert({ email: lower, role: "customer" });
    }
    return { ok: true };
  });