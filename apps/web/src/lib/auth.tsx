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

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,initials,role,avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("loadProfile error:", error);
      return null;
    }

    if (!data) {
      // No profile yet → call ensure_profile RPC (lazy creation pattern)
      const { error: rpcError } = await supabase.rpc("ensure_profile");
      if (rpcError) {
        console.error("ensure_profile RPC error:", rpcError);
        return null;
      }
      // Re-fetch after RPC
      const { data: created } = await supabase
        .from("profiles")
        .select("id,email,full_name,initials,role,avatar_url")
        .eq("id", userId)
        .maybeSingle();
      return created as Profile | null;
    }

    return data as Profile;
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
