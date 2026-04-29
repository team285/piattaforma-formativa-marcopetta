/**
 * Student Feedback — viewer feedback con annotazioni temporali.
 *
 * Carica feedbacks dello studente loggato + annotazioni + ratings.
 * Player video reale via signed URL del bucket submission-videos.
 * Click su annotazione → seek video al timestamp.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Icon, EmberButton } from "../../components/ui";

interface FeedbackDetail {
  id: string;
  submission_id: string;
  exercise_title: string;
  summary: string | null;
  created_at: string;
  video_storage_path: string | null;
}

interface Annotation {
  id: string;
  at_seconds: number;
  annotation_type: "ok" | "tip" | "warning" | "video";
  note: string;
  video_duration_seconds: number | null;
}

interface Ratings {
  tempo: number;
  tono: number;
  tecnica: number;
  groove: number;
  espressione: number;
}

const RATING_LABELS: Array<{ key: keyof Ratings; label: string }> = [
  { key: "tempo", label: "Tempo" },
  { key: "tono", label: "Tono" },
  { key: "tecnica", label: "Tecnica" },
  { key: "groove", label: "Groove" },
  { key: "espressione", label: "Espressione" },
];

const formatSec = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const annotationColor = (type: Annotation["annotation_type"]) => {
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

const typeLabel = (type: Annotation["annotation_type"]) =>
  ({ ok: "OK", tip: "TIP", warning: "WARN", video: "VIDEO" }[type]);

export function StudentFeedback() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const requestedSub = params.get("sub");
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [ratings, setRatings] = useState<Ratings | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Trova feedback (specifico o ultimo dello studente)
      const fbQuery = requestedSub
        ? supabase
            .from("feedbacks")
            .select("id,submission_id,summary,created_at")
            .eq("submission_id", requestedSub)
            .maybeSingle()
        : supabase
            .from("feedbacks")
            .select("id,submission_id,summary,created_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

      const fbRes = await withTimeout(fbQuery, 5000, { data: null, error: null }, "fb.detail");
      if (cancelled) return;
      const fbRow = fbRes.data;
      if (!fbRow) {
        setFeedback(null);
        setLoading(false);
        return;
      }

      // 2. Submission per video path + exercise_id
      const subRes = await withTimeout(
        supabase
          .from("submissions")
          .select("exercise_id,video_storage_path")
          .eq("id", fbRow.submission_id)
          .maybeSingle(),
        5000,
        { data: null as { exercise_id: string; video_storage_path: string } | null, error: null },
        "fb.submission"
      );
      if (cancelled) return;

      let exerciseTitle = "—";
      let videoPath: string | null = null;
      if (subRes.data) {
        videoPath = subRes.data.video_storage_path;
        const exRes = await withTimeout(
          supabase.from("exercises").select("title").eq("id", subRes.data.exercise_id).maybeSingle(),
          5000,
          { data: null as { title: string } | null, error: null },
          "fb.exercise"
        );
        if (cancelled) return;
        exerciseTitle = exRes.data?.title ?? "—";
      }

      setFeedback({
        id: fbRow.id,
        submission_id: fbRow.submission_id,
        exercise_title: exerciseTitle,
        summary: fbRow.summary,
        created_at: fbRow.created_at,
        video_storage_path: videoPath,
      });

      // 3. Signed URL per il video (TTL 1 ora)
      if (videoPath) {
        const urlRes = await supabase.storage
          .from("submission-videos")
          .createSignedUrl(videoPath, 3600);
        if (!cancelled && urlRes.data?.signedUrl) {
          setVideoUrl(urlRes.data.signedUrl);
        }
      }

      // 4. Annotazioni
      const annRes = await withTimeout(
        supabase
          .from("annotations")
          .select("id,at_seconds,annotation_type,note,video_duration_seconds")
          .eq("feedback_id", fbRow.id)
          .order("at_seconds"),
        5000,
        { data: [] as Annotation[], error: null },
        "fb.annotations"
      );
      if (cancelled) return;
      setAnnotations((annRes.data as Annotation[]) ?? []);

      // 5. Ratings (1 row con 5 colonne)
      const ratingsRes = await withTimeout(
        supabase
          .from("feedback_ratings")
          .select("tempo,tono,tecnica,groove,espressione")
          .eq("feedback_id", fbRow.id)
          .maybeSingle(),
        5000,
        { data: null as Ratings | null, error: null },
        "fb.ratings"
      );
      if (cancelled) return;
      setRatings(ratingsRes.data);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, requestedSub]);

  const seekTo = (seconds: number, idx: number) => {
    setActiveIdx(idx);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-ink text-paper flex items-center justify-center">
        <div className="font-mono text-[12px] text-[#8A8A92]">Caricamento feedback…</div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-full bg-paper fade-in">
        <div className="max-w-[800px] mx-auto px-5 md:px-12 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Nessun feedback ancora
          </div>
          <h1 className="font-editorial text-[36px] md:text-[44px] mb-4 leading-tight">
            Marco non ti ha ancora <span className="italic-ember">risposto</span>.
          </h1>
          <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto mb-8">
            Quando manderai una take e Marco la guarderà, qui troverai il suo feedback con
            annotazioni al secondo, video-risposte e una valutazione.
          </p>
          <Link
            to="/student/home"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition"
          >
            <Icon name="chevronl" size={13} /> Torna al piano
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = ratings
    ? (ratings.tempo + ratings.tono + ratings.tecnica + ratings.groove + ratings.espressione) / 5
    : 0;
  const avgInt = Math.floor(avgRating);
  const avgDec = Math.round((avgRating - avgInt) * 10);

  return (
    <div className="min-h-full bg-ink text-paper fade-in">
      <div className="max-w-[1480px] mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <Link
            to="/student/home"
            className="flex items-center gap-2 text-[13px] text-[#8A8A92] hover:text-paper"
          >
            <Icon name="chevronl" size={14} /> Il tuo piano
          </Link>
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-1">
              Feedback di Marco su
            </div>
            <div className="font-display text-xl">{feedback.exercise_title}</div>
          </div>
          <div className="hidden md:block w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Video + summary + ratings */}
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
                <>
                  <div className="absolute inset-0 thumb-stripe opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div>
                      <Icon name="video" size={32} className="text-[#8A8A92] mx-auto mb-3" />
                      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A8A92]">
                        Video non disponibile
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {feedback.summary && (
              <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-2">
                  Nota di Marco
                </div>
                <p className="text-[14px] text-[#D9D9DE] leading-[1.5] whitespace-pre-line">
                  {feedback.summary}
                </p>
              </div>
            )}

            {ratings && (
              <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5 md:p-6">
                <div className="flex items-start md:items-center justify-between mb-5 gap-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-1">
                      Valutazione
                    </div>
                    <div className="font-display text-xl md:text-2xl">
                      La <span className="italic-ember">fotografia</span> di questa take
                    </div>
                  </div>
                  <div className="font-display text-4xl md:text-5xl">
                    {avgInt}
                    <span className="text-[#8A8A92] text-2xl md:text-3xl">.{avgDec}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                  {RATING_LABELS.map(({ key, label }) => {
                    const value = ratings[key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] text-[#C9C9D0]">{label}</span>
                          <span className="font-mono text-[11px] text-paper">
                            {value.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-ink-3 overflow-hidden">
                          <div
                            className="h-full bg-[var(--ember)]"
                            style={{ width: `${value * 20}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Lista annotazioni */}
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">
                Commenti al secondo
              </div>
              {annotations.length > 0 && (
                <div className="font-mono text-[10px] text-[#8A8A92]">
                  {activeIdx + 1} / {annotations.length}
                </div>
              )}
            </div>

            {annotations.length === 0 ? (
              <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6 text-center">
                <div className="text-[12px] text-[#8A8A92]">
                  Marco ha lasciato solo una nota generale su questa take, senza annotazioni
                  temporali.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-y-auto no-scrollbar pr-2">
                {annotations.map((a, i) => {
                  const isActive = i === activeIdx;
                  const color = annotationColor(a.annotation_type);
                  return (
                    <button
                      key={a.id}
                      onClick={() => seekTo(a.at_seconds, i)}
                      className={
                        "w-full text-left rounded-[3px] p-4 border transition " +
                        (isActive
                          ? "bg-ink-3 border-[var(--ember)]"
                          : "bg-ink-2 border-line-dark hover:border-[#4A3A32]")
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]"
                          style={{ color, background: `${color}22` }}
                        >
                          {typeLabel(a.annotation_type)}
                        </span>
                        <span className="font-mono text-[11px] text-[#8A8A92]">
                          {formatSec(a.at_seconds)}
                        </span>
                        {isActive && (
                          <span className="ml-auto font-mono text-[10px] text-[var(--ember)]">
                            ATTIVO
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-[#D9D9DE] leading-[1.55]">{a.note}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-5">
              <EmberButton
                full
                size="lg"
                icon="record"
                onClick={() => (window.location.href = "/student/esercizio")}
              >
                Rispondi con nuovo video
              </EmberButton>
              <Link
                to="/student/chat"
                className="mt-3 w-full h-10 rounded-[2px] border border-line-dark text-[13px] text-[#C9C9D0] hover:text-paper hover:border-[#4A3A32] flex items-center justify-center"
              >
                Scrivi a Marco in chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
