import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/ProductImage";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Shop — Lois Pastries" }] }),
  component: ProductsPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Couldn't load products: {error.message}</div>,
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
});

function ProductsPage() {
  const location = useLocation();

  if (location.pathname !== "/products") {
    return <Outlet />;
  }

  return <ProductsCatalog />;
}

function ProductsCatalog() {
  const { category: initialCategory } = Route.useSearch();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>(initialCategory ?? "");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, is_available, featured, category_id, created_at")
        .eq("is_available", true)
        .order("featured", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    let list = (data ?? []).slice();
    if (categoryId) list = list.filter((p: any) => p.category_id === categoryId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p: any) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc": list.sort((a: any, b: any) => Number(a.price) - Number(b.price)); break;
      case "price-desc": list.sort((a: any, b: any) => Number(b.price) - Number(a.price)); break;
      case "newest": list.sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at)); break;
      default: list.sort((a: any, b: any) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [data, search, categoryId, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">Our Pastries</h1>
        <p className="mt-2 text-muted-foreground">Browse our handcrafted selection.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search pastries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-sm"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {(categories ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        {isLoading ? (
          <div className="mt-8 text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 text-muted-foreground">No products match your search.</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: any) => (
              <Card
                key={p.id}
                className="group cursor-pointer overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => {
                  window.location.href = `/products/${p.id}`;
                }}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <ProductImage src={p.image_url} alt={p.name} className="transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg">{p.name}</h3>
                  <p className="mt-1 font-medium text-primary">₦{Number(p.price).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}