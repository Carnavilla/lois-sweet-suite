import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Lois Pastries" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Check your email for reset instructions.");
  };
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto flex justify-center px-4 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-serif text-2xl font-semibold">Reset your password</h1>
          {sent ? (
            <p className="mt-4 text-sm text-muted-foreground">If an account exists for {email}, a reset link was sent.</p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button className="w-full">Send reset link</Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </Card>
      </div>
    </div>
  );
}