/**
 * MobileNav — topbar + drawer per mobile.
 *
 * Visibile solo sotto md (768px). Contiene hamburger che apre overlay
 * con la sidebar. Sopra md è hidden — la sidebar fissa torna in vista.
 *
 * Generic: accetta `nav` (lista voci) + `branding` + `footer` come props
 * cosi' va bene per coach e student. Title della pagina passato via
 * `title` (mostrato in topbar).
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, IconName, Avatar } from "./ui";
import { useAuth } from "../lib/auth";

export interface MobileNavItem {
  id: string;
  label: string;
  icon: IconName;
  to: string;
}

interface MobileNavProps {
  nav: MobileNavItem[];
  variant: "coach" | "student";
}

export function MobileNav({ nav, variant }: MobileNavProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Chiudi drawer al cambio route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock scroll quando drawer aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = profile?.initials || "—";
  const fullName = profile?.full_name || "—";
  const roleLabel = !profile
    ? "caricamento…"
    : profile.role === "founder"
      ? "fondatore · admin"
      : profile.role === "coach"
        ? "coach"
        : "studente";

  // Trova label pagina corrente per topbar
  const currentNav = nav.find((it) => location.pathname.startsWith(it.to));
  const pageLabel = currentNav?.label ?? "MPCoach";

  return (
    <>
      {/* Topbar mobile (md:hidden) */}
      <div className="md:hidden sticky top-0 z-40 bg-ink text-paper border-b border-line-dark flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          aria-label="Apri menu"
          className="w-10 h-10 -ml-2 flex items-center justify-center text-paper"
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <rect width="20" height="2" rx="1" fill="currentColor" />
            <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
            <rect y="12" width="20" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-[2px] bg-[var(--amber)] flex items-center justify-center font-display text-[15px] text-black flex-shrink-0"
            style={{ fontWeight: 900 }}
          >
            P
          </div>
          <div className="min-w-0">
            <div
              className="font-display text-[15px] leading-none truncate"
              style={{ fontWeight: 700 }}
            >
              {pageLabel}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#9E8E82] mt-0.5">
              {variant === "coach" ? "vista coach" : "vista studente"}
            </div>
          </div>
        </div>
        <Avatar initials={initials} size={32} tone="ember" />
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[9000]" style={{ animation: "fadeIn 0.2s" }}>
          <div
            className="absolute inset-0 bg-ink/70"
            style={{ backdropFilter: "blur(2px)" }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-ink text-paper flex flex-col border-r border-line-dark"
            style={{ animation: "slideInLeft 0.28s cubic-bezier(.2,.7,.2,1)" }}
          >
            {/* Brand */}
            <div className="px-5 pt-5 pb-4 border-b border-line-dark flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-[2px] bg-[var(--amber)] flex items-center justify-center font-display text-xl text-black flex-shrink-0"
                  style={{ fontWeight: 900 }}
                >
                  P
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[17px] leading-none truncate">Marco Petta</div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mt-1">
                    metodo p.g.t.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
                className="w-8 h-8 rounded-full border border-line-dark flex items-center justify-center text-[#C9BDB1] hover:text-paper flex-shrink-0"
              >
                <Icon name="x" size={13} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
              {nav.map((it) => {
                const active = location.pathname.startsWith(it.to);
                return (
                  <Link
                    key={it.id}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={
                      "w-full flex items-center gap-3 px-3 h-11 rounded-[2px] text-left transition " +
                      (active ? "bg-[var(--amber)] text-black" : "text-[#C9BDB1] hover:bg-ink-2")
                    }
                  >
                    <Icon name={it.icon} size={15} />
                    <span className="text-[14px] flex-1" style={active ? { fontWeight: 600 } : {}}>
                      {it.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer profilo + logout */}
            <div className="px-4 py-4 border-t border-line-dark">
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={initials} size={36} tone="ember" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{fullName}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">
                    {roleLabel}
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full h-9 rounded-[2px] border border-line-dark text-[12px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper hover:border-[#4A3A32] transition"
              >
                Esci
              </button>
            </div>
          </aside>

          <style>{`
            @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          `}</style>
        </div>
      )}
    </>
  );
}
