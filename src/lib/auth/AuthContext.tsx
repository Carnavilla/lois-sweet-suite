import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "student" | "admin" | "super_admin";
export const SUPER_ADMIN_EMAIL = "polayinka49@gmail.com";

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

async function fetchRoles(email: string | null | undefined): Promise<AppRole[]> {
  if (!email) return [];
  const lower = email.toLowerCase();
  const collected = new Set<AppRole>();
  if (lower === SUPER_ADMIN_EMAIL) {
    collected.add("super_admin");
    collected.add("admin");
  }
  const { data } = await supabase
    .from("roles")
    .select("role")
    .eq("email", lower);
  for (const row of data ?? []) {
    if (row.role) collected.add(row.role as AppRole);
  }
  if (collected.size === 0) collected.add("customer");
  return Array.from(collected);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      fetchRoles(data.session?.user?.email).then((r) => {
        if (mounted) setRoles(r);
        if (mounted) setLoading(false);
      });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Defer to avoid recursive callbacks
      setTimeout(() => {
        fetchRoles(s?.user?.email).then(setRoles);
      }, 0);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      roles,
      loading,
      isAuthenticated: !!user,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isSuperAdmin: roles.includes("super_admin"),
      hasRole: (r) => roles.includes(r),
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshRoles: async () => {
        setRoles(await fetchRoles(user?.email));
      },
    }),
    [user, session, roles, loading],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}