import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SUPER_ADMIN_EMAIL = "polayinka49@gmail.com";

async function assertAdmin(email: string) {
  const lower = email.toLowerCase();
  if (lower === SUPER_ADMIN_EMAIL) return { isSuper: true };
  const { data } = await supabaseAdmin.from("roles").select("role").eq("email", lower);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Response("Forbidden", { status: 403 });
  }
  return { isSuper: roles.includes("super_admin") };
}

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const [orders, products, custom, training] = await Promise.all([
      supabaseAdmin.from("orders").select("id, total_amount, status", { count: "exact" }),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("custom_cake_orders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("training_registrations").select("id", { count: "exact", head: true }),
    ]);
    const includedStatuses = new Set(["paid", "processing", "out_for_delivery", "completed"]);
    const revenue = (orders.data ?? [])
      .filter((o) => includedStatuses.has(o.status))
      .reduce((s, o) => s + Number(o.total_amount), 0);
    return {
      orderCount: orders.count ?? 0,
      revenue,
      productCount: products.count ?? 0,
      customCakeCount: custom.count ?? 0,
      trainingCount: training.count ?? 0,
    };
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*, products(name))")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[listAllOrders]", error);
      return [];
    }
    const list = orders ?? [];
    // Enrich with auth user details (profiles table may be empty)
    const userIds = Array.from(new Set(list.map((o: any) => o.user_id).filter(Boolean)));
    const userMap = new Map<string, { email: string; full_name: string }>();
    await Promise.all(
      userIds.map(async (uid: string) => {
        try {
          const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
          if (data?.user) {
            userMap.set(uid, {
              email: data.user.email ?? "",
              full_name: (data.user.user_metadata?.full_name as string) ?? "",
            });
          }
        } catch (e) {
          console.error("[listAllOrders] getUserById", uid, e);
        }
      }),
    );
    return list.map((o: any) => ({
      ...o,
      profiles: userMap.get(o.user_id) ?? null,
    }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ orderId: z.string().uuid(), status: z.string().min(1).max(40), notes: z.string().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.orderId);
    await supabaseAdmin.from("order_tracking").insert({ order_id: data.orderId, status: data.status, notes: data.notes ?? null });
    return { ok: true };
  });

export const listAllProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const { data } = await supabaseAdmin.from("products").select("*, categories(name)").order("created_at", { ascending: false });
    return data ?? [];
  });

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const { data } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return data ?? [];
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(120),
      description: z.string().max(1000).optional().nullable(),
      image_url: z.string().url().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    if (data.id) {
      const { error } = await supabaseAdmin.from("categories").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { id: _o, ...ins } = data;
      const { error } = await supabaseAdmin.from("categories").insert(ins);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ProductInput = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0),
  image_url: z.string().url().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  sku: z.string().max(100).optional(),
  weight: z.string().max(50).optional(),
  serves: z.string().max(50).optional(),
  is_available: z.boolean().default(true),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ProductInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { id: _omit, ...insert } = data;
      const { error } = await supabaseAdmin.from("products").insert(insert);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    // Source users from auth (canonical) + roles table. profiles table may be empty.
    const [{ data: rolesRows }, { data: profilesRows }] = await Promise.all([
      supabaseAdmin.from("roles").select("*"),
      supabaseAdmin.from("profiles").select("id, email, full_name, phone, created_at"),
    ]);
    const profileByEmail = new Map<string, any>();
    for (const p of profilesRows ?? []) {
      profileByEmail.set((p.email ?? "").toLowerCase(), p);
    }
    const rolesByEmail = new Map<string, string[]>();
    for (const r of rolesRows ?? []) {
      const email = (r.email ?? "").toLowerCase();
      if (!rolesByEmail.has(email)) rolesByEmail.set(email, []);
      rolesByEmail.get(email)!.push(r.role);
    }
    // Page through auth users
    const users: any[] = [];
    let page = 1;
    while (page < 20) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) { console.error("[listUsersWithRoles] listUsers", error); break; }
      const batch = data?.users ?? [];
      users.push(...batch);
      if (batch.length < 200) break;
      page += 1;
    }
    return users.map((u) => {
      const lower = (u.email ?? "").toLowerCase();
      const profile = profileByEmail.get(lower);
      const r = rolesByEmail.get(lower) ?? ["customer"];
      if (lower === SUPER_ADMIN_EMAIL && !r.includes("super_admin")) r.push("super_admin");
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: profile?.full_name ?? (u.user_metadata?.full_name as string) ?? "",
        phone: profile?.phone ?? (u.user_metadata?.phone as string) ?? "",
        created_at: u.created_at,
        roles: r,
      };
    }).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    email: z.string().email(),
    role: z.enum(["customer", "student", "admin", "super_admin"]),
    action: z.enum(["add", "remove"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    const lower = data.email.toLowerCase();
    // Super admin protection
    if (lower === SUPER_ADMIN_EMAIL && (data.action === "remove" || data.role === "super_admin")) {
      throw new Error("The super admin account cannot be modified.");
    }
    // Only the super admin can grant/revoke admin or super_admin
    if ((data.role === "admin" || data.role === "super_admin") && context.userEmail.toLowerCase() !== SUPER_ADMIN_EMAIL) {
      throw new Error("Only the super admin can manage admin roles.");
    }
    if (data.action === "add") {
      const { error } = await supabaseAdmin.from("roles").upsert(
        { email: lower, role: data.role },
        { onConflict: "email,role" },
      );
      if (error) {
        // Fallback insert
        const { data: existing } = await supabaseAdmin.from("roles").select("id").eq("email", lower).eq("role", data.role).maybeSingle();
        if (!existing) await supabaseAdmin.from("roles").insert({ email: lower, role: data.role });
      }
    } else {
      await supabaseAdmin.from("roles").delete().eq("email", lower).eq("role", data.role);
    }
    return { ok: true };
  });

export const listCustomCakeOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const { data } = await supabaseAdmin.from("custom_cake_orders").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const updateCustomCakeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    await supabaseAdmin.from("custom_cake_orders").update({ status: data.status }).eq("id", data.id);
    return { ok: true };
  });

export const listTrainingAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userEmail);
    const [{ data: courses }, { data: regs }] = await Promise.all([
      supabaseAdmin.from("training_courses").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("training_registrations").select("*, training_courses(title)").order("created_at", { ascending: false }),
    ]);
    return { courses: courses ?? [], registrations: regs ?? [] };
  });

export const upsertCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    price: z.number().min(0),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userEmail);
    if (data.id) await supabaseAdmin.from("training_courses").update(data).eq("id", data.id);
    else { const { id: _o, ...ins } = data; await supabaseAdmin.from("training_courses").insert(ins); }
    return { ok: true };
  });