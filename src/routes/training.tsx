import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductImage } from "@/components/ProductImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { listPublicTraining } from "@/lib/public.functions";
import { GraduationCap, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Pastry Training — Lois Pastries" }] }),
  component: TrainingPage,
});

function TrainingPage() {
  const fetchCourses = useServerFn(listPublicTraining);
  const { data, isLoading } = useQuery({
    queryKey: ["public-training_courses"],
    queryFn: () => fetchCourses(),
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
  const courses = data ?? [];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-gradient-to-b from-secondary/40 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <GraduationCap className="h-4 w-4" /> Training Academy
          </span>
          <h1 className="mt-4 font-serif text-4xl font-semibold md:text-5xl">Professional Pastry Training</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Learn from Lois Olayinka. Hands-on, small-group classes designed to take you from beginner to confident baker.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl font-semibold">Available Courses</h2>
        {isLoading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="overflow-hidden border-0 p-0 shadow-sm">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="mt-6 p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-xl">No courses available yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're preparing new classes. Check back soon for our upcoming pastry training sessions.
            </p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => (
              <Card
                key={c.id}
                className="group flex flex-col overflow-hidden border-0 p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <ProductImage
                    src={c.image_url}
                    alt={c.title}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl font-semibold">{c.title}</h3>
                  {c.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {c.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {c.duration}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <p className="text-lg font-medium text-primary">₦{Number(c.price).toLocaleString()}</p>
                    <Button className="mt-3 w-full" onClick={() => setSelected(c.id)}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {selected && (
          <Card className="mt-8 p-6 shadow-md">
            <h2 className="font-serif text-xl font-semibold">Register for this course</h2>
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
      <SiteFooter />
    </div>
  );
}