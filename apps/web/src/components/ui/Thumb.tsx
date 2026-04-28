/**
 * Thumb — placeholder video con striscia diagonale + etichetta mono.
 */

import { ReactNode } from "react";

interface ThumbProps {
  label?: string;
  dark?: boolean;
  aspect?: string;
  children?: ReactNode;
  className?: string;
  ember?: boolean;
}

export function Thumb({
  label = "video",
  dark = true,
  aspect = "16/9",
  children,
  className = "",
  ember = false,
}: ThumbProps) {
  return (
    <div
      className={"relative overflow-hidden rounded-[3px] " + (dark ? "bg-ink-2" : "bg-sand") + " " + className}
      style={{ aspectRatio: aspect }}
    >
      <div className={"absolute inset-0 " + (dark ? "thumb-stripe" : "thumb-stripe-light") + " opacity-80"} />
      <div className="absolute inset-0 flex items-end p-3">
        <div className={"font-mono text-[10px] tracking-widest uppercase " + (dark ? "text-[#9E8E82]" : "text-[#6B625B]")}>
          {label}
        </div>
      </div>
      {ember && <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-[var(--ember)]" />}
      {children}
    </div>
  );
}
