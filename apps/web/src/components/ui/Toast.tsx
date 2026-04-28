/**
 * Toast — notifica fugace, 3 toni: ok (amber), info (ink), warn (red).
 *
 * Uso: import { toast } from '../components/ui/Toast' poi toast("...", "ok").
 * Va montato MPToastHost una volta sola in App.
 */

import { useEffect, useState } from "react";
import { Icon, IconName } from "./Icon";

type Tone = "ok" | "info" | "warn";
interface ToastEvent {
  id: string;
  message: string;
  tone: Tone;
}

interface PaletteEntry {
  bg: string;
  fg: string;
  icon: IconName;
}

const PALETTE: Record<Tone, PaletteEntry> = {
  warn: { bg: "#E04A3A", fg: "#fff", icon: "warning" },
  info: { bg: "#141417", fg: "#F5F3ED", icon: "bell" },
  ok: { bg: "#F2B744", fg: "#0B0B0D", icon: "check" },
};

export function MPToastHost() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; tone: Tone }>).detail;
      const id = Math.random().toString(36).slice(2);
      const t: ToastEvent = { id, message: detail.message, tone: detail.tone };
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2600);
    };
    window.addEventListener("mp-toast", handler);
    return () => window.removeEventListener("mp-toast", handler);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const palette = PALETTE[t.tone];
        return (
          <div
            key={t.id}
            style={{
              background: palette.bg,
              color: palette.fg,
              padding: "10px 16px",
              borderRadius: 3,
              minWidth: 240,
              maxWidth: 420,
              fontFamily: "'Big Shoulders Display',sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 10px 32px rgba(0,0,0,0.4)",
              animation: "mpToastIn 0.22s ease-out",
            }}
          >
            <Icon name={palette.icon} size={14} />
            <span>{t.message}</span>
          </div>
        );
      })}
      <style>{`@keyframes mpToastIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform:none;} }`}</style>
    </div>
  );
}

/** Imperative API: chiamabile da qualsiasi componente. */
export function toast(message: string, tone: Tone = "ok") {
  window.dispatchEvent(new CustomEvent("mp-toast", { detail: { message, tone } }));
}
