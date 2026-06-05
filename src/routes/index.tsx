import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ProductImage";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-bakery.jpg";
import { Cake, Sparkles, GraduationCap, Heart, ShieldCheck, Truck, Star } from "lucide-react";

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

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Assorted Lois Pastries on a marble counter"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--color-brand-ink)]/85 via-[var(--color-brand-ink)]/55 to-transparent" />
        <div className="container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl text-[var(--color-brand-cream)]">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand-gold)]" /> Premium Nigerian Bakery
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] md:text-7xl">
              Cakes & pastries <span className="italic text-[var(--color-brand-gold)]">crafted</span> with love.
            </h1>
            <p className="mt-6 max-w-lg text-base opacity-90 md:text-lg">
              Bespoke celebration cakes, French pastries, and a professional training academy — all from Chef Lois Olayinka.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[var(--color-brand-gold)] text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-gold)]/90">
                <Link to="/products">Shop the Bakery</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Link to="/custom-cake">Design a Custom Cake</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y bg-secondary/40">
        <div className="container mx-auto grid gap-6 px-4 py-6 text-sm md:grid-cols-3">
          {[
            { icon: Heart, label: "Handcrafted daily by Chef Lois" },
            { icon: Truck, label: "Same-day delivery across Lagos" },
            { icon: ShieldCheck, label: "Secure Paystack checkout" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 text-foreground/80">
              <Icon className="h-5 w-5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {(featured?.length ?? 0) > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">Best Sellers</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">Featured Pastries</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-medium text-primary hover:underline sm:block">View all →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured!.map((p: any) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group">
                <Card className="overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <ProductImage src={p.image_url} alt={p.name} className="transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <p className="mt-1 font-medium text-primary">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {(categories?.length ?? 0) > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Explore</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Shop by Category</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories!.map((c: any) => (
              <Link
                key={c.id}
                to="/products"
                search={{ category: c.id }}
                className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm transition hover:shadow-xl"
              >
                <ProductImage src={c.image_url} alt={c.name} className="transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[var(--color-brand-ink)]/85 via-[var(--color-brand-ink)]/20 to-transparent p-6">
                  <div>
                    <span className="font-serif text-2xl text-white">{c.name}</span>
                    <p className="mt-1 text-sm text-white/80 opacity-0 transition group-hover:opacity-100">Discover →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* WHY CHOOSE */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">The Lois Difference</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Why Choose Lois Pastries</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Cake, title: "Crafted Fresh", desc: "Every cake & pastry is hand-baked the morning of delivery using premium ingredients." },
              { icon: Sparkles, title: "Signature Designs", desc: "Bespoke celebration cakes designed around your story, taste and vision." },
              { icon: GraduationCap, title: "Expert Trained", desc: "Recipes refined over a decade of professional pastry work and academy training." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Loved by Families</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold">Sweet Words from Our Customers</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Adaeze O.", quote: "The wedding cake was a showstopper. Every guest asked where it was from!" },
            { name: "Tunde A.", quote: "Crisp croissants, rich frosting — Lois Pastries is hands down the best bakery in Lagos." },
            { name: "Chiamaka E.", quote: "I joined the training academy and it changed my home baking forever. Worth every naira." },
          ].map((t) => (
            <Card key={t.name} className="border-0 bg-card p-8 shadow-sm">
              <div className="flex gap-0.5 text-[var(--color-brand-gold)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 font-serif text-lg leading-relaxed">"{t.quote}"</p>
              <p className="mt-4 text-sm font-medium text-muted-foreground">— {t.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA: CUSTOM CAKE + TRAINING */}
      <section className="container mx-auto grid gap-6 px-4 pb-20 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--color-brand-ink)] p-10 text-[var(--color-brand-cream)]">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--color-brand-gold)]/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-brand-gold)]">Bespoke</p>
          <h3 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Design your dream cake</h3>
          <p className="mt-3 max-w-md opacity-85">Weddings, birthdays, corporate — tell us your vision and we'll create something unforgettable.</p>
          <Button asChild size="lg" className="mt-6 bg-[var(--color-brand-gold)] text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-gold)]/90">
            <Link to="/custom-cake">Start a Custom Order</Link>
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground">
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">Academy</p>
          <h3 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Learn from Chef Lois</h3>
          <p className="mt-3 max-w-md opacity-90">Hands-on pastry training for beginners and professionals — small classes, big results.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/training">Explore Training</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
