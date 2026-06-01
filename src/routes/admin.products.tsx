import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { listAllProductsAdmin, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const list = useServerFn(listAllProductsAdmin);
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => list() });
  const [editing, setEditing] = useState<any | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert({ data: {
        id: editing.id,
        name: editing.name,
        description: editing.description ?? "",
        price: Number(editing.price),
        image_url: editing.image_url || null,
        stock: Number(editing.stock ?? 0),
        featured: !!editing.featured,
        sku: editing.sku ?? "",
        weight: editing.weight ?? "",
        serves: editing.serves ?? "",
        is_available: editing.is_available !== false,
      } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const onUpload = async (file: File) => {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setEditing({ ...editing, image_url: data.publicUrl });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Products</h1>
        <Button onClick={() => setEditing({ name: "", price: 0, stock: 0, is_available: true })}>+ New product</Button>
      </div>
      {editing && (
        <Card className="mt-6 p-6">
          <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
            <div><Label>SKU</Label><Input value={editing.sku ?? ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} /></div>
            <div><Label>Price (₦)</Label><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} required /></div>
            <div><Label>Stock</Label><Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} /></div>
            <div><Label>Serves</Label><Input value={editing.serves ?? ""} onChange={(e) => setEditing({ ...editing, serves: e.target.value })} /></div>
            <div><Label>Weight</Label><Input value={editing.weight ?? ""} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="md:col-span-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              {editing.image_url && <img src={editing.image_url} alt="" className="mt-2 h-24 w-24 rounded object-cover" />}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_available !== false} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Available</label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Stock</th><th className="p-3 text-left">Available</th><th></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-4">Loading…</td></tr>}
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">₦{Number(p.price).toLocaleString()}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.is_available ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    if (!confirm("Delete this product?")) return;
                    await del({ data: { id: p.id } });
                    qc.invalidateQueries({ queryKey: ["admin-products"] });
                  }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}