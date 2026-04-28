/**
 * Avatar — cerchio con iniziali, palette ink/ember/sand.
 * Porting 1:1 dal prototipo (src/ui.jsx).
 */

interface AvatarProps {
  initials?: string;
  size?: number;
  tone?: "ink" | "ember" | "sand";
  ring?: boolean;
}

export function Avatar({ initials = "MP", size = 36, tone = "ink", ring = false }: AvatarProps) {
  const bg = tone === "ink" ? "var(--ink-3)" : tone === "ember" ? "var(--amber)" : "var(--sand)";
  const fg = tone === "sand" || tone === "ember" ? "var(--ink)" : "var(--paper)";
  return (
    <div
      className={
        "flex items-center justify-center font-display tracking-tight " +
        (ring ? "ring-2 ring-offset-2 ring-[var(--amber)] ring-offset-[var(--ink)]" : "")
      }
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        background: bg,
        color: fg,
        fontSize: size * 0.42,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
}
