/**
 * EditorialH — section heading editorial (Fraunces serif).
 */

import { ReactNode } from "react";

interface EditorialHProps {
  kicker?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export function EditorialH({ kicker, children, className = "", dark = false }: EditorialHProps) {
  const headingColor = dark ? "text-paper" : "text-ink";
  return (
    <div className={className}>
      {kicker && (
        <div
          className={
            "font-mono text-[10px] uppercase tracking-[0.22em] mb-3 " +
            (dark ? "text-[var(--amber)]" : "text-smoke")
          }
        >
          {kicker}
        </div>
      )}
      <h2 className={"font-editorial text-4xl md:text-5xl " + headingColor}>{children}</h2>
    </div>
  );
}
