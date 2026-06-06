import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SiteHeader } from "@/components/SiteHeader";
import { LayoutDashboard, Package, Tags, ShoppingBag, Cake, GraduationCap, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Lois Pastries" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [loading, isAuthenticated, isAdmin, navigate]);
  if (loading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access…</div>;
  }
  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/custom-cakes", label: "Custom Cakes", icon: Cake },
    { to: "/admin/training", label: "Training", icon: GraduationCap },
    { to: "/admin/users", label: "Users & Roles", icon: Users },
  ];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1 lg:sticky lg:top-24 lg:h-fit lg:rounded-3xl lg:border lg:bg-card lg:p-4 lg:shadow-sm">
          <p className="mb-3 px-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? location.pathname === to : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                    active ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}