import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { ShoppingCart, Star } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Shop — Lois Pastries" }] }),
  component: ProductsPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-destructive">Couldn't load products: {error.message}</div>
  ),
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
});

function ProductsPage() {
  const location = useLocation();
  if (location.pathname !== "/products") return <Outlet />;
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

      {/* Page header */}
      <section className="border-b bg-secondary/30 py-10">
        <div className="container mx-auto px-4">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Handcrafted Daily</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold">Our Pastries</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our handcrafted selection — made fresh by Chef Lois Olayinka.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search pastries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
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
          {(search || categoryId) && (
            <button
              onClick={() => { setSearch(""); setCategoryId(""); }}
              className="text-xs text-muted-foreground underline hover:text-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="mt-5 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} found
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[3/4]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            <p className="text-lg">No products match your search.</p>
            <button
              onClick={() => { setSearch(""); setCategoryId(""); }}
              className="mt-3 text-sm text-primary underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: any) => (
              <Card
                key={p.id}
                className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link to="/products/$id" params={{ id: p.id }}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <ProductImage
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {p.featured && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-gold)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-brand-ink)]">
                        <Star className="h-3 w-3 fill-current" /> Best Seller
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-serif text-lg leading-snug">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary text-base">
                      ₦{Number(p.price).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="text-xs">
                        <Link to="/products/$id" params={{ id: p.id }}>View</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-[var(--color-brand-gold)] text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-gold)]/90 text-xs"
                        onClick={() => { window.location.href = `/products/${p.id}`; }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
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
