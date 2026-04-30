/**
 * Student Chat — thread 1:1 col coach assegnato. Realtime via ChatThread.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { usePageTitle } from "../../lib/hooks";
import { ChatThread } from "../../components/chat/ChatThread";

interface ThreadInfo {
  id: string;
  coach_id: string;
  coach_name: string;
  coach_initials: string;
}

export function StudentChat() {
  usePageTitle("Chat con Marco");
  const { profile } = useAuth();
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Trova il thread
      const threadRes = await withTimeout(
        supabase
          .from("chat_threads")
          .select("id,coach_id")
          .eq("student_id", profile.id)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
        5000,
        { data: null as { id: string; coach_id: string } | null, error: null },
        "student_chat.thread"
      );
      if (cancelled) return;
      const t = threadRes.data;
      if (!t) {
        setThread(null);
        setLoading(false);
        return;
      }

      // 2. Profilo coach
      const coachRes = await withTimeout(
        supabase.from("profiles").select("id,full_name,initials").eq("id", t.coach_id).maybeSingle(),
        5000,
        { data: null as { id: string; full_name: string; initials: string } | null, error: null },
        "student_chat.coach"
      );
      if (cancelled) return;
      const coach = coachRes.data;
      setThread({
        id: t.id,
        coach_id: t.coach_id,
        coach_name: coach?.full_name ?? "—",
        coach_initials: coach?.initials ?? "??",
      });
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED]">
        <div className="font-mono text-[12px] text-smoke">Caricamento chat…</div>
      </div>
    );
  }

  if (!thread || !profile?.id) {
    return (
      <div className="min-h-screen bg-[#F5F3ED]">
        <div className="max-w-2xl mx-auto px-5 md:px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Chat non ancora attiva
          </div>
          <h1 className="font-editorial text-[36px] md:text-[44px] mb-4 leading-tight">
            Nessun <span className="italic-ember">coach</span> assegnato.
          </h1>
          <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto mb-8">
            Quando Marco ti assegnerà un coach, qui si aprirà la chat 1:1 — testo, video, audio.
          </p>
          <Link
            to="/student/home"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition"
          >
            Torna al piano
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-chat-mobile"
      style={{ background: "#F5F3ED" }}
    >
      <ChatThread
        threadId={thread.id}
        peerId={thread.coach_id}
        peerName={thread.coach_name}
        peerInitials={thread.coach_initials}
        meId={profile.id}
      />
    </div>
  );
}
