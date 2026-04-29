/**
 * Coach Review Detail — /coach/review/:submissionId
 *
 * Marco apre una take dalla coda. Vede:
 *  - Video player reale (signed URL del bucket submission-videos)
 *  - Info esercizio + studente
 *  - Annotazioni timestamp esistenti (lista lateral)
 *  - Form aggiungi annotazione: timestamp corrente video + tipo + nota
 *  - Form feedback finale: summary + 5 rating slider
 *  - Bottone "Pubblica feedback" → INSERT feedback + ratings, UPDATE exercise.status
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, EmberButton, Icon, Tag, toast } from "../../components/ui";

interface SubmissionInfo {
  id: string;
  exercise_id: string;
  exercise_title: string;
  bpm: number | null;
  exercise_instructions: string | null;
  student_id: string;
  student_name: string;
  student_initials: string;
  take_number: number;
  duration_seconds: number | null;
  submitted_at: string;
  video_storage_path: string;
}

interface Annotation {
  id: string;
  at_seconds: number;
  annotation_type: "ok" | "tip" | "warning" | "video";
  note: string;
}

type AnnoType = Annotation["annotation_type"];

const annotationColor = (type: AnnoType) => {
  switch (type) {
    case "ok":
      return "#7BB07B";
    case "tip":
      return "#F2B744";
    case "warning":
      return "#E04A3A";
    case "video":
      return "#FF6B3D";
  }
};

const typeLabel: Record<AnnoType, string> = {
  ok: "OK",
  tip: "TIP",
  warning: "WARN",
  video: "VIDEO",
};

const formatSec = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function CoachReviewDetail() {
  const { id: submissionId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [info, setInfo] = useState<SubmissionInfo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Form state
  const [annoType, setAnnoType] = useState<AnnoType>("tip");
  const [annoNote, setAnnoNote] = useState("");
  const [summary, setSummary] = useState("");
  const [ratings, setRatings] = useState({
    tempo: 3.5,
    tono: 3.5,
    tecnica: 3.5,
    groove: 3.5,
    espressione: 3.5,
  });
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    let cancelled = false;
    const load = async () => {
      // 1. Submission
      const subRes = await withTimeout(
        supabase
          .from("submissions")
          .select(
            "id,exercise_id,student_id,take_number,duration_seconds,submitted_at,video_storage_path"
          )
          .eq("id", submissionId)
          .maybeSingle(),
        5000,
        {
          data: null as {
            id: string;
            exercise_id: string;
            student_id: string;
            take_number: number;
            duration_seconds: number | null;
            submitted_at: string;
            video_storage_path: string;
          } | null,
          error: null,
        },
        "rev.submission"
      );
      if (cancelled) return;
      if (!subRes.data) {
        setInfo(null);
        setLoading(false);
        return;
      }
      const sub = subRes.data;

      // 2. Exercise + Profile (parallelo)
      const [exRes, profileRes, fbExistingRes, signedRes] = await Promise.all([
        withTimeout(
          supabase
            .from("exercises")
            .select("title,bpm,instructions,status")
            .eq("id", sub.exercise_id)
            .maybeSingle(),
          5000,
          {
            data: null as {
              title: string;
              bpm: number | null;
              instructions: string | null;
              status: string;
            } | null,
            error: null,
          },
          "rev.exercise"
        ),
        withTimeout(
          supabase
            .from("profiles")
            .select("full_name,initials")
            .eq("id", sub.student_id)
            .maybeSingle(),
          5000,
          { data: null as { full_name: string; initials: string } | null, error: null },
          "rev.profile"
        ),
        withTimeout(
          supabase
            .from("feedbacks")
            .select("id,summary")
            .eq("submission_id", submissionId)
            .maybeSingle(),
          5000,
          { data: null as { id: string; summary: string | null } | null, error: null },
          "rev.feedback"
        ),
        supabase.storage.from("submission-videos").createSignedUrl(sub.video_storage_path, 3600),
      ]);
      if (cancelled) return;

      const ex = exRes.data;
      const stp = profileRes.data;
      const fb = fbExistingRes.data;

      setInfo({
        id: sub.id,
        exercise_id: sub.exercise_id,
        exercise_title: ex?.title ?? "—",
        bpm: ex?.bpm ?? null,
        exercise_instructions: ex?.instructions ?? null,
        student_id: sub.student_id,
        student_name: stp?.full_name ?? "—",
        student_initials: stp?.initials ?? "??",
        take_number: sub.take_number,
        duration_seconds: sub.duration_seconds,
        submitted_at: sub.submitted_at,
        video_storage_path: sub.video_storage_path,
      });

      if (signedRes.data?.signedUrl) {
        setVideoUrl(signedRes.data.signedUrl);
      }

      if (fb) {
        setFeedbackId(fb.id);
        setSummary(fb.summary ?? "");
        setAlreadyReviewed(ex?.status === "reviewed");

        // Carica ratings + annotazioni esistenti
        const [annoRes, ratingsRes] = await Promise.all([
          withTimeout(
            supabase
              .from("annotations")
              .select("id,at_seconds,annotation_type,note")
              .eq("feedback_id", fb.id)
              .order("at_seconds"),
            5000,
            { data: [] as Annotation[], error: null },
            "rev.annotations"
          ),
          withTimeout(
            supabase
              .from("feedback_ratings")
              .select("tempo,tono,tecnica,groove,espressione")
              .eq("feedback_id", fb.id)
              .maybeSingle(),
            5000,
            {
              data: null as {
                tempo: number;
                tono: number;
                tecnica: number;
                groove: number;
                espressione: number;
              } | null,
              error: null,
            },
            "rev.ratings"
          ),
        ]);
        if (cancelled) return;
        setAnnotations((annoRes.data as Annotation[]) ?? []);
        if (ratingsRes.data) setRatings(ratingsRes.data);
      }

      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  const ensureFeedback = async (): Promise<string | null> => {
    if (feedbackId) return feedbackId;
    if (!profile?.id || !submissionId) return null;
    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        submission_id: submissionId,
        coach_id: profile.id,
        summary: summary.trim() || null,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) {
      toast(`Errore creazione feedback: ${error.message}`, "warn");
      return null;
    }
    setFeedbackId(data.id);
    return data.id;
  };

  const addAnnotation = async () => {
    if (!annoNote.trim() || !videoRef.current) return;
    const fbId = await ensureFeedback();
    if (!fbId) return;
    const at = Math.round(videoRef.current.currentTime);
    const { data, error } = await supabase
      .from("annotations")
      .insert({
        feedback_id: fbId,
        at_seconds: at,
        annotation_type: annoType,
        note: annoNote.trim(),
        position: at,
      })
      .select("id,at_seconds,annotation_type,note")
      .single();
    if (error) {
      toast(`Errore annotazione: ${error.message}`, "warn");
      return;
    }
    setAnnotations((cur) => {
      const next = [...cur, data as Annotation];
      next.sort((a, b) => a.at_seconds - b.at_seconds);
      return next;
    });
    setAnnoNote("");
    toast("Annotazione aggiunta", "ok");
  };

  const removeAnnotation = async (annoId: string) => {
    const { error } = await supabase.from("annotations").delete().eq("id", annoId);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    setAnnotations((cur) => cur.filter((a) => a.id !== annoId));
  };

  const seekTo = (s: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = s;
      videoRef.current.play().catch(() => {});
    }
  };

  const publishFeedback = async () => {
    if (!info || !profile?.id) return;
    setPublishing(true);
    const fbId = await ensureFeedback();
    if (!fbId) {
      setPublishing(false);
      return;
    }

    // 1. Upsert summary + status='sent'
    const updateRes = await supabase
      .from("feedbacks")
      .update({
        summary: summary.trim() || null,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", fbId);
    if (updateRes.error) {
      toast(`Errore salvataggio: ${updateRes.error.message}`, "warn");
      setPublishing(false);
      return;
    }

    // 2. Upsert ratings (PK = feedback_id)
    const ratingsRes = await supabase.from("feedback_ratings").upsert(
      {
        feedback_id: fbId,
        tempo: ratings.tempo,
        tono: ratings.tono,
        tecnica: ratings.tecnica,
        groove: ratings.groove,
        espressione: ratings.espressione,
      },
      { onConflict: "feedback_id" }
    );
    if (ratingsRes.error) {
      toast(`Errore valutazione: ${ratingsRes.error.message}`, "warn");
      setPublishing(false);
      return;
    }

    // 3. Update exercise status='reviewed'
    await supabase.from("exercises").update({ status: "reviewed" }).eq("id", info.exercise_id);

    setPublishing(false);
    toast("Feedback pubblicato. Lo studente lo vede ora.", "ok");
    setTimeout(() => navigate("/coach/review"), 700);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-ink text-paper flex items-center justify-center">
        <div className="font-mono text-[12px] text-[#8A8A92]">Caricamento submission…</div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-full bg-paper">
        <div className="max-w-2xl mx-auto px-5 md:px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Submission non trovata
          </div>
          <Link
            to="/coach/review"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink"
          >
            <Icon name="chevronl" size={13} /> Torna alla coda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-ink text-paper fade-in">
      <div className="max-w-[1480px] mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <Link
            to="/coach/review"
            className="flex items-center gap-2 text-[13px] text-[#8A8A92] hover:text-paper"
          >
            <Icon name="chevronl" size={14} /> Torna alla coda
          </Link>
          <div className="flex items-center gap-3">
            <Avatar initials={info.student_initials} size={36} tone="ember" />
            <div className="min-w-0">
              <div className="font-display text-[18px] leading-none truncate">
                {info.student_name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8A92] mt-1">
                Take {info.take_number} · {formatSec(info.duration_seconds ?? 0)}
              </div>
            </div>
          </div>
          {alreadyReviewed && (
            <Tag>
              <span className="text-[#7BB07B]">già pubblicato</span>
            </Tag>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Video + form summary/ratings */}
          <div className="md:col-span-8">
            <div
              className="relative bg-black rounded-[3px] overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8A8A92] font-mono text-[11px]">
                  Video non disponibile (signed URL fallita)
                </div>
              )}
            </div>

            {/* Form esercizio info */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-2">
                Esercizio assegnato
              </div>
              <div className="font-display text-xl mb-2">{info.exercise_title}</div>
              {info.bpm && (
                <div className="font-mono text-[11px] text-[#C9C9D0] mb-3">{info.bpm} bpm</div>
              )}
              {info.exercise_instructions && (
                <p className="text-[13px] text-[#C9C9D0] leading-[1.55] italic">
                  "{info.exercise_instructions}"
                </p>
              )}
            </div>

            {/* Form aggiungi annotazione */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
                  Aggiungi annotazione al video
                </div>
                <div className="font-mono text-[11px] text-[#8A8A92]">
                  Timestamp:{" "}
                  <span className="text-paper">
                    {videoRef.current ? formatSec(videoRef.current.currentTime) : "0:00"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(["ok", "tip", "warning", "video"] as AnnoType[]).map((t) => {
                  const active = annoType === t;
                  const color = annotationColor(t);
                  return (
                    <button
                      key={t}
                      onClick={() => setAnnoType(t)}
                      className="h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border transition"
                      style={
                        active
                          ? { background: color, borderColor: color, color: "#0B0B0D", fontWeight: 600 }
                          : { borderColor: "#2A2A30", color: "#8A8A92" }
                      }
                    >
                      {typeLabel[t]}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={annoNote}
                onChange={(e) => setAnnoNote(e.target.value)}
                rows={2}
                placeholder="Cosa noti? es: 'mano destra si chiude qui — fermati e ricomincia'"
                className="w-full bg-ink-3 border border-line-dark rounded-[2px] px-3 py-2 text-[13px] text-paper resize-none focus:outline-none focus:border-[var(--ember)]"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={addAnnotation}
                  disabled={!annoNote.trim()}
                  className="h-9 px-4 rounded-[2px] bg-[var(--ember)] text-white text-[12px] font-mono uppercase tracking-wider disabled:opacity-40 hover:bg-[var(--ember-2)] transition"
                >
                  + Annota
                </button>
              </div>
            </div>

            {/* Form summary + ratings */}
            <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-3">
                Nota riassuntiva (visibile allo studente)
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder={`"${info.student_name.split(" ")[0]}, ottimo lavoro sulla parte centrale. Dobbiamo lavorare ancora sulla mano destra al 0:42..."`}
                className="w-full bg-ink-3 border border-line-dark rounded-[2px] px-3 py-2 text-[14px] text-paper leading-relaxed resize-none focus:outline-none focus:border-[var(--ember)]"
              />

              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-3">
                Valutazione su 5 metriche (0–5)
              </div>
              <div className="space-y-3">
                {(
                  [
                    ["tempo", "Tempo"],
                    ["tono", "Tono"],
                    ["tecnica", "Tecnica"],
                    ["groove", "Groove"],
                    ["espressione", "Espressione"],
                  ] as Array<[keyof typeof ratings, string]>
                ).map(([k, label]) => (
                  <div key={k} className="flex items-center gap-4">
                    <span className="text-[12px] text-[#C9C9D0] w-28">{label}</span>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={ratings[k]}
                      onChange={(e) =>
                        setRatings((cur) => ({ ...cur, [k]: parseFloat(e.target.value) }))
                      }
                      className="flex-1 accent-[#F2B744]"
                    />
                    <span className="font-mono text-[13px] w-8 text-right text-paper">
                      {ratings[k].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <EmberButton
                size="lg"
                icon="send"
                onClick={publishFeedback}
                disabled={publishing}
              >
                {publishing
                  ? "Pubblico…"
                  : alreadyReviewed
                    ? "Aggiorna feedback"
                    : "Pubblica feedback"}
              </EmberButton>
            </div>
          </div>

          {/* Lista annotazioni */}
          <div className="md:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-3">
              Annotazioni ({annotations.length})
            </div>

            {annotations.length === 0 ? (
              <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6 text-center">
                <div className="text-[12px] text-[#8A8A92]">
                  Nessuna annotazione ancora. Aggiungi commenti al secondo dal player.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[700px] overflow-y-auto no-scrollbar pr-2">
                {annotations.map((a) => {
                  const color = annotationColor(a.annotation_type);
                  return (
                    <div
                      key={a.id}
                      className="bg-ink-2 border border-line-dark rounded-[3px] p-4 group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => seekTo(a.at_seconds)}
                          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]"
                          style={{ color, background: `${color}22` }}
                        >
                          {typeLabel[a.annotation_type]}
                        </button>
                        <button
                          onClick={() => seekTo(a.at_seconds)}
                          className="font-mono text-[11px] text-[#8A8A92] hover:text-paper"
                        >
                          {formatSec(a.at_seconds)}
                        </button>
                        <button
                          onClick={() => removeAnnotation(a.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition text-[#E04A3A] hover:text-[#FF6B5A] text-[10px] font-mono uppercase"
                          title="Elimina"
                        >
                          rimuovi
                        </button>
                      </div>
                      <div className="text-[13px] text-[#D9D9DE] leading-[1.55] whitespace-pre-line">
                        {a.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
