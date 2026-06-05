import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { getAdminStats } from "@/lib/admin.functions";
import { ShoppingBag, DollarSign, Package, Cake, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const cards = [
    { label: "Total Orders", value: data?.orderCount ?? 0, icon: ShoppingBag, tone: "bg-blue-50 text-blue-600" },
    { label: "Revenue", value: `₦${Number(data?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Products", value: data?.productCount ?? 0, icon: Package, tone: "bg-amber-50 text-amber-600" },
    { label: "Custom Cakes", value: data?.customCakeCount ?? 0, icon: Cake, tone: "bg-pink-50 text-pink-600" },
    { label: "Training Registrations", value: data?.trainingCount ?? 0, icon: GraduationCap, tone: "bg-purple-50 text-purple-600" },
  ];
  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Overview</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">Dashboard</h1>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-6 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${c.tone}`}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 font-serif text-3xl font-semibold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}