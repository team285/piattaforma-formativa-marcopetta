/**
 * Student Home — "Il tuo piano della settimana"
 *
 * Mostra:
 *  - Card percorso attivo (students.path_label, path_start_date, path_end_date)
 *  - Esercizi pending del studente loggato
 *  - Esercizi con feedback nuovo (status='reviewed' e non ancora visti)
 *
 * Quando il DB è vuoto → empty state pulito.
 * Le lezioni assegnate non hanno tabella dedicata ancora — empty state con
 * messaggio: "Marco ti assegnerà le tue lezioni quando configurerà il piano".
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { EditorialH, StatusPill, Tag, Icon } from "../../components/ui";

interface ExerciseRow {
  id: string;
  title: string;
  instructions: string | null;
  bpm: number | null;
  due_date: string | null;
  status: "assigned" | "submitted" | "reviewed" | "skipped";
  has_new_feedback: boolean;
}

interface PathInfo {
  path_label: string | null;
  path_start_date: string | null;
  path_end_date: string | null;
  level: string | null;
  progress_pct: number | null;
}

export function StudentHome() {
  const { profile } = useAuth();
  const [path, setPath] = useState<PathInfo | null>(null);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      const [studentRes, exercisesRes] = await Promise.all([
        withTimeout(
          supabase
            .from("students")
            .select("path_label,path_start_date,path_end_date,level,progress_pct")
            .eq("id", profile.id)
            .maybeSingle(),
          5000,
          { data: null, error: null },
          "student.path"
        ),
        withTimeout(
          supabase
            .from("exercises")
            .select("id,title,instructions,bpm,due_date,status")
            .eq("student_id", profile.id)
            .in("status", ["assigned", "submitted", "reviewed"])
            .order("due_date", { ascending: true, nullsFirst: false })
            .limit(20),
          5000,
          { data: [] as Array<{ id: string; title: string; instructions: string | null; bpm: number | null; due_date: string | null; status: ExerciseRow["status"] }>, error: null },
          "student.exercises"
        ),
      ]);
      if (cancelled) return;

      const studentData = studentRes.data;
      if (studentData) {
        setPath({
          path_label: studentData.path_label,
          path_start_date: studentData.path_start_date,
          path_end_date: studentData.path_end_date,
          level: studentData.level,
          progress_pct: studentData.progress_pct,
        });
      }

      const rows: ExerciseRow[] = (exercisesRes.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        instructions: e.instructions,
        bpm: e.bpm,
        due_date: e.due_date,
        status: e.status,
        has_new_feedback: e.status === "reviewed",
      }));
      setExercises(rows);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const firstName = profile?.full_name.split(" ")[0] ?? "Studente";
  const todayLabel = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hasNewFb = exercises.some((e) => e.has_new_feedback);

  // Calcolo "giorni residui" e progresso percorso
  const daysLeft = path?.path_end_date
    ? Math.max(0, Math.ceil((new Date(path.path_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const totalDays = path?.path_start_date && path?.path_end_date
    ? Math.max(1, Math.ceil((new Date(path.path_end_date).getTime() - new Date(path.path_start_date).getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const elapsedDays = totalDays && daysLeft !== null ? Math.max(0, totalDays - daysLeft) : null;
  const progressPct = path?.progress_pct ?? (totalDays && elapsedDays !== null ? Math.round((elapsedDays / totalDays) * 100) : 0);

  if (loading) {
    return (
      <div className="min-h-full bg-paper flex items-center justify-center">
        <div className="font-mono text-[12px] text-smoke">Caricamento piano…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-5 md:px-12 py-8 md:py-14">
        {/* Hero */}
        <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-3 md:mb-5">
              {todayLabel}
            </div>
            <h1 className="font-editorial text-[36px] md:text-[64px] max-w-[780px] leading-[1.05] md:leading-[1.02]">
              Ciao {firstName}. Ecco cosa <span className="italic-ember">senti</span>
              <br />
              questa <span className="italic-ember">settimana</span>.
            </h1>
          </div>
          {hasNewFb && (
            <Link
              to="/student/feedback"
              className="group flex items-center gap-3 bg-[var(--ember)] text-white px-4 h-11 rounded-[2px] hover:bg-[var(--ember-2)] transition"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="font-medium text-[13px]">Nuovo feedback da Marco</span>
              <Icon name="arrow" size={15} />
            </Link>
          )}
        </div>

        {/* Card percorso attivo */}
        {path?.path_label ? (
          <div className="bg-ink text-paper rounded-[3px] p-5 md:p-8 mb-10 md:mb-14 relative overflow-hidden">
            <div
              className="absolute -right-24 -top-24 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(242,183,68,0.25), transparent 60%)" }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              <div className="md:col-span-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-3">
                  Percorso attivo
                </div>
                <div className="font-display text-3xl leading-tight mb-1">{path.path_label}</div>
                <div className="text-sm text-[#C9C9D0]">
                  {path.level ? `${path.level} · ` : ""}one-to-one con Marco Petta
                </div>
              </div>
              {path.path_end_date && (
                <div className="md:col-span-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-3">
                    Attivo fino al
                  </div>
                  <div className="font-display text-2xl">
                    {new Date(path.path_end_date).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  {daysLeft !== null && (
                    <div className="text-sm text-[#C9C9D0]">— {daysLeft} giorni residui</div>
                  )}
                </div>
              )}
              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">
                    Avanzamento
                  </span>
                  <span className="font-mono text-[11px] text-[#C9C9D0]">{progressPct}%</span>
                </div>
                <div className="h-[3px] w-full bg-[#3A2E27] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--ember)]" style={{ width: progressPct + "%" }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-paper-2 border border-line rounded-[3px] p-10 mb-14 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Percorso non ancora configurato
            </div>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Marco completerà il tuo percorso (durata, livello, obiettivi) e qui vedrai il riepilogo.
            </p>
          </div>
        )}

        {/* Esercizi assegnati */}
        <div className="border-t border-line pt-10">
          <div className="flex items-end justify-between mb-6">
            <EditorialH kicker="Esercizi assegnati">
              {exercises.length === 0 ? (
                <>Nessun <span className="italic-ember">esercizio</span> ancora.</>
              ) : exercises.length === 1 ? (
                <>Un <span className="italic-ember">esercizio</span> da registrare.</>
              ) : (
                <><span className="italic-ember">{exercises.length}</span> cose da registrare.</>
              )}
            </EditorialH>
          </div>

          {exercises.length === 0 ? (
            <div className="bg-paper-2 border border-line rounded-[3px] p-12 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                Inbox vuota
              </div>
              <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
                Quando Marco ti assegnerà un esercizio comparirà qui con istruzioni e scadenza. Per
                ora puoi guardare la libreria nelle tue lezioni.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {exercises.map((ex) => (
                <Link
                  key={ex.id}
                  to={
                    ex.status === "reviewed"
                      ? `/student/feedback?ex=${ex.id}`
                      : `/student/esercizio?ex=${ex.id}`
                  }
                  className="text-left bg-paper-2 border border-line rounded-[3px] p-6 hover:border-ink transition relative block"
                >
                  {ex.has_new_feedback && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-[var(--ember)]" />
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <StatusPill status={ex.status === "reviewed" ? "feedback" : ex.status === "submitted" ? "delivered" : "assigned"} />
                    {ex.bpm && <Tag>bpm {ex.bpm}</Tag>}
                  </div>
                  <div className="font-display text-2xl leading-[1.15] mb-3">{ex.title}</div>
                  {ex.instructions && (
                    <div className="text-[13px] text-smoke italic mb-4 line-clamp-2">
                      "{ex.instructions}"
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[12px] pt-3 border-t border-line">
                    <span className="font-mono uppercase tracking-wider text-smoke">
                      {ex.due_date
                        ? `Entro ${new Date(ex.due_date).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                          })}`
                        : "Senza scadenza"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink font-medium">
                      {ex.status === "reviewed"
                        ? "Vedi feedback"
                        : ex.status === "submitted"
                          ? "In review"
                          : "Registra"}{" "}
                      <Icon name="chevron" size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
