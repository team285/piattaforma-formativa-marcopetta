/**
 * WebcamRecorder — registrazione webcam + microfono usando MediaRecorder.
 *
 * Flusso:
 *  idle → recording → preview (Rifai / Invia)
 *
 * Gestisce:
 *  - getUserMedia con fallback per browser senza supporto
 *  - Tempo registrato live
 *  - Blob output webm (Chrome/Edge/Firefox) con fallback mp4 (Safari)
 *  - Cleanup stream/recorder su unmount
 *
 * Ritorna il Blob via onSubmit; il parent gestisce upload Storage + insert.
 */

import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui";

type State = "idle" | "requesting" | "recording" | "preview" | "denied";

interface WebcamRecorderProps {
  onSubmit: (blob: Blob, durationSeconds: number) => Promise<void> | void;
  uploading?: boolean;
}

export function WebcamRecorder({ onSubmit, uploading = false }: WebcamRecorderProps) {
  const [state, setState] = useState<State>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const pickMimeType = (): string => {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    for (const t of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
    }
    return "video/webm";
  };

  const startRecording = async () => {
    setError(null);
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true; // evita feedback
        await liveVideoRef.current.play().catch(() => {});
      }

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("preview");
        stopStream();
      };
      recorder.start(1000); // chunk ogni secondo
      setSeconds(0);
      intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      setState("recording");
    } catch (err) {
      console.warn("[recorder] getUserMedia error:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Accesso a webcam o microfono negato. Concedi i permessi nelle impostazioni del browser."
          : "Impossibile accedere a webcam/microfono. Controlla che non siano in uso da un'altra app."
      );
      setState("denied");
      stopStream();
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setSeconds(0);
    setState("idle");
  };

  const submit = async () => {
    if (!blobRef.current) return;
    await onSubmit(blobRef.current, seconds);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div>
      <div
        className="relative bg-ink rounded-[3px] overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Video live (shown during requesting + recording) */}
        <video
          ref={liveVideoRef}
          playsInline
          muted
          className={
            "absolute inset-0 w-full h-full object-cover " +
            (state === "recording" || state === "requesting" ? "block" : "hidden")
          }
        />

        {/* Video preview */}
        {state === "preview" && previewUrl && (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            playsInline
            controls
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />
        )}

        {/* Idle state */}
        {state === "idle" && (
          <div className="absolute inset-0 thumb-stripe opacity-30" />
        )}
        {state === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center px-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-5">
              Webcam + microfono pronti
            </div>
            <div className="font-display text-2xl md:text-3xl mb-6 md:mb-8">
              Quando sei <span className="italic-ember">pronto</span>, premi il cerchio.
            </div>
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-[var(--ember)] flex items-center justify-center hover:scale-105 transition shadow-lg"
            >
              <div className="w-6 h-6 bg-white rounded-full" />
            </button>
            <div className="mt-4 flex items-center gap-5 text-[11px] font-mono uppercase tracking-wider text-[#8A8A92]">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="video" size={11} />
                webcam hd
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="mic" size={11} />
                audio stereo
              </span>
            </div>
          </div>
        )}

        {/* Requesting permissions */}
        {state === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center bg-ink/70">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--amber)] mb-3 animate-pulse">
              Richiedo accesso a webcam e microfono…
            </div>
            <div className="text-[12px] text-[#8A8A92]">
              Concedi i permessi nel popup del browser.
            </div>
          </div>
        )}

        {/* Recording overlay */}
        {state === "recording" && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper bg-ink/70 px-2 py-1 rounded-[2px]">
              <span className="w-2 h-2 rounded-full bg-[var(--ember)] animate-pulse" />
              REC · {formatTime(seconds)}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-[var(--ember)] flex items-center justify-center shadow-lg hover:scale-105 transition"
                aria-label="Stop"
              >
                <div className="w-5 h-5 bg-white rounded-[2px]" />
              </button>
              <div className="text-[10px] uppercase tracking-wider font-mono text-paper mt-2 bg-ink/70 px-2 py-0.5 rounded-[2px]">
                Stop
              </div>
            </div>
          </>
        )}

        {/* Denied / error */}
        {state === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center px-8">
            <div className="w-12 h-12 rounded-full bg-[var(--ember)]/20 border border-[var(--ember)]/50 flex items-center justify-center mb-4">
              <Icon name="warning" size={20} className="text-[var(--ember)]" />
            </div>
            <div className="text-[14px] text-paper mb-2 max-w-md">{error}</div>
            <button
              onClick={() => setState("idle")}
              className="mt-4 h-9 px-4 rounded-[2px] border border-line-dark text-[12px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper"
            >
              Riprova
            </button>
          </div>
        )}
      </div>

      {/* Controls preview */}
      {state === "preview" && (
        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-paper-2 border border-line rounded-[3px] px-4 py-3">
          <div className="flex items-center gap-3 text-[13px]">
            <Icon name="check" size={15} className="text-[#7BB07B]" />
            <span>Take pronto · {formatTime(seconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              disabled={uploading}
              className="h-9 px-3 text-[12px] text-smoke hover:text-ink inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Icon name="record" size={12} /> Rifai
            </button>
            <button
              onClick={submit}
              disabled={uploading}
              className="h-9 px-4 rounded-[2px] bg-[var(--ember)] text-white text-[12px] font-display uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[var(--ember-2)] transition disabled:opacity-50"
              style={{ fontWeight: 700 }}
            >
              <Icon name="send" size={12} /> {uploading ? "Carico…" : "Invia a Marco"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
