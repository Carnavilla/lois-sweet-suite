import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Lois Pastries" }] }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">About Lois Pastries</h1>
        <p className="mt-6 text-muted-foreground">
          Lois Pastries is a premium Nigerian bakery founded by Lois Olayinka. Inspired by
          cakes, pastries, desserts and baked goods from around the world, we specialize in
          celebration cakes, custom cakes, gourmet cookies, desserts and professional pastry training.
        </p>
      </section>
    </div>
  );
}