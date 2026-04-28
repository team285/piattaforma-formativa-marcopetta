import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  initials: string;
  role: "student" | "coach" | "founder";
  avatar_url: string | null;
  is_dev: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string): Promise<Profile | null> => {
    // Fetch profile, resilient se la colonna `is_dev` non esiste ancora
    // (es. migration 0018 non ancora applicata sul DB).
    const fetchProfileRow = async (): Promise<{ data: unknown; error: unknown }> => {
      const withDev = await supabase
        .from("profiles")
        .select("id,email,full_name,initials,role,avatar_url,is_dev")
        .eq("id", userId)
        .maybeSingle();
      if (!withDev.error) return { data: withDev.data, error: null };
      console.warn("[auth] is_dev not in schema yet, falling back:", withDev.error.message);
      const noDev = await supabase
        .from("profiles")
        .select("id,email,full_name,initials,role,avatar_url")
        .eq("id", userId)
        .maybeSingle();
      return { data: noDev.data, error: noDev.error };
    };

    const normalize = (raw: unknown): Profile | null => {
      if (!raw || typeof raw !== "object") return null;
      const d = raw as Record<string, unknown>;
      return {
        id: String(d.id ?? ""),
        email: String(d.email ?? ""),
        full_name: String(d.full_name ?? ""),
        initials: String(d.initials ?? "??"),
        role: (d.role as Profile["role"]) ?? "student",
        avatar_url: (d.avatar_url as string | null) ?? null,
        is_dev: !!d.is_dev,
      };
    };

    const first = await fetchProfileRow();
    if (first.error) {
      console.error("[auth] loadProfile error:", first.error);
      return null;
    }
    if (first.data) return normalize(first.data);

    // No profile yet → call ensure_profile RPC (lazy creation pattern)
    const { error: rpcError } = await supabase.rpc("ensure_profile");
    if (rpcError) {
      console.error("[auth] ensure_profile RPC error:", rpcError);
      return null;
    }
    const second = await fetchProfileRow();
    if (second.error || !second.data) return null;
    return normalize(second.data);
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    const p = await loadProfile(session.user.id);
    setProfile(p);
  };

  useEffect(() => {
    let mounted = true;

    // Safety net: dopo 5s forziamo loading=false in ogni caso
    // (evita schermo bloccato su "Caricamento" se qualcosa va storto)
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("[auth] safety timeout: forcing loading=false");
        setLoading(false);
      }
    }, 5000);

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.error("[auth] getSession error:", error);
        } else {
          setSession(data.session);
          if (data.session?.user) {
            const p = await loadProfile(data.session.user.id);
            if (mounted) setProfile(p);
          }
        }
      } catch (e) {
        console.error("[auth] init exception:", e);
      } finally {
        if (mounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    };

    init();

    // Subscribe a cambi sessione
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          const p = await loadProfile(newSession.user.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  return ctx;
}
