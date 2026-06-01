import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Shop — Lois Pastries" }] }),
  component: ProductsPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Couldn't load products: {error.message}</div>,
});

function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, is_available")
        .eq("is_available", true)
        .order("featured", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">Our Pastries</h1>
        <p className="mt-2 text-muted-foreground">Browse our handcrafted selection.</p>
        {isLoading ? (
          <div className="mt-8 text-muted-foreground">Loading…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="mt-8 text-muted-foreground">No products available yet.</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data!.map((p) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }}>
                <Card className="overflow-hidden transition hover:shadow-lg">
                  <div className="aspect-square bg-muted">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="mt-1 text-sm text-primary">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}