/**
 * Student Feedback — viewer feedback con annotazioni temporali.
 *
 * MVP: legge feedbacks dello studente loggato + annotazioni + ratings,
 * mostra layout dark con video placeholder + lista annotazioni laterale.
 *
 * Player video reale + side-by-side richiedono Storage upload —
 * fase successiva. Per ora mostra timestamp + testo annotazione +
 * radar valutazione.
 */

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Icon, EmberButton } from "../../components/ui";

interface FeedbackDetail {
  id: string;
  submission_id: string;
  exercise_title: string;
  coach_note: string | null;
  created_at: string;
}

interface Annotation {
  id: string;
  time_seconds: number;
  type: "ok" | "tip" | "warning" | "video";
  text: string;
  duration_seconds: number | null;
}

interface Rating {
  label: string;
  value: number;
}

const formatSec = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const annotationColor = (type: Annotation["type"]) => {
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

const typeLabel = (type: Annotation["type"]) =>
  ({ ok: "OK", tip: "TIP", warning: "WARN", video: "VIDEO" }[type]);

export function StudentFeedback() {
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const requestedSub = params.get("sub");
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Trova il feedback più recente dello studente (o quello richiesto)
      const fbQuery = requestedSub
        ? supabase
            .from("feedbacks")
            .select("id,submission_id,coach_note,created_at")
            .eq("submission_id", requestedSub)
            .maybeSingle()
        : supabase
            .from("feedbacks")
            .select("id,submission_id,coach_note,created_at")
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

      // 2. Risali al titolo esercizio via submission
      const subRes = await withTimeout(
        supabase.from("submissions").select("exercise_id").eq("id", fbRow.submission_id).maybeSingle(),
        5000,
        { data: null as { exercise_id: string } | null, error: null },
        "fb.submission"
      );
      if (cancelled) return;

      let exerciseTitle = "—";
      if (subRes.data) {
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
        coach_note: fbRow.coach_note,
        created_at: fbRow.created_at,
      });

      // 3. Annotazioni
      const annRes = await withTimeout(
        supabase
          .from("annotations")
          .select("id,time_seconds,type,text,duration_seconds")
          .eq("feedback_id", fbRow.id)
          .order("time_seconds"),
        5000,
        { data: [] as Array<Annotation>, error: null },
        "fb.annotations"
      );
      if (cancelled) return;
      setAnnotations((annRes.data as Annotation[]) ?? []);

      // 4. Ratings
      const ratingsRes = await withTimeout(
        supabase
          .from("feedback_ratings")
          .select("label,value")
          .eq("feedback_id", fbRow.id),
        5000,
        { data: [] as Array<Rating>, error: null },
        "fb.ratings"
      );
      if (cancelled) return;
      setRatings((ratingsRes.data as Rating[]) ?? []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, requestedSub]);

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
        <div className="max-w-[800px] mx-auto px-12 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Nessun feedback ancora
          </div>
          <h1 className="font-editorial text-[44px] mb-4 leading-tight">
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

  const current = annotations[activeIdx];
  const avgRating = ratings.length > 0 ? ratings.reduce((a, r) => a + r.value, 0) / ratings.length : 0;
  const avgInt = Math.floor(avgRating);
  const avgDec = Math.round((avgRating - avgInt) * 10);

  return (
    <div className="min-h-full bg-ink text-paper fade-in">
      <div className="max-w-[1480px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
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
          <div className="w-32" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Video + ratings */}
          <div className="col-span-8">
            <div
              className="relative bg-black rounded-[3px] overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0 thumb-stripe opacity-40" />
              <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92]">
                Tu · take {feedback.submission_id.slice(0, 6)}
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <Icon name="video" size={32} className="text-[#8A8A92] mx-auto mb-3" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8A8A92]">
                    Video player · in arrivo
                  </div>
                  <div className="text-[12px] text-[#6D6D75] mt-2 max-w-xs mx-auto">
                    Quando avremo lo storage upload attivo, qui partirà il video con timeline annotata.
                  </div>
                </div>
              </div>
            </div>

            {feedback.coach_note && (
              <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-2">
                  Nota di Marco
                </div>
                <p className="text-[14px] text-[#D9D9DE] leading-[1.5] whitespace-pre-line">
                  {feedback.coach_note}
                </p>
              </div>
            )}

            {ratings.length > 0 && (
              <div className="mt-5 bg-ink-2 border border-line-dark rounded-[3px] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-1">
                      Valutazione
                    </div>
                    <div className="font-display text-2xl">
                      La <span className="italic-ember">fotografia</span> di questa take
                    </div>
                  </div>
                  <div className="font-display text-5xl">
                    {avgInt}
                    <span className="text-[#8A8A92] text-3xl">.{avgDec}</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  {ratings.map((r) => (
                    <div key={r.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] text-[#C9C9D0]">{r.label}</span>
                        <span className="font-mono text-[11px] text-paper">{r.value.toFixed(1)}</span>
                      </div>
                      <div className="h-1 rounded-full bg-ink-3 overflow-hidden">
                        <div
                          className="h-full bg-[var(--ember)]"
                          style={{ width: `${r.value * 20}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lista annotazioni */}
          <div className="col-span-4">
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
                  const color = annotationColor(a.type);
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActiveIdx(i)}
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
                          {typeLabel(a.type)}
                        </span>
                        <span className="font-mono text-[11px] text-[#8A8A92]">
                          {formatSec(a.time_seconds)}
                        </span>
                        {isActive && (
                          <span className="ml-auto font-mono text-[10px] text-[var(--ember)]">
                            ATTIVO
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-[#D9D9DE] leading-[1.55]">{a.text}</div>
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

            {current && annotations.length > 0 && (
              <div className="mt-3 text-[11px] font-mono text-[#6D6D75] text-center">
                attivo: <span className="text-[var(--ember)]">{formatSec(current.time_seconds)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
