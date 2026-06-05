import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { listMyOrders } from "@/lib/orders.functions";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Lois Pastries" }] }),
  component: AccountPage,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

function AccountPage() {
  const { isAuthenticated, loading, user, roles } = useAuth();
  const navigate = useNavigate();
  const fetchOrders = useServerFn(listMyOrders);
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);
  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
    enabled: isAuthenticated,
  });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-secondary to-background p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Welcome back</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">My Account</h1>
          <p className="mt-1 text-muted-foreground">{user?.email} · {roles.join(", ") || "customer"}</p>
        </div>
        <h2 className="mt-10 font-serif text-2xl font-semibold">Order History</h2>
        <div className="mt-4 space-y-3">
          {(orders ?? []).length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">No orders yet — your sweet journey starts here.</Card>
          )}
          {(orders ?? []).map((o: any) => {
            const badge = STATUS_STYLES[o.status] ?? "bg-muted text-foreground";
            return (
              <Card key={o.id} className="p-5 transition hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-serif text-lg">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badge}`}>
                      {String(o.status).replace(/_/g, " ")}
                    </span>
                    <p className="text-lg font-semibold text-primary">₦{Number(o.total_amount).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}