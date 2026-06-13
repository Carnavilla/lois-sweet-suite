import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Cake, Heart, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Lois Pastries" }] }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b bg-[var(--color-brand-ink)] py-20 text-[var(--color-brand-cream)]">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-brand-gold)]">Our Story</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight">
            Meet Chef Lois Olayinka
          </h1>
          <p className="mt-5 text-base opacity-85 leading-relaxed max-w-xl mx-auto">
            Founder of Lois Pastries — Lagos's go-to premium bakery for celebration
            cakes, gourmet pastries, and professional pastry training.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>
            Lois Pastries was born from a deep love for the art of baking. Founded by
            Chef Lois Olayinka, the bakery started as a small home kitchen operation and
            has grown into one of Lagos's most trusted premium bakeries — known for
            celebration cakes, French-inspired pastries, gourmet cookies and desserts
            that leave lasting impressions.
          </p>
          <p>
            With over a decade of professional pastry experience, Chef Lois brings together
            global baking techniques and local Nigerian flavours to create products that are
            both beautiful and delicious. Every item is handcrafted fresh daily — no
            shortcuts, no compromises.
          </p>
          <p>
            Beyond the bakery, Lois Pastries runs a thriving training academy, helping
            beginners and seasoned bakers alike sharpen their craft through hands-on
            small-class sessions.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">What We Stand For</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { icon: Heart, title: "Made with Love", desc: "Every item is handcrafted the morning it's delivered." },
              { icon: Cake, title: "Premium Quality", desc: "We use only the finest local and imported ingredients." },
              { icon: Award, title: "Excellence", desc: "A decade of refined pastry technique in every bite." },
              { icon: GraduationCap, title: "Knowledge Sharing", desc: "Empowering the next generation of Nigerian bakers." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 shadow-sm text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-semibold">Taste the difference</h2>
        <p className="mt-3 text-muted-foreground">
          Order from our bakery or join the training academy today.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-[var(--color-brand-gold)] text-[var(--color-brand-ink)] hover:bg-[var(--color-brand-gold)]/90">
            <Link to="/products">Shop the Bakery</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/training">Explore Training</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
