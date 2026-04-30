/**
 * Notifications — provider con realtime subscription a chat/feedback/submission.
 *
 * Espone:
 *  - useNotifications() → counter (unread messages, pending reviews, new feedback)
 *  - Toast automatici quando arriva un evento mentre l'utente è in altra pagina
 *  - Badge sulle voci nav (Chat / Da correggere / Feedback)
 *
 * Strategia:
 *  - Initial fetch dei counter al mount
 *  - Subscribe Supabase Realtime su chat_messages, feedbacks, submissions
 *  - Su INSERT: refetch del counter relativo + toast (se non sei sulla pagina)
 *
 * Usa il role del profilo per decidere cosa subscribare:
 *  - student: chat_messages (in propri thread), feedbacks (su propri submissions),
 *             exercises (assegnati a me)
 *  - coach/founder: chat_messages (in propri thread), submissions (nuove take)
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import { useTabVisibility } from "./hooks";
import { toast } from "../components/ui";

// ─── Browser Notifications ──────────────────────────────────────────
type BrowserPermission = "default" | "granted" | "denied" | "unsupported";

function getBrowserPermission(): BrowserPermission {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission as BrowserPermission;
}

async function requestBrowserPermission(): Promise<BrowserPermission> {
  if (typeof Notification === "undefined") return "unsupported";
  const result = await Notification.requestPermission();
  return result as BrowserPermission;
}

function showBrowserNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  // Solo se la finestra è in background (tab non visibile)
  if (typeof document !== "undefined" && document.visibilityState === "visible") return;
  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "mpcoach", // raggruppa, sostituisce la precedente
    });
  } catch (e) {
    console.warn("[notifications] browser notif failed:", e);
  }
}

interface NotificationCounters {
  unreadMessages: number;
  pendingReviews: number; // coach only
  newFeedback: number; // student only
  pendingExercises: number; // student only (assigned status)
}

interface NotificationsContextValue extends NotificationCounters {
  refresh: () => Promise<void>;
  browserPermission: BrowserPermission;
  requestPermission: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadMessages: 0,
  pendingReviews: 0,
  newFeedback: 0,
  pendingExercises: 0,
  refresh: async () => {},
  browserPermission: "default",
  requestPermission: async () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;

  const [counters, setCounters] = useState<NotificationCounters>({
    unreadMessages: 0,
    pendingReviews: 0,
    newFeedback: 0,
    pendingExercises: 0,
  });
  const [browserPermission, setBrowserPermission] = useState<BrowserPermission>(
    getBrowserPermission()
  );

  const requestPermission = useCallback(async () => {
    const result = await requestBrowserPermission();
    setBrowserPermission(result);
  }, []);

  // Memoizzato: cambia solo se profile.id/role cambiano. Senza memo, ad ogni
  // render del provider (es. counter update) tutti i consumer del context
  // riceverebbero un nuovo `refresh` e i loro useEffect su [refresh] si
  // ri-eseguirebbero (listener thrashing, query duplicate).
  const refresh = useCallback(async () => {
    if (!profile?.id) return;

    const isCoach = profile.role === "coach" || profile.role === "founder";

    const unreadRes = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", profile.id);

    let pendingReviews = 0;
    let newFeedback = 0;
    let pendingExercises = 0;

    if (isCoach) {
      const reviewRes = await supabase
        .from("review_queue")
        .select("*", { count: "exact", head: true });
      pendingReviews = reviewRes.count ?? 0;
    } else {
      const exRes = await supabase
        .from("exercises")
        .select("*", { count: "exact", head: true })
        .eq("student_id", profile.id)
        .eq("status", "assigned");
      pendingExercises = exRes.count ?? 0;

      const fbRes = await supabase
        .from("exercises")
        .select("*", { count: "exact", head: true })
        .eq("student_id", profile.id)
        .eq("status", "reviewed");
      newFeedback = fbRes.count ?? 0;
    }

    setCounters({
      unreadMessages: unreadRes.count ?? 0,
      pendingReviews,
      newFeedback,
      pendingExercises,
    });
  }, [profile?.id, profile?.role]);

  // Initial fetch + cambio profilo
  useEffect(() => {
    if (!profile?.id) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

  // Quando l'utente torna su un tab dopo che era in background, refetch:
  // Realtime potrebbe aver perso eventi se il client era sospeso.
  useTabVisibility(() => {
    if (profile?.id) refresh();
  });

  // Realtime subscriptions
  useEffect(() => {
    if (!profile?.id) return;
    const isCoach = profile.role === "coach" || profile.role === "founder";

    const channel = supabase.channel(`notifications:${profile.id}`);

    // chat_messages INSERT
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      (payload) => {
        const msg = payload.new as { sender_id: string; thread_id: string; body: string };
        if (msg.sender_id === profile.id) return; // sono io che ho scritto, skip

        const preview = msg.body.length > 60 ? msg.body.slice(0, 57) + "…" : msg.body;
        if (!locationRef.current.includes("/chat")) {
          toast(`Nuovo messaggio: "${preview}"`, "info");
          showBrowserNotification("Nuovo messaggio", preview);
        }
        refresh();
      }
    );

    if (isCoach) {
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        () => {
          if (!locationRef.current.includes("/coach/review")) {
            toast("Nuova take da correggere", "info");
            showBrowserNotification(
              "Nuova take",
              "Uno studente ha appena inviato una take da correggere."
            );
          }
          refresh();
        }
      );
    } else {
      // Lo studente vede il feedback solo quando status='sent' (RLS).
      // Marco fa INSERT con status='draft' poi UPDATE a 'sent' → l'evento che
      // arriva allo studente via realtime è l'UPDATE (l'INSERT è bloccato da RLS).
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "feedbacks" },
        (payload) => {
          const fb = payload.new as { status: string };
          // Solo quando il feedback diventa "sent" (Marco lo pubblica)
          if (fb.status !== "sent") return;
          if (!locationRef.current.includes("/student/feedback")) {
            toast("Nuovo feedback da Marco", "ok");
            showBrowserNotification("Nuovo feedback", "Marco ha appena risposto a una tua take.");
          }
          refresh();
        }
      );

      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "exercises" },
        (payload) => {
          const ex = payload.new as { student_id: string; title: string };
          if (ex.student_id !== profile.id) return;
          if (
            !locationRef.current.includes("/student/home") &&
            !locationRef.current.includes("/student/esercizio")
          ) {
            toast(`Nuovo esercizio: ${ex.title}`, "info");
            showBrowserNotification("Nuovo esercizio", ex.title);
          }
          refresh();
        }
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

  return (
    <NotificationsContext.Provider
      value={{ ...counters, refresh, browserPermission, requestPermission }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
