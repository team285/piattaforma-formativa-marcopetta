/**
 * Coach Dashboard — porting nativo da prototipo (coach_dashboard.jsx)
 * connesso al DB Supabase reale.
 *
 * KPI calcolati live:
 *  - activeStudents: count studenti attivi negli ultimi 7gg (tutti se founder, solo i propri se coach)
 *  - toReview: count submissions in attesa nella review_queue
 *  - unreadMsgs: count chat_messages non letti diretti all'utente
 *  - studentsCount: count totale studenti seguiti (per disambiguare 14 vs 28)
 *
 * Coda video: lette dalla view review_queue (con join su students/exercises).
 *
 * Sezione "Approfondisci" (analytics): per ora placeholder "in arrivo",
 * la implementeremo quando ci sono dati reali.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, EditorialH, Icon, StatCard, Tag, Thumb } from "../../components/ui";

interface DashboardKpis {
  activeStudents: number;
  studentsTotal: number;
  toReview: number;
  unreadMsgs: number;
  expiringMonth: number;
}

interface QueueItem {
  submission_id: string;
  student_name: string;
  student_initials: string;
  exercise_title: string;
  bpm: number | null;
  duration_seconds: number | null;
  hours_waiting: number;
  submitted_at: string;
}

const formatDuration = (sec: number | null) => {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatWaiting = (hours: number) => {
  if (hours < 1) return "ora";
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}g`;
};

export function CoachDashboard() {
  const { profile } = useAuth();
  const [kpi, setKpi] = useState<DashboardKpis>({
    activeStudents: 0,
    studentsTotal: 0,
    toReview: 0,
    unreadMsgs: 0,
    expiringMonth: 0,
  });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const today = new Date().toISOString().slice(0, 10);
      const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      // Lanciamo tutte le KPI in parallelo, ognuna con il proprio timeout
      const [studentsTotalRes, activeRes, queueRes, unreadRes, expiringRes] = await Promise.all([
        withTimeout(
          supabase.from("students").select("*", { count: "exact", head: true }),
          5000,
          { count: 0, error: null } as { count: number | null; error: null },
          "dash.studentsTotal"
        ),
        withTimeout(
          supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .gte("last_active_at", sevenDaysAgo),
          5000,
          { count: 0, error: null } as { count: number | null; error: null },
          "dash.active"
        ),
        withTimeout(
          supabase
            .from("review_queue")
            .select("*", { count: "exact" })
            .order("submitted_at", { ascending: true })
            .limit(20),
          5000,
          { data: [] as QueueItem[], count: 0, error: null } as { data: QueueItem[]; count: number | null; error: null },
          "dash.queue"
        ),
        withTimeout(
          supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .is("read_at", null)
            .neq("sender_id", profile.id),
          5000,
          { count: 0, error: null } as { count: number | null; error: null },
          "dash.unread"
        ),
        withTimeout(
          supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .gte("path_end_date", today)
            .lte("path_end_date", in30),
          5000,
          { count: 0, error: null } as { count: number | null; error: null },
          "dash.expiring"
        ),
      ]);

      if (cancelled) return;

      setKpi({
        studentsTotal: studentsTotalRes.count ?? 0,
        activeStudents: activeRes.count ?? 0,
        toReview: queueRes.count ?? 0,
        unreadMsgs: unreadRes.count ?? 0,
        expiringMonth: expiringRes.count ?? 0,
      });
      setQueue(((queueRes.data as QueueItem[]) ?? []));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const oldestWaiting = queue[0];
  const firstName = profile?.full_name?.split(" ")[0] || "Marco";
  const todayLabel = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8 md:py-10">
        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-3">
              {todayLabel}
            </div>
            <h1 className="font-editorial text-[36px] md:text-[56px] leading-[1.05]">
              Buongiorno <span className="italic-ember">{firstName}</span>.
            </h1>
          </div>
          <div className="md:text-right text-sm text-smoke md:max-w-[300px]">
            {kpi.toReview > 0 ? (
              <>
                <span className="text-ink">
                  {kpi.toReview} {kpi.toReview === 1 ? "video" : "video"}
                </span>{" "}
                {kpi.toReview === 1 ? "ti aspetta" : "ti aspettano"}.
                {oldestWaiting && (
                  <>
                    {" "}
                    Il più vecchio è di{" "}
                    <span className="text-[var(--ember)] font-medium">
                      {oldestWaiting.student_name.split(" ")[0]}
                    </span>
                    , {formatWaiting(oldestWaiting.hours_waiting)} fa.
                  </>
                )}
              </>
            ) : (
              <>Nessun video da correggere. Tutto a posto.</>
            )}
          </div>
        </div>

        {/* KPI OPERATIVI */}
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          Oggi
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
          <StatCard
            label="Attivi questa settimana"
            value={loading ? "—" : kpi.activeStudents}
            sub={`su ${kpi.studentsTotal} studenti totali`}
          />
          <StatCard
            label="Video da correggere"
            value={loading ? "—" : kpi.toReview}
            sub={kpi.toReview > 0 ? "in coda" : "tutto a posto"}
            ember={kpi.toReview > 0}
          />
          <StatCard
            label="Messaggi non letti"
            value={loading ? "—" : kpi.unreadMsgs}
            sub="in chat 1:1"
          />
          <StatCard
            label="Percorsi in scadenza"
            value={loading ? "—" : kpi.expiringMonth}
            sub="entro 30 giorni"
          />
        </div>

        {/* Priority queue */}
        <div className="flex items-end justify-between mb-5">
          <EditorialH kicker="Priorità di oggi">
            Coda video da <span className="italic-ember">correggere</span>
          </EditorialH>
          {queue.length > 0 && (
            <Link
              to="/coach/review"
              className="h-8 px-3 border border-line rounded-[2px] text-[12px] text-smoke hover:text-ink inline-flex items-center"
            >
              Apri tutti ({queue.length})
            </Link>
          )}
        </div>

        <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden mb-12">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-smoke">Caricamento…</div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                Coda vuota
              </div>
              <p className="text-smoke text-[14px] max-w-md mx-auto">
                Nessuno studente ha ancora inviato una take. Quando ne riceverai una, comparirà qui in
                ordine di attesa.
              </p>
            </div>
          ) : (
            queue.slice(0, 10).map((q) => (
              <Link
                key={q.submission_id}
                to={`/coach/review/${q.submission_id}`}
                className="w-full flex items-center gap-5 p-5 hover:bg-sand transition border-t border-line first:border-t-0 group"
              >
                <Avatar initials={q.student_initials} size={46} tone={q.hours_waiting > 24 ? "ember" : "ink"} />
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
                <div className="hidden md:block">
                  <Thumb
                    label={"take · " + formatDuration(q.duration_seconds)}
                    dark
                    aspect="16/9"
                    className="w-40"
                  />
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-smoke mb-1">
                    in attesa
                  </div>
                  <div className="text-[14px]">{formatWaiting(q.hours_waiting)}</div>
                </div>
                <Icon name="chevron" size={14} className="text-smoke group-hover:text-ink transition" />
              </Link>
            ))
          )}
        </div>

        {/* Approfondisci — placeholder per ora */}
        <div className="mt-16 mb-6">
          <EditorialH kicker="Approfondisci">
            L'andamento della <span className="italic-ember">classe</span>
          </EditorialH>
        </div>

        <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            In arrivo
          </div>
          <p className="text-smoke text-[14px] max-w-lg mx-auto leading-relaxed">
            Trend, radar di classe, heatmap degli invii e leaderboard saranno calcolati automaticamente
            quando la classe avrà generato abbastanza dati.
            <br />
            Per ora il database è ancora vuoto — è normale. Inizierà a popolarsi appena i primi studenti
            useranno l'app.
          </p>
        </div>
      </div>
    </div>
  );
}
