/**
 * Coach Chat — porting parziale: inbox dal DB chat_threads + thread placeholder.
 * Realtime + composer arrivano in sessione successiva.
 */

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Avatar, toast } from "../../components/ui";

interface ThreadRow {
  id: string;
  student_id: string;
  student_name: string;
  student_initials: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
}

export function CoachChat() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: threadsData } = await supabase
          .from("chat_threads")
          .select(
            `
            id,
            student_id,
            last_message_at,
            last_message_preview,
            student:profiles!chat_threads_student_id_fkey(full_name,initials)
          `
          )
          .order("last_message_at", { ascending: false, nullsFirst: false });

        if (cancelled) return;

        const rows: ThreadRow[] = (threadsData ?? []).map((t) => {
          const studentProfile = (t as { student: { full_name: string; initials: string } | { full_name: string; initials: string }[] }).student;
          const sp = Array.isArray(studentProfile) ? studentProfile[0] : studentProfile;
          return {
            id: t.id as string,
            student_id: t.student_id as string,
            student_name: sp?.full_name ?? "—",
            student_initials: sp?.initials ?? "??",
            last_message_at: (t.last_message_at as string | null) ?? null,
            last_message_preview: (t.last_message_preview as string | null) ?? null,
            unread_count: 0,
          };
        });

        setThreads(rows);
        if (rows.length > 0 && !activeId) setActiveId(rows[0].id);
      } catch (e) {
        console.error("[Chat] load:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = threads.find((t) => t.id === activeId);

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
        <div className="max-w-2xl mx-auto px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Inbox vuota
          </div>
          <h1 className="font-editorial text-[44px] mb-4">
            Nessuna <span className="italic-ember">conversazione</span>.
          </h1>
          <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto">
            Le chat 1:1 con i tuoi studenti compariranno qui appena ne avrai uno assegnato. Realtime,
            allegati video/audio e composer in arrivo nelle prossime sessioni.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-paper">
      {/* Inbox */}
      <div className="w-[340px] flex-shrink-0 bg-paper-2 border-r border-line flex flex-col">
        <div className="px-5 py-5 border-b border-line">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
            conversazioni
          </div>
          <h2 className="font-editorial text-[30px]">
            Chat · <span className="italic-ember">{threads.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {threads.map((t) => {
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
                <Avatar initials={t.student_initials} size={44} tone="ink" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[16px] truncate">{t.student_name}</div>
                  <div className="text-[12px] text-smoke truncate mt-0.5">
                    {t.last_message_preview ?? <span className="italic">Nessun messaggio ancora</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            <div className="px-7 py-4 border-b border-line bg-paper-2 flex items-center gap-3">
              <Avatar initials={active.student_initials} size={42} tone="ember" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-[20px] truncate">{active.student_name}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-0.5">
                  studente
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-center px-10">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                  Thread vuoto
                </div>
                <p className="text-smoke text-[14px] max-w-md">
                  Composer (con allegati video/audio) e cronologia messaggi realtime arrivano nella
                  prossima sessione di porting. Per ora l'inbox è funzionante e i thread sono creati
                  automaticamente quando uno studente viene assegnato a un coach.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-line bg-paper-2">
              <button
                onClick={() => toast("Composer chat · in arrivo", "info")}
                className="w-full h-11 bg-paper border border-line rounded-[2px] text-smoke font-mono text-[12px] uppercase tracking-wider hover:text-ink hover:border-ink transition"
              >
                Scrivi un messaggio (in arrivo)
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-smoke text-[13px]">
            Seleziona una conversazione
          </div>
        )}
      </div>
    </div>
  );
}
