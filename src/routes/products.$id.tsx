import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Product — Lois Pastries" }] }),
  component: ProductPage,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">Product not found.</div>,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="p-8">Loading…</div>;
  if (!data) return <div className="p-8">Not found</div>;
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          <ProductImage src={data.image_url} alt={data.name} />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-semibold">{data.name}</h1>
          <p className="mt-2 text-2xl text-primary">₦{Number(data.price).toLocaleString()}</p>
          <p className="mt-4 text-muted-foreground">{data.description}</p>
          {data.serves && <p className="mt-2 text-sm">Serves: {data.serves}</p>}
          {data.weight && <p className="text-sm">Weight: {data.weight}</p>}
          <Button
            size="lg"
            className="mt-6"
            onClick={() => {
              addToCart({ id: data.id, name: data.name, price: Number(data.price), image_url: data.image_url });
              toast.success("Added to cart");
              navigate({ to: "/cart" });
            }}
          >
            Add to cart
          </Button>
        </div>
      </section>
    </div>
  );
}