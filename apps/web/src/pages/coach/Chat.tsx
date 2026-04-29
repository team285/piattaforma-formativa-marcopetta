/**
 * Coach Chat — porting parziale: inbox dal DB chat_threads + thread placeholder.
 * Realtime + composer arrivano in sessione successiva.
 */

import { useEffect, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { Avatar, Icon, toast } from "../../components/ui";

interface ThreadRow {
  id: string;
  student_id: string;
  student_name: string;
  student_initials: string;
  last_message_at: string | null;
  last_message_preview: string | null;
}

export function CoachChat() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Lista chat_threads (no join — semplice)
      const threadsRes = await withTimeout(
        supabase
          .from("chat_threads")
          .select("id,student_id,last_message_at,last_message_preview")
          .order("last_message_at", { ascending: false, nullsFirst: false }),
        6000,
        { data: [] as Array<{ id: string; student_id: string; last_message_at: string | null; last_message_preview: string | null }>, error: null },
        "chat_threads.list"
      );

      if (cancelled) return;
      const threadsRaw = threadsRes.data ?? [];

      if (threadsRaw.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }

      // 2. Per ogni thread, carica il profile dello studente con una query separata
      const studentIds = threadsRaw.map((t) => t.student_id);
      const profilesRes = await withTimeout(
        supabase
          .from("profiles")
          .select("id,full_name,initials")
          .in("id", studentIds),
        6000,
        { data: [] as Array<{ id: string; full_name: string; initials: string }>, error: null },
        "profiles.in"
      );

      if (cancelled) return;
      const profileById = new Map<string, { full_name: string; initials: string }>();
      (profilesRes.data ?? []).forEach((p) => {
        profileById.set(p.id, { full_name: p.full_name, initials: p.initials });
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
        };
      });

      setThreads(rows);
      if (rows.length > 0 && !activeId) setActiveId(rows[0].id);
      setLoading(false);
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

      <div className={"flex-1 flex-col " + (active ? "flex" : "hidden md:flex")}>
        {active ? (
          <>
            <div className="px-4 md:px-7 py-4 border-b border-line bg-paper-2 flex items-center gap-3">
              <button
                onClick={() => setActiveId(null)}
                aria-label="Torna a inbox"
                className="md:hidden w-8 h-8 -ml-1 flex items-center justify-center text-smoke"
              >
                <Icon name="chevronl" size={14} />
              </button>
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
                  prossima sessione di porting.
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
