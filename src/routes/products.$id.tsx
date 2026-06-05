import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { Minus, Plus, Truck, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Product — Lois Pastries" }] }),
  component: ProductPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Product not found.</div>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: related } = useQuery({
    queryKey: ["related", data?.category_id, id],
    enabled: !!data?.category_id,
    queryFn: async () => {
      const { data: r } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .eq("is_available", true)
        .eq("category_id", data!.category_id)
        .neq("id", id)
        .limit(4);
      return r ?? [];
    },
  });
  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!data) return <div className="p-8">Not found</div>;
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto grid gap-12 px-4 py-12 md:grid-cols-2 md:py-16">
        <div className="aspect-square overflow-hidden rounded-3xl bg-muted shadow-sm">
          <ProductImage src={data.image_url} alt={data.name} />
        </div>
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Lois Pastries</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">{data.name}</h1>
          <p className="mt-3 font-serif text-3xl text-primary">₦{Number(data.price).toLocaleString()}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{data.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {data.serves && (
              <div className="rounded-xl border bg-card p-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Serves</p><p className="mt-1 font-medium">{data.serves}</p></div>
            )}
            {data.weight && (
              <div className="rounded-xl border bg-card p-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Weight</p><p className="mt-1 font-medium">{data.weight}</p></div>
            )}
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted rounded-l-full"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 hover:bg-muted rounded-r-full"><Plus className="h-4 w-4" /></button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                for (let i = 0; i < qty; i++) addToCart({ id: data.id, name: data.name, price: Number(data.price), image_url: data.image_url });
                toast.success("Added to cart");
                navigate({ to: "/cart" });
              }}
            >
              Add to cart · ₦{(Number(data.price) * qty).toLocaleString()}
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Same-day delivery</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</div>
            <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Handcrafted fresh</div>
          </div>
        </div>
      </section>
      {related && related.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="mb-6 font-serif text-2xl font-semibold">You may also love</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p: any) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group">
                <Card className="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <ProductImage src={p.image_url} alt={p.name} className="transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-base">{p.name}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </div>
  );
}