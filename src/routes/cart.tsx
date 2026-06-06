import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { useCart, writeCart, readCart } from "@/lib/cart";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

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
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Almost there</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-3xl border bg-card p-12 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="font-serif text-2xl">Your cart is empty</p>
            <p className="mt-2 text-muted-foreground">Discover handcrafted pastries waiting just for you.</p>
            <Button asChild size="lg" className="mt-6"><Link to="/products">Browse the bakery</Link></Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-muted">
                    <ProductImage src={i.image_url} alt={i.name} />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-lg">{i.name}</p>
                    <p className="text-sm text-primary">₦{i.price.toLocaleString()}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border bg-background">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} className="px-2.5 py-1.5 hover:bg-muted rounded-l-full"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-medium">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} className="px-2.5 py-1.5 hover:bg-muted rounded-r-full"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-3xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-serif text-xl">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Subtotal</span><span>₦{total.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>Calculated at checkout</span></div>
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-serif text-xl">
                <span>Total</span>
                <span className="text-primary">₦{total.toLocaleString()}</span>
              </div>
              <Button size="lg" className="mt-6 w-full" onClick={() => navigate({ to: "/checkout" })}>
                Proceed to checkout
              </Button>
              <Link to="/products" className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary">Continue shopping</Link>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}