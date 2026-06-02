import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  listCategoriesAdmin,
  upsertCategory,
  deleteCategory,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/components/ProductImage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const list = useServerFn(listCategoriesAdmin);
  const upsert = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: () => list() });
  const [editing, setEditing] = useState<any | null>(null);

  const onUpload = async (file: File) => {
    const path = `categories/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert({
        data: {
          id: editing.id,
          name: editing.name,
          description: editing.description ?? "",
          image_url: editing.image_url || null,
        },
      });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Categories</h1>
        <Button onClick={() => setEditing({ name: "" })}>+ New category</Button>
      </div>
      {editing && (
        <Card className="mt-6 p-6">
          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            {editing.image_url && (
              <div className="md:col-span-2">
                <img src={editing.image_url} alt="" className="h-24 w-24 rounded object-cover" />
              </div>
            )}
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {(data ?? []).map((c: any) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="aspect-video bg-muted">
              <ProductImage src={c.image_url} alt={c.name} />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{c.name}</h3>
              {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>Edit</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Delete this category?")) return;
                    try {
                      await del({ data: { id: c.id } });
                      qc.invalidateQueries({ queryKey: ["admin-categories"] });
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}