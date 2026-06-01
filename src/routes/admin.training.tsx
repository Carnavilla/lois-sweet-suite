import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listTrainingAdmin, upsertCourse } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/training")({ component: AdminTraining });

function AdminTraining() {
  const list = useServerFn(listTrainingAdmin);
  const upsert = useServerFn(upsertCourse);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-training"], queryFn: () => list() });
  const [editing, setEditing] = useState<any | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert({ data: { id: editing.id, title: editing.title, description: editing.description ?? "", price: Number(editing.price) } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-training"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <div className="flex justify-between"><h1 className="font-serif text-3xl font-semibold">Training</h1>
        <Button onClick={() => setEditing({ title: "", price: 0 })}>+ New course</Button></div>
      {editing && (
        <Card className="mt-4 p-6">
          <form onSubmit={save} className="space-y-4">
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required /></div>
            <div><Label>Price (₦)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
          </form>
        </Card>
      )}
      <h2 className="mt-8 font-serif text-xl">Courses</h2>
      <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p>Loading…</p>}
        {(data?.courses ?? []).map((c: any) => (
          <Card key={c.id} className="p-4">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted-foreground">₦{Number(c.price).toLocaleString()}</p>
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => setEditing(c)}>Edit</Button>
          </Card>
        ))}
      </div>
      <h2 className="mt-8 font-serif text-xl">Registrations</h2>
      <div className="mt-2 space-y-2">
        {(data?.registrations ?? []).map((r: any) => (
          <Card key={r.id} className="p-3 text-sm">
            <p><strong>{r.student_name}</strong> — {r.student_email}</p>
            <p className="text-muted-foreground">{r.training_courses?.title} · {new Date(r.created_at).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}