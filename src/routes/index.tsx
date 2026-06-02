import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lois Pastries — Premium Nigerian Bakery & Pastry Training" },
      { name: "description", content: "Celebration cakes, custom cakes, pastries, cookies and professional pastry training by Lois Olayinka." },
      { property: "og:title", content: "Lois Pastries" },
      { property: "og:description", content: "Premium Nigerian bakery & pastry training." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url")
        .eq("is_available", true)
        .eq("featured", true)
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["home-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .order("name")
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-20 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">Premium Nigerian Bakery</p>
        <h1 className="font-serif text-5xl font-semibold leading-tight md:text-7xl">
          Cakes, pastries &amp; desserts<br />crafted with love.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          From bespoke celebration cakes to professional pastry training — discover the world of Lois Pastries.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/products">Shop Now</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/custom-cake">Order a Custom Cake</Link></Button>
        </div>
      </section>
      {(featured?.length ?? 0) > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-semibold">Featured</h2>
            <Link to="/products" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured!.map((p: any) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }}>
                <Card className="overflow-hidden transition hover:shadow-lg">
                  <div className="aspect-square bg-muted">
                    <ProductImage src={p.image_url} alt={p.name} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="mt-1 text-sm text-primary">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(categories?.length ?? 0) > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <h2 className="mb-6 font-serif text-3xl font-semibold">Shop by category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories!.map((c: any) => (
              <Link
                key={c.id}
                to="/products"
                search={{ category: c.id }}
                className="group relative block aspect-[16/9] overflow-hidden rounded-xl bg-muted"
              >
                <ProductImage src={c.image_url} alt={c.name} className="transition group-hover:scale-105" />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="font-serif text-2xl text-white">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="container mx-auto grid gap-6 px-4 pb-20 md:grid-cols-3">
        {[
          { title: "Celebration Cakes", desc: "Birthdays, weddings & milestones.", to: "/products" },
          { title: "Custom Cakes", desc: "Designed around your vision.", to: "/custom-cake" },
          { title: "Pastry Training", desc: "Learn from a master pastry chef.", to: "/training" },
        ].map((c) => (
          <Link key={c.title} to={c.to} className="group rounded-2xl border bg-card p-8 transition hover:shadow-lg">
            <h3 className="font-serif text-2xl font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-block text-sm text-primary group-hover:underline">Explore →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
