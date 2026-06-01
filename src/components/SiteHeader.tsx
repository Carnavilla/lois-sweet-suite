import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User as UserIcon, LogOut, Shield } from "lucide-react";

export function SiteHeader() {
  const { isAuthenticated, isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
          <span className="inline-block h-8 w-8 rounded-full bg-primary" />
          Lois Pastries
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/products" className="hover:text-primary">Shop</Link>
          <Link to="/custom-cake" className="hover:text-primary">Custom Cakes</Link>
          <Link to="/training" className="hover:text-primary">Training</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/cart" })}>
            <ShoppingBag className="h-5 w-5" />
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin" })}>
              <Shield className="mr-1 h-4 w-4" /> Admin
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/account" })}>
                <UserIcon className="mr-1 h-4 w-4" />
                {user?.email?.split("@")[0]}
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/login" })}>Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}