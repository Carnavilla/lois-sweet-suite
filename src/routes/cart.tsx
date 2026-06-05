import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useCart, writeCart, readCart } from "@/lib/cart";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Lois Pastries" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const remove = (id: string) => writeCart(readCart().filter((i) => i.id !== id));
  const setQty = (id: string, q: number) =>
    writeCart(readCart().map((i) => (i.id === id ? { ...i, quantity: Math.max(1, q) } : i)));
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="mt-8">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4"><Link to="/products">Continue shopping</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                  <div className="h-16 w-16 overflow-hidden rounded bg-muted">
                    {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-muted-foreground">₦{i.price.toLocaleString()}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => setQty(i.id, parseInt(e.target.value || "1"))}
                    className="w-16 rounded border px-2 py-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-xl border bg-card p-6">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <Button className="mt-6 w-full" onClick={() => navigate({ to: "/checkout" })}>
                Proceed to checkout
              </Button>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}