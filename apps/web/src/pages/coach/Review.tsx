/**
 * Coach Review — porting parziale: lista coda dal review_queue, click drill-down placeholder.
 * Player + annotazioni full feature arrivano in sessione successiva (richiede video upload).
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { Avatar, EditorialH, Icon, Tag, Thumb } from "../../components/ui";

interface QueueItem {
  submission_id: string;
  student_name: string;
  student_initials: string;
  exercise_title: string;
  bpm: number | null;
  duration_seconds: number | null;
  hours_waiting: number;
}

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const formatWaiting = (h: number) => {
  if (h < 1) return "ora";
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}g`;
};

export function CoachReview() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await withTimeout(
        supabase.from("review_queue").select("*").order("submitted_at", { ascending: true }),
        6000,
        { data: [] as QueueItem[], error: null },
        "review.queue"
      );
      if (cancelled) return;
      setQueue(((res.data as QueueItem[]) ?? []));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-10">
        <div className="flex items-end justify-between mb-8">
          <EditorialH kicker="Da correggere">
            Coda video <span className="italic-ember">in attesa</span>
          </EditorialH>
        </div>

        {loading ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center text-smoke text-[13px]">
            Caricamento coda…
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Coda vuota
            </div>
            <h2 className="font-editorial text-[28px] mb-3">
              Niente da <span className="italic-ember">correggere</span>.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Quando uno studente invierà una take, comparirà qui in ordine di attesa. Ogni take
              da correggere include video, esercizio assegnato e tempo di attesa.
            </p>
          </div>
        ) : (
          <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
            {queue.map((q) => (
              <Link
                key={q.submission_id}
                to={`/coach/review/${q.submission_id}`}
                className="w-full flex items-center gap-5 p-5 hover:bg-sand transition border-t border-line first:border-t-0 group"
              >
                <Avatar
                  initials={q.student_initials}
                  size={46}
                  tone={q.hours_waiting > 24 ? "ember" : "ink"}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display text-xl">{q.student_name}</span>
                    {q.hours_waiting > 24 && (
                      <Tag>
                        <span className="text-[var(--ember)]">in ritardo</span>
                      </Tag>
                    )}
                  </div>
                  <div className="text-[13px] text-smoke truncate">
                    {q.exercise_title}
                    {q.bpm ? ` · bpm ${q.bpm}` : ""}
                  </div>
                </div>
                <Thumb
                  label={"take · " + formatDuration(q.duration_seconds)}
                  dark
                  aspect="16/9"
                  className="w-40 hidden md:block"
                />
                <div className="text-right">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-smoke mb-1">
                    in attesa
                  </div>
                  <div className="text-[14px]">{formatWaiting(q.hours_waiting)}</div>
                </div>
                <Icon name="chevron" size={14} className="text-smoke group-hover:text-ink transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
