import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { listMyOrders } from "@/lib/orders.functions";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Lois Pastries" }] }),
  component: AccountPage,
});

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
        <h1 className="font-serif text-3xl font-semibold">My Account</h1>
        <p className="text-muted-foreground">{user?.email} · {roles.join(", ")}</p>
        <h2 className="mt-8 font-serif text-2xl">Orders</h2>
        <div className="mt-4 space-y-3">
          {(orders ?? []).length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
          {(orders ?? []).map((o: any) => (
            <Card key={o.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{Number(o.total_amount).toLocaleString()}</p>
                  <p className="text-sm capitalize text-muted-foreground">{o.status}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}