import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Pastry Training — Lois Pastries" }] }),
  component: TrainingPage,
});

function TrainingPage() {
  const { data } = useQuery({
    queryKey: ["training_courses"],
    queryFn: async () => {
      const { data } = await supabase.from("training_courses").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const register = async () => {
    if (!selected) return;
    const { error } = await supabase.from("training_registrations").insert({
      course_id: selected, student_name: name, student_email: email,
    });
    if (error) return toast.error(error.message);
    toast.success("Registered! We'll be in touch.");
    setName(""); setEmail(""); setSelected(null);
  };
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-semibold">Professional Pastry Training</h1>
        <p className="mt-2 text-muted-foreground">Learn from Lois Olayinka. Practical, hands-on courses.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <Card key={c.id} className="p-6">
              <h3 className="font-serif text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              <p className="mt-4 text-lg text-primary">₦{Number(c.price).toLocaleString()}</p>
              <Button className="mt-4 w-full" onClick={() => setSelected(c.id)}>Register</Button>
            </Card>
          ))}
        </div>
        {selected && (
          <Card className="mt-8 p-6">
            <h2 className="font-semibold">Register for this course</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={register}>Submit</Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}