import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Lois Pastries" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [loading, isAuthenticated, isAdmin, navigate]);
  if (loading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1 text-sm">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Admin</p>
          <Link to="/admin" className="block rounded px-3 py-2 hover:bg-muted">Dashboard</Link>
          <Link to="/admin/products" className="block rounded px-3 py-2 hover:bg-muted">Products</Link>
          <Link to="/admin/orders" className="block rounded px-3 py-2 hover:bg-muted">Orders</Link>
          <Link to="/admin/custom-cakes" className="block rounded px-3 py-2 hover:bg-muted">Custom Cakes</Link>
          <Link to="/admin/training" className="block rounded px-3 py-2 hover:bg-muted">Training</Link>
          <Link to="/admin/users" className="block rounded px-3 py-2 hover:bg-muted">Users &amp; Roles</Link>
        </aside>
        <main><Outlet /></main>
      </div>
    </div>
  );
}