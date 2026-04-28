/**
 * Waveform — barre SVG decorative + dot annotazioni timeline.
 */

interface WaveformDot {
  t: number;
  color: string;
}

interface WaveformProps {
  dark?: boolean;
  dots?: WaveformDot[];
  className?: string;
  progress?: number;
}

export function Waveform({ dark = true, dots = [], className = "", progress = 0 }: WaveformProps) {
  const bars = 120;
  return (
    <div className={"relative w-full h-14 " + className}>
      <svg viewBox={`0 0 ${bars * 3} 56`} preserveAspectRatio="none" className="w-full h-full">
        {Array.from({ length: bars }).map((_, i) => {
          const h = 6 + Math.abs(Math.sin(i * 0.42) + Math.cos(i * 0.17)) * 20 + (i % 7 === 0 ? 10 : 0);
          const x = i * 3;
          const past = i / bars < progress;
          return (
            <rect
              key={i}
              x={x}
              y={28 - h / 2}
              width={1.6}
              height={h}
              fill={past ? "var(--amber)" : dark ? "#2A2A30" : "#D4C9B6"}
            />
          );
        })}
      </svg>
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{
            left: `calc(${d.t * 100}% - 6px)`,
            background: d.color,
            borderColor: dark ? "#0B0B0D" : "#F5F3ED",
          }}
        />
      ))}
    </div>
  );
}

export function annotationColor(type: string): string {
  if (type === "ok") return "#7BB07B";
  if (type === "tip") return "#F2B744";
  if (type === "warning") return "#E04A3A";
  if (type === "video") return "#D63829";
  return "#9A9AA2";
}
