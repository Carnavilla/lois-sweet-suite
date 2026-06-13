import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { listMyOrders } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Clock, CalendarDays } from "lucide-react";

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

  const { data: trainingRegistrations } = useQuery({
    queryKey: ["my-training", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from("training_registrations")
        .select("*, training_courses(title, price, duration, image_url)")
        .eq("student_email", user.email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">

        {/* Welcome banner */}
        <div className="rounded-3xl bg-gradient-to-br from-secondary to-background p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Welcome back</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">My Account</h1>
          <p className="mt-1 text-muted-foreground">{user?.email} · {roles.join(", ") || "customer"}</p>
        </div>

        {/* My Training — only shows if user has registrations */}
        {(trainingRegistrations ?? []).length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-semibold">My Training</h2>
            </div>
            <div className="mt-4 space-y-3">
              {trainingRegistrations!.map((r: any) => (
                <Card key={r.id} className="p-5 transition hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {r.training_courses?.image_url && (
                        <img
                          src={r.training_courses.image_url}
                          alt={r.training_courses.title}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <p className="font-serif text-lg font-semibold">
                          {r.training_courses?.title ?? "Course"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {r.training_courses?.duration && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {r.training_courses.duration}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Registered {new Date(r.created_at).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        ₦{Number(r.training_courses?.price ?? 0).toLocaleString()}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                        Registered
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <h2 className="mt-10 font-serif text-2xl font-semibold">Order History</h2>
        <div className="mt-4 space-y-3">
          {(orders ?? []).length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              No orders yet — your sweet journey starts here.
            </Card>
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
