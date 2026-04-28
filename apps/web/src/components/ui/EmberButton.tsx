/**
 * EmberButton — pulsante primario amber (era "ember" nel naming legacy).
 */

import { ReactNode } from "react";
import { Icon, IconName } from "./Icon";

interface EmberButtonProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  outline?: boolean;
  tone?: "amber" | "gradient" | "red";
}

export function EmberButton({
  children,
  size = "md",
  icon,
  onClick,
  disabled,
  full = false,
  outline = false,
  tone = "amber",
}: EmberButtonProps) {
  const sizeCls =
    size === "sm" ? "h-8 px-3 text-[12px]" : size === "lg" ? "h-12 px-6 text-[14px]" : "h-10 px-4 text-[13px]";

  let base: string;
  if (outline) {
    base = "border border-[var(--amber)] text-[var(--amber)] hover:bg-[var(--amber)] hover:text-black";
  } else if (tone === "gradient") {
    base = "gradient-amber text-black hover:brightness-110";
  } else if (tone === "red") {
    base = "bg-[var(--ember)] text-white hover:bg-[var(--ember-2)]";
  } else {
    base = "bg-[var(--amber)] text-black hover:bg-[var(--amber-2)]";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex items-center justify-center gap-2 font-display tracking-[0.06em] uppercase transition rounded-[2px] " +
        sizeCls +
        " " +
        base +
        (full ? " w-full" : "") +
        (disabled ? " opacity-40 cursor-not-allowed" : "")
      }
      style={{ fontWeight: 700 }}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
}
