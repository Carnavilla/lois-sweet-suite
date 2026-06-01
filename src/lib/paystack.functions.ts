import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InitSchema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
  orderId: z.string().uuid(),
  callbackUrl: z.string().url(),
});

export const initPaystackTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => InitSchema.parse(d))
  .handler(async ({ data }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack not configured");
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: Math.round(data.amount * 100), // kobo
        callback_url: data.callbackUrl,
        metadata: { order_id: data.orderId },
      }),
    });
    const json = await res.json();
    if (!json.status) throw new Error(json.message || "Paystack init failed");
    // Record a pending payment row (best-effort)
    await supabaseAdmin.from("payments").insert({
      order_id: data.orderId,
      payment_reference: json.data.reference,
      amount: data.amount,
      payment_status: "pending",
      payment_method: "paystack",
    });
    return {
      authorization_url: json.data.authorization_url as string,
      reference: json.data.reference as string,
    };
  });

export const verifyPaystackTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reference: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Paystack not configured");
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json = await res.json();
    const success = json.status && json.data?.status === "success";
    const orderId = json.data?.metadata?.order_id as string | undefined;
    if (success && orderId) {
      await supabaseAdmin.from("payments").update({ payment_status: "success" }).eq("payment_reference", data.reference);
      await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", orderId);
      await supabaseAdmin.from("order_tracking").insert({ order_id: orderId, status: "paid", notes: "Payment confirmed" });
    }
    return { success, orderId };
  });