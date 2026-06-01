import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const CreateSchema = z.object({
  items: z.array(ItemSchema).min(1).max(100),
  delivery_type: z.enum(["pickup", "delivery"]),
  delivery_date: z.string().optional(),
  delivery_time: z.string().optional(),
  delivery_fee: z.number().min(0).default(0),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + (data.delivery_fee ?? 0);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: total,
        status: "pending",
        delivery_type: data.delivery_type,
        delivery_date: data.delivery_date ?? null,
        delivery_time: data.delivery_time ?? null,
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message || "Failed to create order");

    const itemRows = data.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.price,
    }));
    await supabaseAdmin.from("order_items").insert(itemRows);
    await supabaseAdmin.from("order_tracking").insert({ order_id: order.id, status: "pending", notes: "Order created" });

    return { orderId: order.id, total };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, image_url))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });