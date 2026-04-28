/**
 * StatCard — KPI card con etichetta + valore grande + sub.
 * Tre varianti: default (paper-2 + line), ember (sfondo amber), warn (border ember soft).
 * Porting da coach_dashboard.jsx.
 */

import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  ember?: boolean;
  warn?: boolean;
}

export function StatCard({ label, value, sub, ember, warn }: StatCardProps) {
  const base = "border rounded-[3px] p-5 ";
  const cls = ember
    ? "bg-[var(--amber)] text-white border-[var(--amber)]"
    : warn
      ? "bg-paper-2 border-[var(--ember)]/40"
      : "bg-paper-2 border-line";
  const labelCls = ember ? "text-white/70" : warn ? "text-[var(--ember)]" : "text-smoke";
  const subCls = ember ? "text-white/80" : "text-smoke";

  return (
    <div className={base + cls}>
      <div className={"font-mono text-[10px] uppercase tracking-[0.22em] mb-4 " + labelCls}>{label}</div>
      <div className="font-display text-[56px] leading-none">{value}</div>
      {sub && <div className={"text-[12px] mt-2 " + subCls}>{sub}</div>}
    </div>
  );
}
