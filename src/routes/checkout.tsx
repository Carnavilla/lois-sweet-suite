import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCart, writeCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { createOrder } from "@/lib/orders.functions";
import { initPaystackTransaction } from "@/lib/paystack.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Lois Pastries" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();
  const createOrderFn = useServerFn(createOrder);
  const initPay = useServerFn(initPaystackTransaction);

  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  const { data: zones } = useQuery({
    queryKey: ["delivery_zones"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_zones").select("*").eq("is_active", true);
      return data ?? [];
    },
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const zone = zones?.find((z) => z.state === state && z.city === city);
  const fee = deliveryType === "delivery" ? Number(zone?.fee ?? 0) : 0;
  const total = subtotal + fee;

  const onPay = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (deliveryType === "delivery" && !zone) return toast.error("Select a delivery zone");
    setSubmitting(true);
    try {
      const { orderId } = await createOrderFn({
        data: {
          items: cart.map((c) => ({ product_id: c.id, quantity: c.quantity, price: c.price })),
          delivery_type: deliveryType,
          delivery_date: date || undefined,
          delivery_time: time || undefined,
          delivery_fee: fee,
        },
      });
      const { authorization_url } = await initPay({
        data: {
          email: user!.email!,
          amount: total,
          orderId,
          callbackUrl: `${window.location.origin}/account?ref=paid`,
        },
      });
      writeCart([]);
      window.location.href = authorization_url;
    } catch (e) {
      toast.error((e as Error).message);
      setSubmitting(false);
    }
  };

  const states = Array.from(new Set((zones ?? []).map((z) => z.state)));
  const cities = (zones ?? []).filter((z) => z.state === state).map((z) => z.city);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[1fr_400px]">
        <Card className="p-6">
          <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Button variant={deliveryType === "delivery" ? "default" : "outline"} onClick={() => setDeliveryType("delivery")}>Delivery</Button>
              <Button variant={deliveryType === "pickup" ? "default" : "outline"} onClick={() => setDeliveryType("pickup")}>Pickup</Button>
            </div>
            {deliveryType === "delivery" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>State</Label>
                  <select className="mt-1 w-full rounded border bg-background px-3 py-2" value={state} onChange={(e) => { setState(e.target.value); setCity(""); }}>
                    <option value="">Select state</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>City</Label>
                  <select className="mt-1 w-full rounded border bg-background px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">Select city</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
          </div>
        </Card>
        <Card className="h-fit p-6">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {cart.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>₦{(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>₦{fee.toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-2 text-lg font-medium"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
          </div>
          <Button className="mt-6 w-full" onClick={onPay} disabled={submitting || cart.length === 0}>
            {submitting ? "Redirecting…" : "Pay with Paystack"}
          </Button>
        </Card>
      </section>
    </div>
  );
}