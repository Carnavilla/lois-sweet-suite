import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

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
