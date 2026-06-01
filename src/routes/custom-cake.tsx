import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/custom-cake")({
  head: () => ({ meta: [{ title: "Custom Cake Orders — Lois Pastries" }] }),
  component: CustomCake,
});

function CustomCake() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onUpload = async (file: File) => {
    const path = `inspiration/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("cakes").upload(path, file);
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("cakes").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    toast.success("Inspiration image uploaded");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("custom_cake_orders").insert({
      customer_name: name, customer_email: email, cake_description: desc,
      inspiration_image: imageUrl || null, status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Request received. We'll contact you shortly.");
    setName(""); setEmail(""); setDesc(""); setImageUrl("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">Custom Cake Orders</h1>
        <p className="mt-2 text-muted-foreground">Tell us your vision. We'll bring it to life.</p>
        <Card className="mt-8 max-w-2xl p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label>Cake description</Label><Textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} required /></div>
            <div>
              <Label>Inspiration image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              {imageUrl && <img src={imageUrl} alt="Inspiration" className="mt-2 h-32 w-32 rounded object-cover" />}
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit Request"}</Button>
          </form>
        </Card>
      </section>
    </div>
  );
}