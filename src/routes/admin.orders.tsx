import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { listAllOrders, updateOrderStatus } from "@/lib/admin.functions";
import { toast } from "sonner";

const STATUSES = ["pending", "paid", "processing", "out_for_delivery", "completed", "cancelled"];

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  const list = useServerFn(listAllOrders);
  const update = useServerFn(updateOrderStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => list() });
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold">Orders</h1>
      <div className="mt-6 space-y-3">
        {isLoading && <p>Loading…</p>}
        {(data ?? []).map((o: any) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">#{o.id.slice(0, 8)} · {o.profiles?.full_name ?? o.profiles?.email ?? "Guest"}</p>
                <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.delivery_type}</p>
                <ul className="mt-2 text-sm">
                  {(o.order_items ?? []).map((it: any) => (
                    <li key={it.id}>{it.products?.name} × {it.quantity}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <p className="font-medium">₦{Number(o.total_amount).toLocaleString()}</p>
                <select
                  className="mt-2 rounded border bg-background px-2 py-1 text-sm"
                  value={o.status}
                  onChange={async (e) => {
                    await update({ data: { orderId: o.id, status: e.target.value } });
                    toast.success("Updated");
                    qc.invalidateQueries({ queryKey: ["admin-orders"] });
                  }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}