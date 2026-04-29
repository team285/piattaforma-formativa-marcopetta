/**
 * WebcamRecorder — registrazione webcam o upload file come fallback.
 *
 * Due modalità:
 *  - record: getUserMedia + MediaRecorder
 *  - upload: drag-drop o file picker per .mp4/.mov/.webm
 *
 * Output unificato: Blob + durata stimata via metadata video.
 */

import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui";

type RecordState = "idle" | "requesting" | "recording" | "preview" | "denied";
type Mode = "record" | "upload";

export type SubmissionSource = "webcam" | "upload";

interface WebcamRecorderProps {
  onSubmit: (
    blob: Blob,
    durationSeconds: number,
    source: SubmissionSource
  ) => Promise<void> | void;
  uploading?: boolean;
}

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

export function WebcamRecorder({ onSubmit, uploading = false }: WebcamRecorderProps) {
  const [mode, setMode] = useState<Mode>("record");
  const [state, setState] = useState<RecordState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFileSize, setUploadFileSize] = useState<number | null>(null);

  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);

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
        liveVideoRef.current.muted = true;
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
        setUploadFileSize(blob.size);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("preview");
        stopStream();
      };
      recorder.start(1000);
      setSeconds(0);
      intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      setState("recording");
    } catch (err) {
      console.warn("[recorder] getUserMedia error:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Accesso a webcam o microfono negato. Concedi i permessi nelle impostazioni del browser."
          : "Impossibile accedere a webcam/microfono. Prova con l'upload file qui sotto."
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

  const handleFile = (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|m4v)$/i)) {
      setError("Formato non supportato. Usa mp4, mov o webm.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File troppo grande (max 500 MB).");
      return;
    }
    blobRef.current = file;
    setUploadFileSize(file.size);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setState("preview");

    // Estrai durata via metadata
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      setSeconds(Math.round(v.duration || 0));
      URL.revokeObjectURL(v.src);
    };
    v.src = url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setSeconds(0);
    setUploadFileSize(null);
    setState("idle");
  };

  const submit = async () => {
    if (!blobRef.current) return;
    await onSubmit(blobRef.current, seconds, mode === "upload" ? "upload" : "webcam");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)} kB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Toggle modalità (solo in idle) */}
      {state === "idle" && (
        <div className="mb-3 inline-flex items-center gap-1 bg-paper-2 border border-line p-1 rounded-[3px]">
          {(
            [
              { id: "record", label: "Registra", icon: "record" },
              { id: "upload", label: "Carica file", icon: "upload" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as Mode)}
              className={
                "h-9 px-4 rounded-[2px] text-[12px] font-medium inline-flex items-center gap-2 transition " +
                (mode === m.id ? "bg-ink text-paper" : "text-smoke hover:text-ink")
              }
            >
              <Icon name={m.icon} size={13} /> {m.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="relative bg-ink rounded-[3px] overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Video live (solo durante recording/requesting) */}
        <video
          ref={liveVideoRef}
          playsInline
          muted
          className={
            "absolute inset-0 w-full h-full object-cover " +
            (state === "recording" || state === "requesting" ? "block" : "hidden")
          }
        />

        {state === "preview" && previewUrl && (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            playsInline
            controls
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />
        )}

        {/* Idle - Record */}
        {state === "idle" && mode === "record" && (
          <>
            <div className="absolute inset-0 thumb-stripe opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center px-6 md:px-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-4 md:mb-5">
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
          </>
        )}

        {/* Idle - Upload (drag-drop) */}
        {state === "idle" && mode === "upload" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={
              "absolute inset-0 flex flex-col items-center justify-center text-paper text-center px-6 md:px-8 transition border-2 border-dashed " +
              (dragOver ? "border-[var(--ember)] bg-[var(--ember)]/10" : "border-[#3A3A40]")
            }
          >
            <div className="w-16 h-16 rounded-full bg-ink-2 border border-line-dark flex items-center justify-center mb-4">
              <Icon name="upload" size={22} className="text-[#8A8A92]" />
            </div>
            <div className="font-display text-2xl md:text-3xl mb-2">
              Trascina qui il tuo <span className="italic-ember">video</span>
            </div>
            <div className="text-[13px] text-[#8A8A92] mb-4">
              oppure{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[var(--ember)] underline hover:text-[var(--ember-2)]"
              >
                scegli un file
              </button>
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6D6D75]">
              mp4 · mov · webm · max 500MB
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*,.mp4,.mov,.webm,.m4v"
              className="hidden"
              onChange={onFilePick}
            />
            {error && (
              <div className="mt-4 text-[12px] text-[var(--ember)] max-w-md">{error}</div>
            )}
          </div>
        )}

        {state === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center bg-ink/70">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--amber)] mb-3 animate-pulse">
              Richiedo accesso a webcam e microfono…
            </div>
            <div className="text-[12px] text-[#8A8A92]">Concedi i permessi nel popup.</div>
          </div>
        )}

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

        {state === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-paper text-center px-6 md:px-8">
            <div className="w-12 h-12 rounded-full bg-[var(--ember)]/20 border border-[var(--ember)]/50 flex items-center justify-center mb-4">
              <Icon name="warning" size={20} className="text-[var(--ember)]" />
            </div>
            <div className="text-[14px] text-paper mb-2 max-w-md">{error}</div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setState("idle");
                }}
                className="h-9 px-4 rounded-[2px] border border-line-dark text-[12px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper"
              >
                Riprova
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setMode("upload");
                  setState("idle");
                }}
                className="h-9 px-4 rounded-[2px] bg-[var(--amber)] text-ink text-[12px] font-mono uppercase tracking-wider hover:bg-[var(--amber-2)]"
              >
                Carica file invece
              </button>
            </div>
          </div>
        )}
      </div>

      {state === "preview" && (
        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-paper-2 border border-line rounded-[3px] px-4 py-3">
          <div className="flex items-center gap-3 text-[13px]">
            <Icon name="check" size={15} className="text-[#7BB07B]" />
            <span>
              Video pronto · {formatTime(seconds)}
              {uploadFileSize ? ` · ${formatSize(uploadFileSize)}` : ""}
            </span>
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
