import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listUsersWithRoles, setUserRole } from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

const ROLES = ["customer", "student", "admin"] as const;
const SUPER = "polayinka49@gmail.com";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const { isSuperAdmin } = useAuth();
  const list = useServerFn(listUsersWithRoles);
  const setRole = useServerFn(setUserRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  const toggle = async (email: string, role: any, has: boolean) => {
    try {
      await setRole({ data: { email, role, action: has ? "remove" : "add" } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const filtered = (data ?? []).filter((u: any) =>
    !q || (u.email ?? "").toLowerCase().includes(q.toLowerCase()) || (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Users &amp; Roles</h1>
      <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="mt-4 max-w-sm" />
      <div className="mt-6 space-y-3">
        {isLoading && <p>Loading…</p>}
        {filtered.map((u: any) => {
          const isSuper = (u.email ?? "").toLowerCase() === SUPER;
          return (
            <Card key={u.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{u.full_name || "—"} {isSuper && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">SUPER ADMIN</span>}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground">Current: {u.roles.join(", ")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => {
                    const has = u.roles.includes(r);
                    const disabled = isSuper || (r === "admin" && !isSuperAdmin);
                    return (
                      <Button key={r} size="sm" variant={has ? "default" : "outline"} disabled={disabled}
                        onClick={() => toggle(u.email, r, has)}>
                        {has ? `Remove ${r}` : `Add ${r}`}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}