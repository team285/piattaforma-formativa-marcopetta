/**
 * Coach StudentDetail — drill-down /coach/studenti/:id
 *
 * Mostra il profilo completo dello studente:
 *  - Header: nome, livello, percorso, last_active
 *  - Tabs: Esercizi assegnati / Submissions / Feedback
 *  - Bottoni: + Assegna esercizio (drawer), Apri chat
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, EmberButton, Icon, StatusPill, Tag, toast } from "../../components/ui";

interface StudentInfo {
  id: string;
  full_name: string;
  email: string;
  initials: string;
  level: string | null;
  path_label: string | null;
  path_end_date: string | null;
  progress_pct: number | null;
  last_active_at: string | null;
}

interface ExerciseRow {
  id: string;
  title: string;
  bpm: number | null;
  due_date: string | null;
  status: "assigned" | "submitted" | "reviewed" | "skipped";
}

interface SubmissionRow {
  id: string;
  exercise_id: string;
  exercise_title: string;
  take_number: number;
  duration_seconds: number | null;
  submitted_at: string;
  reviewed: boolean;
}

type Tab = "exercises" | "submissions";

export function CoachStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [tab, setTab] = useState<Tab>("exercises");
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Profilo + students info
      const [profileRes, studentRes, exercisesRes, submissionsRes] = await Promise.all([
        withTimeout(
          supabase.from("profiles").select("id,full_name,email,initials").eq("id", id).maybeSingle(),
          5000,
          { data: null as { id: string; full_name: string; email: string; initials: string } | null, error: null },
          "stud_detail.profile"
        ),
        withTimeout(
          supabase
            .from("students")
            .select("id,level,path_label,path_end_date,progress_pct,last_active_at")
            .eq("id", id)
            .maybeSingle(),
          5000,
          {
            data: null as {
              id: string;
              level: string | null;
              path_label: string | null;
              path_end_date: string | null;
              progress_pct: number | null;
              last_active_at: string | null;
            } | null,
            error: null,
          },
          "stud_detail.student"
        ),
        withTimeout(
          supabase
            .from("exercises")
            .select("id,title,bpm,due_date,status")
            .eq("student_id", id)
            .order("created_at", { ascending: false })
            .limit(50),
          5000,
          { data: [] as Array<{ id: string; title: string; bpm: number | null; due_date: string | null; status: ExerciseRow["status"] }>, error: null },
          "stud_detail.exercises"
        ),
        withTimeout(
          supabase
            .from("submissions")
            .select("id,exercise_id,take_number,duration_seconds,submitted_at")
            .eq("student_id", id)
            .order("submitted_at", { ascending: false })
            .limit(50),
          5000,
          { data: [] as Array<{ id: string; exercise_id: string; take_number: number; duration_seconds: number | null; submitted_at: string }>, error: null },
          "stud_detail.submissions"
        ),
      ]);
      if (cancelled) return;

      const p = profileRes.data;
      const s = studentRes.data;
      if (p && s) {
        setStudent({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          initials: p.initials,
          level: s.level,
          path_label: s.path_label,
          path_end_date: s.path_end_date,
          progress_pct: s.progress_pct,
          last_active_at: s.last_active_at,
        });
      }

      const exs = exercisesRes.data ?? [];
      setExercises(exs);

      const subsRaw = submissionsRes.data ?? [];
      const exTitles = new Map<string, string>();
      exs.forEach((e) => exTitles.set(e.id, e.title));

      // Per submissions extra titoli (esercizi non in lista 50 esercizi) lookup veloce
      const missingExIds = subsRaw
        .map((s) => s.exercise_id)
        .filter((eid) => !exTitles.has(eid));
      if (missingExIds.length > 0) {
        const titlesRes = await withTimeout(
          supabase.from("exercises").select("id,title").in("id", missingExIds),
          5000,
          { data: [] as Array<{ id: string; title: string }>, error: null },
          "stud_detail.ex_titles"
        );
        if (cancelled) return;
        (titlesRes.data ?? []).forEach((e) => exTitles.set(e.id, e.title));
      }

      // Quali submissions hanno feedback
      const subIds = subsRaw.map((s) => s.id);
      const reviewedSet = new Set<string>();
      if (subIds.length > 0) {
        const fbRes = await withTimeout(
          supabase.from("feedbacks").select("submission_id").in("submission_id", subIds),
          5000,
          { data: [] as Array<{ submission_id: string }>, error: null },
          "stud_detail.feedbacks"
        );
        if (cancelled) return;
        (fbRes.data ?? []).forEach((f) => reviewedSet.add(f.submission_id));
      }

      setSubmissions(
        subsRaw.map((s) => ({
          id: s.id,
          exercise_id: s.exercise_id,
          exercise_title: exTitles.get(s.exercise_id) ?? "—",
          take_number: s.take_number,
          duration_seconds: s.duration_seconds,
          submitted_at: s.submitted_at,
          reviewed: reviewedSet.has(s.id),
        }))
      );

      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  if (loading) {
    return (
      <div className="min-h-full bg-paper flex items-center justify-center">
        <div className="font-mono text-[12px] text-smoke">Caricamento profilo studente…</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-full bg-paper">
        <div className="max-w-2xl mx-auto px-5 md:px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Studente non trovato
          </div>
          <h1 className="font-editorial text-[44px] mb-4">Profilo non disponibile.</h1>
          <Link
            to="/coach/studenti"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink"
          >
            <Icon name="chevronl" size={13} /> Torna a studenti
          </Link>
        </div>
      </div>
    );
  }

  const exCount = exercises.length;
  const subCount = submissions.length;

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6 md:py-8">
        {/* Breadcrumb */}
        <Link
          to="/coach/studenti"
          className="flex items-center gap-2 text-[13px] text-smoke hover:text-ink mb-6"
        >
          <Icon name="chevronl" size={13} /> Torna a studenti
        </Link>

        {/* Header studente */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 pb-6 border-b border-line mb-8">
          <div className="flex items-start gap-4">
            <Avatar initials={student.initials} size={64} tone="ember" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1">
                Studente
              </div>
              <h1 className="font-editorial text-[36px] md:text-[44px] leading-[1.05] truncate">
                {student.full_name}
              </h1>
              <div className="font-mono text-[11px] text-smoke mt-2">{student.email}</div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {student.level && <Tag>{student.level}</Tag>}
                {student.path_label && <Tag>{student.path_label}</Tag>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            <EmberButton icon="plus" onClick={() => setAssignOpen(true)}>
              Assegna esercizio
            </EmberButton>
            <Link
              to="/coach/chat"
              className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition inline-flex items-center gap-2"
            >
              <Icon name="chat" size={13} /> Apri chat
            </Link>
          </div>
        </div>

        {/* Stats compatte */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Stat label="Esercizi assegnati" value={exCount} />
          <Stat label="Take inviate" value={subCount} />
          <Stat
            label="Da correggere"
            value={submissions.filter((s) => !s.reviewed).length}
            ember={submissions.some((s) => !s.reviewed)}
          />
          <Stat label="Avanzamento percorso" value={`${student.progress_pct ?? 0}%`} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-paper-2 border border-line p-1 rounded-[3px] w-fit mb-6">
          {[
            { id: "exercises" as Tab, label: `Esercizi (${exCount})` },
            { id: "submissions" as Tab, label: `Submissions (${subCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "h-9 px-4 rounded-[2px] text-[12px] font-medium transition " +
                (tab === t.id ? "bg-ink text-paper" : "text-smoke hover:text-ink")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "exercises" && (
          <div>
            {exercises.length === 0 ? (
              <div className="bg-paper-2 border border-line rounded-[3px] p-12 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                  Nessun esercizio assegnato
                </div>
                <p className="text-smoke text-[14px] max-w-md mx-auto">
                  Clicca "Assegna esercizio" per dare a {student.full_name.split(" ")[0]} il primo
                  esercizio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-paper-2 border border-line rounded-[3px] p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <StatusPill
                        status={
                          ex.status === "assigned"
                            ? "assigned"
                            : ex.status === "submitted"
                              ? "delivered"
                              : ex.status === "reviewed"
                                ? "feedback"
                                : "archived"
                        }
                      />
                      {ex.bpm && <Tag>bpm {ex.bpm}</Tag>}
                    </div>
                    <div className="font-display text-[18px] leading-[1.2] mb-3">{ex.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                      {ex.due_date
                        ? `Entro ${new Date(ex.due_date).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                          })}`
                        : "Senza scadenza"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "submissions" && (
          <div>
            {submissions.length === 0 ? (
              <div className="bg-paper-2 border border-line rounded-[3px] p-12 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                  Nessuna submission
                </div>
                <p className="text-smoke text-[14px] max-w-md mx-auto">
                  {student.full_name.split(" ")[0]} non ha ancora inviato nessuna take.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.map((s) => (
                  <Link
                    key={s.id}
                    to={`/coach/review/${s.id}`}
                    className="bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition block"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                        Take {s.take_number} ·{" "}
                        {new Date(s.submitted_at).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <StatusPill status={s.reviewed ? "feedback" : "delivered"} />
                    </div>
                    <div className="font-display text-[18px] leading-tight">{s.exercise_title}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {assignOpen && profile?.id && (
        <AssignExerciseDrawer
          studentId={student.id}
          studentName={student.full_name}
          coachId={profile.id}
          onClose={() => setAssignOpen(false)}
          onAssigned={() => {
            setAssignOpen(false);
            setTick((t) => t + 1);
            toast("Esercizio assegnato", "ok");
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, ember }: { label: string; value: number | string; ember?: boolean }) {
  return (
    <div className="bg-paper-2 border border-line rounded-[3px] p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">{label}</div>
      <div className={"font-display text-[28px] " + (ember ? "text-[var(--ember)]" : "text-ink")}>
        {value}
      </div>
    </div>
  );
}

// ─── Drawer Assegnazione Esercizio ────────────────────────────────
function AssignExerciseDrawer({
  studentId,
  studentName,
  coachId,
  onClose,
  onAssigned,
}: {
  studentId: string;
  studentName: string;
  coachId: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [bpm, setBpm] = useState<string>("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!title.trim()) {
      toast("Titolo richiesto", "warn");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("exercises").insert({
      student_id: studentId,
      assigned_by_coach_id: coachId,
      title: title.trim(),
      instructions: instructions.trim() || null,
      bpm: bpm.trim() ? parseInt(bpm) : null,
      due_date: dueDate || null,
      status: "assigned",
    });
    setSubmitting(false);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    onAssigned();
  };

  return (
    <div className="fixed inset-0 z-[9000]" style={{ animation: "fadeIn 0.25s" }}>
      <div onClick={onClose} className="absolute inset-0 bg-ink/60" style={{ backdropFilter: "blur(2px)" }} />
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[560px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.32s cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="flex-shrink-0 px-6 md:px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
                Nuovo esercizio per {studentName.split(" ")[0]}
              </div>
              <h2 className="font-editorial text-[28px] md:text-[32px] leading-[1.02]">
                Assegna un <span className="italic-ember">esercizio</span>.
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition flex-shrink-0"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 no-scrollbar">
          <Field label="Titolo *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Pennata alternata — crome a 120 bpm"
              className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
            />
          </Field>

          <Field label="Istruzioni per lo studente">
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              placeholder={`"${studentName.split(" ")[0]}, voglio due minuti filati di crome pulite. Metronomo sul 2 e 4..."`}
              className="w-full px-3 py-2 bg-paper-2 border border-line rounded-[2px] text-[13px] leading-relaxed focus:outline-none focus:border-ink resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="BPM">
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] font-mono focus:outline-none focus:border-ink"
              />
            </Field>
            <Field label="Scadenza">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </Field>
          </div>

          <div className="mt-6 bg-paper-2 border border-line rounded-[3px] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              Cosa succede dopo
            </div>
            <p className="text-[13px] text-smoke leading-[1.5]">
              {studentName.split(" ")[0]} riceverà l'esercizio nella sua home con istruzioni e
              scadenza. Quando registrerà la take, comparirà nella tua coda "Da correggere".
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 md:px-8 py-5 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition"
          >
            Annulla
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition inline-flex items-center gap-2 disabled:opacity-50"
            style={{ fontWeight: 700 }}
          >
            <Icon name="check" size={13} /> {submitting ? "Assegno…" : "Assegna esercizio"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 first:mt-0">
      <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">{label}</div>
      {children}
    </div>
  );
}

