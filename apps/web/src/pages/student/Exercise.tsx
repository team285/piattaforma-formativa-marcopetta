/**
 * Student Exercise — vista esercizio + storico submissions.
 *
 * MVP: legge l'esercizio attivo dal querystring (?ex=...) o il primo
 * con status='assigned'. Mostra istruzioni di Marco, BPM, scadenza.
 * Storico submissions sotto.
 *
 * Recording reale richiede getUserMedia + upload Supabase Storage —
 * fase successiva. Per ora bottone "Registra" mostra placeholder toast.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { usePageTitle } from "../../lib/hooks";
import { EditorialH, Icon, StatusPill, Tag, toast } from "../../components/ui";
import { WebcamRecorder } from "../../components/recorder/WebcamRecorder";

interface ExerciseDetail {
  id: string;
  title: string;
  instructions: string | null;
  bpm: number | null;
  due_date: string | null;
  status: string;
}

interface SubmissionRow {
  id: string;
  exercise_title: string;
  take_number: number;
  duration_seconds: number | null;
  submitted_at: string;
  reviewed: boolean;
}

export function StudentExercise() {
  usePageTitle("Esercizio");
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedId = params.get("ex");
  const [active, setActive] = useState<ExerciseDetail | null>(null);
  const [history, setHistory] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      const exerciseQuery = requestedId
        ? supabase
            .from("exercises")
            .select("id,title,instructions,bpm,due_date,status")
            .eq("id", requestedId)
            .maybeSingle()
        : supabase
            .from("exercises")
            .select("id,title,instructions,bpm,due_date,status")
            .eq("student_id", profile.id)
            .eq("status", "assigned")
            .order("due_date", { ascending: true, nullsFirst: false })
            .limit(1)
            .maybeSingle();

      const [exRes, subsRes] = await Promise.all([
        withTimeout(
          exerciseQuery,
          5000,
          { data: null, error: null },
          "exercise.detail"
        ),
        withTimeout(
          supabase
            .from("submissions")
            .select("id,exercise_id,take_number,duration_seconds,submitted_at")
            .eq("student_id", profile.id)
            .order("submitted_at", { ascending: false })
            .limit(12),
          5000,
          { data: [] as Array<{ id: string; exercise_id: string; take_number: number; duration_seconds: number | null; submitted_at: string }>, error: null },
          "exercise.history"
        ),
      ]);
      if (cancelled) return;

      setActive(exRes.data as ExerciseDetail | null);

      const subsRaw = subsRes.data ?? [];
      if (subsRaw.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Lookup titoli esercizi
      const exerciseIds = Array.from(new Set(subsRaw.map((s) => s.exercise_id)));
      const titlesRes = await withTimeout(
        supabase.from("exercises").select("id,title").in("id", exerciseIds),
        5000,
        { data: [] as Array<{ id: string; title: string }>, error: null },
        "exercise.titles"
      );
      if (cancelled) return;

      const titleById = new Map<string, string>();
      (titlesRes.data ?? []).forEach((e) => titleById.set(e.id, e.title));

      // Quali submissions hanno feedback
      const subIds = subsRaw.map((s) => s.id);
      const fbRes = await withTimeout(
        supabase.from("feedbacks").select("submission_id").in("submission_id", subIds),
        5000,
        { data: [] as Array<{ submission_id: string }>, error: null },
        "exercise.feedbacks"
      );
      if (cancelled) return;
      const reviewedSet = new Set((fbRes.data ?? []).map((f) => f.submission_id));

      setHistory(
        subsRaw.map((s) => ({
          id: s.id,
          exercise_title: titleById.get(s.exercise_id) ?? "—",
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
  }, [profile?.id, requestedId]);

  const dueLabel = active?.due_date
    ? new Date(active.due_date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "short" })
    : null;

  if (loading) {
    return (
      <div className="min-h-full bg-paper flex items-center justify-center">
        <div className="font-mono text-[12px] text-smoke">Caricamento esercizio…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-5 md:px-12 py-8 md:py-12">
        <Link
          to="/student/home"
          className="flex items-center gap-2 text-[13px] text-smoke hover:text-ink mb-8"
        >
          <Icon name="chevronl" size={14} /> Torna al piano
        </Link>

        {!active ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Nessun esercizio attivo
            </div>
            <h2 className="font-editorial text-[36px] mb-3">
              Niente da <span className="italic-ember">registrare</span> per ora.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Quando Marco ti assegnerà un esercizio comparirà qui con istruzioni, BPM e scadenza.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
            {/* Istruzioni esercizio */}
            <div className="md:col-span-5">
              <Tag>Esercizio · {active.id.slice(0, 6).toUpperCase()}</Tag>
              <h1 className="font-display text-[32px] md:text-[44px] leading-[1.05] mt-4 mb-5">{active.title}</h1>

              <div className="flex items-center gap-4 mb-8 text-sm">
                {dueLabel && (
                  <span className="inline-flex items-center gap-1.5 text-smoke">
                    <Icon name="clock" size={14} /> Entro <strong className="text-ink">{dueLabel}</strong>
                  </span>
                )}
                {active.bpm && (
                  <span className="inline-flex items-center gap-1.5 text-smoke">
                    <Icon name="speed" size={14} /> <strong className="text-ink">{active.bpm} bpm</strong>
                  </span>
                )}
              </div>

              {active.instructions && (
                <div className="border-l-2 border-[var(--ember)] pl-5 mb-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-2">
                    Istruzioni di Marco
                  </div>
                  <p className="text-[15px] leading-[1.65] text-ink whitespace-pre-line">
                    "{active.instructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Area registrazione */}
            <div className="md:col-span-7">
              <WebcamRecorder
                uploading={uploading}
                onSubmit={async (blob, durationSeconds, source) => {
                  if (!profile?.id || !active) return;
                  setUploading(true);
                  try {
                    // Calcola take_number progressivo per questo esercizio
                    const { count } = await supabase
                      .from("submissions")
                      .select("*", { count: "exact", head: true })
                      .eq("exercise_id", active.id);
                    const takeNumber = (count ?? 0) + 1;

                    // Inferisci estensione dal mime type o dal nome file (per upload)
                    const inferExt = (b: Blob): string => {
                      if (b.type.includes("mp4")) return "mp4";
                      if (b.type.includes("quicktime")) return "mov";
                      if (b.type.includes("webm")) return "webm";
                      // Per File con name disponibile
                      if ("name" in b && typeof (b as File).name === "string") {
                        const m = (b as File).name.match(/\.([a-z0-9]+)$/i);
                        if (m) return m[1].toLowerCase();
                      }
                      return "webm";
                    };
                    const ext = inferExt(blob);
                    const path = `${profile.id}/${active.id}/take_${takeNumber}.${ext}`;

                    const uploadRes = await supabase.storage
                      .from("submission-videos")
                      .upload(path, blob, {
                        contentType: blob.type || "video/webm",
                        upsert: false,
                      });
                    if (uploadRes.error) {
                      toast(`Upload fallito: ${uploadRes.error.message}`, "warn");
                      setUploading(false);
                      return;
                    }

                    // Insert submission
                    const insertRes = await supabase.from("submissions").insert({
                      exercise_id: active.id,
                      student_id: profile.id,
                      take_number: takeNumber,
                      video_storage_path: path,
                      duration_seconds: durationSeconds,
                      size_bytes: blob.size,
                      source,
                    });
                    if (insertRes.error) {
                      toast(`Salvataggio fallito: ${insertRes.error.message}`, "warn");
                      setUploading(false);
                      return;
                    }

                    // Aggiorna status esercizio
                    await supabase
                      .from("exercises")
                      .update({ status: "submitted" })
                      .eq("id", active.id);

                    toast("Take inviato a Marco", "ok");
                    setUploading(false);
                    setTimeout(() => navigate("/student/home"), 600);
                  } catch (e) {
                    console.warn("[exercise] upload error:", e);
                    toast("Errore di rete durante l'upload", "warn");
                    setUploading(false);
                  }
                }}
              />

              <div className="mt-5 text-[12px] text-smoke text-center md:text-left">
                Marco riceve una notifica quando invii. Risponde di solito entro 24h.
              </div>
            </div>
          </div>
        )}

        {/* Storico submissions */}
        {history.length > 0 && (
          <div className="mt-20 border-t border-line pt-10">
            <EditorialH kicker="Le tue submissions precedenti">
              Tutto quello che hai <span className="italic-ember">mandato</span> finora.
            </EditorialH>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.reviewed) {
                      navigate(`/student/feedback?sub=${s.id}`);
                    } else {
                      toast(
                        `Take ${s.take_number} · ${s.exercise_title} · in attesa di Marco`,
                        "info"
                      );
                    }
                  }}
                  className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition"
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
                  <div className="font-display text-xl leading-tight">{s.exercise_title}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
