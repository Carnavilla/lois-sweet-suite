import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Not configured", { status: 500 });
        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(body).digest("hex");
        try {
          if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return new Response("Invalid signature", { status: 401 });
          }
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }
        const event = JSON.parse(body);
        if (event.event === "charge.success") {
          const ref = event.data?.reference;
          const orderId = event.data?.metadata?.order_id;
          if (ref) await supabaseAdmin.from("payments").update({ payment_status: "success" }).eq("payment_reference", ref);
          if (orderId) {
            await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", orderId);
            await supabaseAdmin.from("order_tracking").insert({ order_id: orderId, status: "paid", notes: "Webhook confirmed" });
          }
        }
        return new Response("ok");
      },
    },
  },
});