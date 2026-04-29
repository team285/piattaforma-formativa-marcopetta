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

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
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

  const requestPermission = async () => {
    const result = await requestBrowserPermission();
    setBrowserPermission(result);
  };

  const refresh = async () => {
    if (!profile?.id) return;

    const isCoach = profile.role === "coach" || profile.role === "founder";

    // 1. Unread chat messages (sender != me, read_at null) — RLS filtra ai propri thread
    const unreadRes = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", profile.id);

    let pendingReviews = 0;
    let newFeedback = 0;
    let pendingExercises = 0;

    if (isCoach) {
      // Submissions senza feedback (review_queue) — RLS filtra ai propri studenti
      const reviewRes = await supabase
        .from("review_queue")
        .select("*", { count: "exact", head: true });
      pendingReviews = reviewRes.count ?? 0;
    } else {
      // Studente: esercizi assegnati pending
      const exRes = await supabase
        .from("exercises")
        .select("*", { count: "exact", head: true })
        .eq("student_id", profile.id)
        .eq("status", "assigned");
      pendingExercises = exRes.count ?? 0;

      // Feedback "reviewed" non ancora aperti — proxy: count exercises status='reviewed'
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
  };

  // Initial fetch + cambio profilo
  useEffect(() => {
    if (!profile?.id) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role]);

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
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedbacks" },
        () => {
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
