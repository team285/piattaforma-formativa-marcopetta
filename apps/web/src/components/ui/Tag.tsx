/**
 * Tag — piccola pill mono uppercase. Porting da prototipo.
 */

import { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  dark?: boolean;
}

export function Tag({ children, dark = false }: TagProps) {
  return (
    <span
      className={
        "inline-flex items-center font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm " +
        (dark ? "bg-ink-3 text-[#C9BDB1]" : "bg-[#E3DCCE] text-[#4A4039]")
      }
    >
      {children}
    </span>
  );
}
