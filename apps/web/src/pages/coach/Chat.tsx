/**
 * Coach Chat — inbox + thread reale con realtime.
 *
 * Inbox (sx) lista chat_threads con preview ultimo messaggio + counter unread.
 * Thread (dx) usa ChatThread component (stesso usato dallo studente).
 *
 * Mobile: inbox e thread sono mutually exclusive (cliccando uno studente
 * sostituisce l'inbox). Desktop: side-by-side.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { formatRelativeTime, usePageTitle } from "../../lib/hooks";
import { Avatar } from "../../components/ui";
import { ChatThread } from "../../components/chat/ChatThread";

interface ThreadRow {
  id: string;
  student_id: string;
  student_name: string;
  student_initials: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread: number;
}

export function CoachChat() {
  usePageTitle("Chat");
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Lista chat_threads
      const threadsRes = await withTimeout(
        supabase
          .from("chat_threads")
          .select("id,student_id,last_message_at,last_message_preview")
          .order("last_message_at", { ascending: false, nullsFirst: false }),
        6000,
        {
          data: [] as Array<{
            id: string;
            student_id: string;
            last_message_at: string | null;
            last_message_preview: string | null;
          }>,
          error: null,
        },
        "coach_chat.threads"
      );
      if (cancelled) return;
      const threadsRaw = threadsRes.data ?? [];

      if (threadsRaw.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }

      // 2. Profili studenti
      const studentIds = threadsRaw.map((t) => t.student_id);
      const profilesRes = await withTimeout(
        supabase.from("profiles").select("id,full_name,initials").in("id", studentIds),
        6000,
        { data: [] as Array<{ id: string; full_name: string; initials: string }>, error: null },
        "coach_chat.profiles"
      );
      if (cancelled) return;

      const profileById = new Map<string, { full_name: string; initials: string }>();
      (profilesRes.data ?? []).forEach((p) => {
        profileById.set(p.id, { full_name: p.full_name, initials: p.initials });
      });

      // 3. Count unread per ogni thread (solo messaggi non miei, non letti)
      const threadIds = threadsRaw.map((t) => t.id);
      const unreadRes = await withTimeout(
        supabase
          .from("chat_messages")
          .select("thread_id,sender_id,read_at")
          .in("thread_id", threadIds)
          .is("read_at", null)
          .neq("sender_id", profile.id),
        6000,
        { data: [] as Array<{ thread_id: string; sender_id: string }>, error: null },
        "coach_chat.unread"
      );
      if (cancelled) return;

      const unreadByThread = new Map<string, number>();
      (unreadRes.data ?? []).forEach((m) => {
        unreadByThread.set(m.thread_id, (unreadByThread.get(m.thread_id) ?? 0) + 1);
      });

      const rows: ThreadRow[] = threadsRaw.map((t) => {
        const p = profileById.get(t.student_id);
        return {
          id: t.id,
          student_id: t.student_id,
          student_name: p?.full_name ?? "—",
          student_initials: p?.initials ?? "??",
          last_message_at: t.last_message_at,
          last_message_preview: t.last_message_preview,
          unread: unreadByThread.get(t.id) ?? 0,
        };
      });

      setThreads(rows);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const active = threads.find((t) => t.id === activeId);

  // Filtra inbox per search
  const q = search.trim().toLowerCase();
  const filtered = q ? threads.filter((t) => t.student_name.toLowerCase().includes(q)) : threads;

  if (loading) {
    return (
      <div className="min-h-full bg-paper flex items-center justify-center">
        <div className="text-smoke font-mono text-[12px]">Caricamento chat…</div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="min-h-full bg-paper">
        <div className="max-w-2xl mx-auto px-5 md:px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Inbox vuota
          </div>
          <h1 className="font-editorial text-[36px] md:text-[44px] mb-4 leading-tight">
            Nessuna <span className="italic-ember">conversazione</span>.
          </h1>
          <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto">
            Le chat 1:1 con i tuoi studenti compariranno qui appena ne avrai uno assegnato. Quando
            invii un nuovo studente, il thread viene creato automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-chat-mobile bg-paper">
      {/* Inbox */}
      <div
        className={
          "w-full md:w-[340px] flex-shrink-0 bg-paper-2 border-r border-line flex-col " +
          (activeId ? "hidden md:flex" : "flex")
        }
      >
        <div className="px-5 py-5 border-b border-line">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
            conversazioni
          </div>
          <h2 className="font-editorial text-[30px]">
            Chat · <span className="italic-ember">{threads.length}</span>
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca studente…"
            className="mt-3 w-full h-9 px-3 bg-paper border border-line rounded-[2px] text-[13px] outline-none focus:border-ink"
          />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filtered.map((t) => {
            const on = t.id === activeId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={
                  "w-full flex items-start gap-3 px-4 py-3 border-b border-line text-left transition " +
                  (on ? "bg-paper border-l-[3px] border-l-[var(--amber)]" : "hover:bg-paper")
                }
              >
                <Avatar initials={t.student_initials} size={44} tone={t.unread > 0 ? "ember" : "ink"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-display text-[16px] truncate">{t.student_name}</div>
                    {t.last_message_at && (
                      <div className="font-mono text-[10px] text-smoke flex-shrink-0">
                        {formatRelativeTime(t.last_message_at)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-[12px] text-smoke truncate flex-1">
                      {t.last_message_preview ?? (
                        <span className="italic">Nessun messaggio ancora</span>
                      )}
                    </div>
                    {t.unread > 0 && (
                      <span
                        className="flex-shrink-0 min-w-[18px] h-[18px] px-[5px] rounded-full bg-[var(--amber)] text-ink font-mono text-[10px] font-bold flex items-center justify-center"
                      >
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-smoke text-[13px] py-10 px-6">
              Nessun risultato per "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={"flex-1 flex-col " + (active ? "flex" : "hidden md:flex")}>
        {active && profile?.id ? (
          <ChatThread
            threadId={active.id}
            peerId={active.student_id}
            peerName={active.student_name}
            peerInitials={active.student_initials}
            meId={profile.id}
            onBack={() => setActiveId(null)}
            onPeerClick={() => navigate(`/coach/studenti/${active.student_id}`)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-smoke text-[13px]">
            Seleziona una conversazione
          </div>
        )}
      </div>
    </div>
  );
}
