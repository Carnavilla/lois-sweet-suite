import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { listCustomCakeOrders, updateCustomCakeStatus } from "@/lib/admin.functions";

const STATUSES = ["pending", "reviewing", "quoted", "accepted", "in_progress", "completed", "rejected"];

export const Route = createFileRoute("/admin/custom-cakes")({ component: AdminCC });

function AdminCC() {
  const list = useServerFn(listCustomCakeOrders);
  const update = useServerFn(updateCustomCakeStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-cc"], queryFn: () => list() });
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Custom Cake Requests</h1>
      <div className="mt-6 space-y-3">
        {isLoading && <p>Loading…</p>}
        {(data ?? []).map((c: any) => (
          <Card key={c.id} className="p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-4">
                {c.inspiration_image && <img src={c.inspiration_image} alt="" className="h-20 w-20 rounded object-cover" />}
                <div>
                  <p className="font-medium">{c.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{c.customer_email}</p>
                  <p className="mt-2 max-w-xl text-sm">{c.cake_description}</p>
                </div>
              </div>
              <select
                className="rounded border bg-background px-2 py-1 text-sm"
                value={c.status}
                onChange={async (e) => { await update({ data: { id: c.id, status: e.target.value } }); qc.invalidateQueries({ queryKey: ["admin-cc"] }); }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}