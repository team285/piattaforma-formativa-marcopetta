/**
 * StatusPill — pill colorato con dot + label, mappa stati lezione/esercizio.
 */

export type LessonExerciseStatus =
  | "completed"
  | "in-progress"
  | "new"
  | "assigned"
  | "delivered"
  | "feedback"
  | "archived";

interface StatusPillProps {
  status: LessonExerciseStatus | string;
}

const MAP: Record<string, { label: string; bg: string; fg: string }> = {
  completed: { label: "Completata", bg: "rgba(123,176,123,0.14)", fg: "#7BB07B" },
  "in-progress": { label: "In corso", bg: "rgba(242,183,68,0.18)", fg: "#F2B744" },
  new: { label: "Da guardare", bg: "rgba(242,183,68,0.14)", fg: "#F2B744" },
  assigned: { label: "Da consegnare", bg: "rgba(242,242,242,0.08)", fg: "#9A9AA2" },
  delivered: { label: "Consegnato", bg: "rgba(242,183,68,0.18)", fg: "#F2B744" },
  feedback: { label: "Feedback ricevuto", bg: "rgba(214,56,41,0.14)", fg: "#E04A3A" },
  archived: { label: "Archiviato", bg: "transparent", fg: "#6D6D75" },
};

export function StatusPill({ status }: StatusPillProps) {
  const s = MAP[status] || MAP.new;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="marquee-dot" style={{ background: s.fg, width: 6, height: 6, borderRadius: 99, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
