import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const cards = [
    { label: "Total Orders", value: data?.orderCount ?? 0 },
    { label: "Revenue", value: `₦${Number(data?.revenue ?? 0).toLocaleString()}` },
    { label: "Products", value: data?.productCount ?? 0 },
    { label: "Custom Cakes", value: data?.customCakeCount ?? 0 },
    { label: "Training Registrations", value: data?.trainingCount ?? 0 },
  ];
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-6">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}